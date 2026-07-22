const cron = require('node-cron');
const { NewsletterCampaign, NewsletterSubscriber } = require('../models');
const { sendEmail, getCampaignEmailHTML } = require('../services/emailService');

// Run every minute to check for scheduled campaigns
const initCampaignScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      // Find campaigns scheduled for now or in the past that are still marked as 'scheduled'
      const campaignsToRun = await NewsletterCampaign.find({
        status: 'scheduled',
        scheduledAt: { $lte: new Date() }
      });

      if (campaignsToRun.length > 0) {
        console.log(`[Cron] Found ${campaignsToRun.length} scheduled campaign(s) to send.`);
      }

      for (const campaign of campaignsToRun) {
        // Mark as sending immediately to prevent duplicate runs by next cron tick
        campaign.status = 'sending';
        await campaign.save();

        const activeSubscribers = await NewsletterSubscriber.find({ status: 'active' });

        if (activeSubscribers.length === 0) {
          campaign.status = 'sent';
          campaign.sentAt = Date.now();
          campaign.stats = { totalSent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0 };
          await campaign.save();
          continue;
        }

        // Brevo is verified at startup — no redundant per-campaign check needed

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
            console.error(`[Cron] Failed to send to ${sub.email}:`, err);
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
        console.log(`[Cron] Campaign "${campaign.name}" processed: ${delivered} delivered, ${failed} failed.`);
      }
    } catch (error) {
      console.error('[Cron] Error running campaign scheduler:', error);
    }
  });
  console.log('✅ Campaign Scheduler initialized');
};

module.exports = initCampaignScheduler;
