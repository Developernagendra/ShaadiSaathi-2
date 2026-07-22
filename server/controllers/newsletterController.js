const { NewsletterSubscriber, NewsletterCampaign } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendEmail, getWelcomeEmailHTML, getCampaignEmailHTML } = require('../services/emailService');

// ==================== SUBSCRIBER ENDPOINTS ====================

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = catchAsync(async (req, res, next) => {
  const { email, source } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  const existingSubscriber = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });

  if (existingSubscriber) {
    if (existingSubscriber.status === 'unsubscribed') {
      existingSubscriber.status = 'active';
      existingSubscriber.subscribedAt = Date.now();
      await existingSubscriber.save();
      
      try {
        await sendEmail({
          email: existingSubscriber.email,
          subject: 'Welcome back to ShaadiSaathi 💍',
          html: getWelcomeEmailHTML(existingSubscriber.email)
        });
      } catch (err) {
        console.error('[EMAIL] Failed to send welcome back email (non-fatal):', err.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully re-subscribed to the newsletter!'
      });
    } else {
      return next(new AppError('You are already subscribed to our newsletter.', 400));
    }
  }

  const subscriber = await NewsletterSubscriber.create({
    email,
    source: source || 'footer'
  });

  try {
    await sendEmail({
      email: subscriber.email,
      subject: 'Welcome to ShaadiSaathi 💍',
      html: getWelcomeEmailHTML(subscriber.email)
    });
  } catch (err) {
    console.error('[EMAIL] Failed to send welcome email (non-fatal):', err.message);
  }

  res.status(201).json({
    success: true,
    message: 'Subscription successful.',
    data: { subscriber }
  });
});

// @desc    Unsubscribe from newsletter
// @route   GET /api/newsletter/unsubscribe?email=...
// @access  Public
exports.unsubscribe = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return next(new AppError('Email parameter is required', 400));
  }

  const subscriber = await NewsletterSubscriber.findOneAndUpdate(
    { email: email.toLowerCase() },
    { status: 'unsubscribed' },
    { new: true }
  );

  if (!subscriber) {
    return next(new AppError('No subscriber found with that email address.', 404));
  }

  res.status(200).json({
    success: true,
    message: 'You have been successfully unsubscribed from the newsletter.'
  });
});

// @desc    Get all subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
exports.getSubscribers = catchAsync(async (req, res, next) => {
  const subscribers = await NewsletterSubscriber.find().sort('-createdAt');

  res.status(200).json({
    success: true,
    count: subscribers.length,
    data: { subscribers }
  });
});

// @desc    Delete subscriber
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
exports.deleteSubscriber = catchAsync(async (req, res, next) => {
  const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);

  if (!subscriber) {
    return next(new AppError('No subscriber found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: null
  });
});

// ==================== CAMPAIGN ENDPOINTS ====================

// @desc    Get all campaigns
// @route   GET /api/newsletter/campaigns
// @access  Private/Admin
exports.getCampaigns = catchAsync(async (req, res, next) => {
  const campaigns = await NewsletterCampaign.find()
    .populate('createdBy', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: campaigns.length,
    data: { campaigns }
  });
});

// @desc    Get a single campaign
// @route   GET /api/newsletter/campaigns/:id
// @access  Private/Admin
exports.getCampaign = catchAsync(async (req, res, next) => {
  const campaign = await NewsletterCampaign.findById(req.params.id);
  if (!campaign) {
    return next(new AppError('No campaign found with that ID', 404));
  }
  res.status(200).json({
    success: true,
    data: { campaign }
  });
});

// @desc    Create a new campaign (draft)
// @route   POST /api/newsletter/campaigns
// @access  Private/Admin
exports.createCampaign = catchAsync(async (req, res, next) => {
  const { name, subject, content, bannerUrl } = req.body;

  if (!subject || !content) {
    return next(new AppError('Please provide subject and content for the campaign.', 400));
  }

  const campaign = await NewsletterCampaign.create({
    name: name || subject,
    subject,
    content,
    bannerUrl,
    status: 'draft',
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: { campaign }
  });
});

// @desc    Update a campaign
// @route   PATCH /api/newsletter/campaigns/:id
// @access  Private/Admin
exports.updateCampaign = catchAsync(async (req, res, next) => {
  const campaign = await NewsletterCampaign.findById(req.params.id);
  if (!campaign) {
    return next(new AppError('No campaign found with that ID', 404));
  }

  if (campaign.status === 'sent' || campaign.status === 'sending') {
    return next(new AppError('Cannot edit a campaign that is already sent or sending', 400));
  }

  const { name, subject, content, bannerUrl, status, scheduledAt } = req.body;

  if (name) campaign.name = name;
  if (subject) campaign.subject = subject;
  if (content) campaign.content = content;
  if (bannerUrl !== undefined) campaign.bannerUrl = bannerUrl;
  
  if (status && ['draft', 'scheduled'].includes(status)) {
    campaign.status = status;
  }
  
  if (scheduledAt && status === 'scheduled') {
    campaign.scheduledAt = new Date(scheduledAt);
  }

  await campaign.save();

  res.status(200).json({
    success: true,
    data: { campaign }
  });
});

// @desc    Delete a campaign
// @route   DELETE /api/newsletter/campaigns/:id
// @access  Private/Admin
exports.deleteCampaign = catchAsync(async (req, res, next) => {
  const campaign = await NewsletterCampaign.findById(req.params.id);
  if (!campaign) {
    return next(new AppError('No campaign found with that ID', 404));
  }

  if (campaign.status === 'sending') {
    return next(new AppError('Cannot delete a campaign that is currently sending', 400));
  }

  await NewsletterCampaign.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: null
  });
});

// @desc    Send a test email for a campaign
// @route   POST /api/newsletter/campaigns/:id/test
// @access  Private/Admin
exports.sendTestEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide a test email address.', 400));
  }

  const campaign = await NewsletterCampaign.findById(req.params.id);
  if (!campaign) {
    return next(new AppError('No campaign found with that ID', 404));
  }

  // Brevo is verified at server startup — no need to re-verify on every test send

  try {
    await sendEmail({
      to: email,
      subject: `[TEST] ${campaign.subject}`,
      html: getCampaignEmailHTML('test@example.com', campaign.subject, campaign.content, campaign.bannerUrl)
    });
  } catch (err) {
    return next(new AppError(`Failed to send test email: ${err.message}`, 500));
  }

  campaign.testEmailSentTo = email;
  await campaign.save();

  res.status(200).json({
    success: true,
    message: `Test email successfully sent to ${email}`
  });
});

// @desc    Send campaign email to all active subscribers now
// @route   POST /api/newsletter/campaigns/:id/send
// @access  Private/Admin
exports.sendCampaignNow = catchAsync(async (req, res, next) => {
  const campaign = await NewsletterCampaign.findById(req.params.id);
  if (!campaign) {
    return next(new AppError('No campaign found with that ID', 404));
  }

  if (campaign.status === 'sent' || campaign.status === 'sending') {
    return next(new AppError('Campaign has already been sent or is currently sending', 400));
  }

  const activeSubscribers = await NewsletterSubscriber.find({ status: 'active' });

  if (activeSubscribers.length === 0) {
    return next(new AppError('No active subscribers to send the campaign to.', 404));
  }

  // Brevo is verified at server startup — no need to re-verify on every campaign dispatch

  // Set status to sending
  campaign.status = 'sending';
  await campaign.save();

  // Send response to client immediately (background processing)
  res.status(200).json({
    success: true,
    message: `Campaign is now being sent to ${activeSubscribers.length} active subscribers.`
  });

  // Background sending logic
  let delivered = 0;
  let failed = 0;

  const emailPromises = activeSubscribers.map(async (sub) => {
    try {
      await sendEmail({
        email: sub.email,
        subject: campaign.subject,
        html: getCampaignEmailHTML(sub.email, campaign.subject, campaign.content, campaign.bannerUrl)
      });
      delivered++;
    } catch (err) {
      failed++;
      console.error(`Failed to send to ${sub.email}:`, err);
    }
  });

  await Promise.allSettled(emailPromises);

  // Update campaign stats
  if (delivered === 0 && failed > 0) {
    campaign.status = 'failed';
  } else if (failed > 0 && delivered > 0) {
    campaign.status = 'partial_success';
  } else {
    campaign.status = 'sent';
  }
  
  campaign.sentAt = Date.now();
  campaign.stats = {
    totalSent: activeSubscribers.length,
    delivered,
    failed,
    opened: 0,
    clicked: 0
  };
  await campaign.save();
});
