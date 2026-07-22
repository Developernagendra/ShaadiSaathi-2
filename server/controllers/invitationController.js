const { Invitation } = require('../models');

// @desc    Create a new invitation
// @route   POST /api/invitations
// @access  Private
exports.createInvitation = async (req, res, next) => {
  try {
    const { 
      brideName, groomName, weddingDate, weddingTime, 
      venue, city, googleMapLink, customMessage, ourStory, 
      template, coverPhoto, status 
    } = req.body;

    const invitation = await Invitation.create({
      userId: req.user._id,
      brideName,
      groomName,
      weddingDate,
      weddingTime,
      venue,
      city,
      googleMapLink,
      customMessage,
      ourStory,
      template,
      coverPhoto,
      status,
      invitationLink: `inv_${Date.now()}` // Mock unique slug for link
    });

    res.status(201).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user invitations
// @route   GET /api/invitations
// @access  Private
exports.getUserInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({ userId: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invitation
// @route   GET /api/invitations/:id
// @access  Public (for preview/share link)
exports.getInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id).populate('userId', 'name');
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    // Increment views safely
    invitation.analytics.views += 1;
    await invitation.save();

    res.status(200).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update invitation
// @route   PUT /api/invitations/:id
// @access  Private
exports.updateInvitation = async (req, res, next) => {
  try {
    let invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this invitation' });
    }

    invitation = await Invitation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invitation
// @route   DELETE /api/invitations/:id
// @access  Private
exports.deleteInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this invitation' });
    }

    await invitation.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
