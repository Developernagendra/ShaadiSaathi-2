const { Notification, User } = require('../models');
const { sendEmail, emailTemplates } = require('./emailService');
const { getSocket } = require('../utils/socket');

/**
 * Send a general real-time notification
 */
const sendNotification = async ({ recipient, sender, type, title, message, link, data }) => {
  try {
    const { Notification } = require('../models/index');

    // Save to database
    const notification = await Notification.create({
      recipient,
      sender,
      type: type || 'system',
      title,
      message,
      link,
      data,
      isRead: false
    });

    // Real-time Socket.io Emit
    const socketUtil = require('../utils/socket');
    const io = socketUtil.getSocket();
    if (io) {
      // Emit to recipient's room
      io.to(`user_${recipient}`).emit('newNotification', notification);
      io.to(`user_${recipient}`).emit('new_notification', notification);

      // Emit to raw recipient string room
      io.to(recipient.toString()).emit('newNotification', notification);
      io.to(recipient.toString()).emit('new_notification', notification);

      // If recipient is admin, also notify the 'admin' role-based room
      const recipientUser = await User.findById(recipient);
      if (recipientUser && recipientUser.role === 'admin') {
        io.to('admin').emit('newNotification', notification);
        io.to('admin').emit('new_notification', notification);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Send booking status notification via all channels
 */
const sendBookingNotification = async ({ user, userId: passedUserId, booking: passedBooking, type, status }) => {
  try {
    const { Booking } = require('../models/index');
    const userId = passedUserId || user?._id || user;
    const recipient = await User.findById(userId);
    if (!recipient) return;

    // Fetch a fully populated booking from the database so that we have all accurate dynamic data
    const booking = await Booking.findById(passedBooking._id || passedBooking)
      .populate('service')
      .populate('vendor')
      .populate('cab')
      .populate('cabIds')
      .populate('vendorProfileId');

    if (!booking) return;

    // Determine correct dynamic booked item name
    let serviceName = booking.serviceName || 'Wedding Service';

    if (!booking.serviceName) {
      if ((booking.bookingType === 'cab' || booking.bookingType === 'baraat-cab') && (booking.cab || (booking.cabIds && booking.cabIds[0]))) {
        const cabObj = booking.cab || booking.cabIds[0];
        serviceName =
          cabObj.brand ||
          cabObj.model ||
          cabObj.vehicleName ||
          cabObj.name ||
          'Baraat Cab';
      } else if (booking.bookingType === 'service' && booking.service) {
        serviceName =
          booking.service.title ||
          booking.service.name ||
          (booking.service.category && (booking.service.category.name || booking.service.category)) ||
          'Wedding Service';
      } else if (booking.vendorProfileId) {
        serviceName = booking.vendorProfileId.businessName || 'Wedding Service';
      }
    }

    // Attach serviceName so other helper functions can read it easily
    booking.serviceName = serviceName;

    // 1. Create In-App Notification and Emit via Socket.io
    const title = getNotificationTitle(type, status, booking);
    const message = getNotificationMessage(type, status, booking);

    const notification = await sendNotification({
      recipient: userId,
      sender: booking.userId,
      type: 'booking_status',
      title,
      message,
      link: '/dashboard/my-bookings',
      data: { bookingId: booking._id, type, status }
    });

    // 2. Send Email (Async)
    sendEmailNotification(recipient, booking, type, status).catch(console.error);

    // 3. Send SMS (Async - Mocked)
    sendSMSNotification(recipient, booking, type, status).catch(console.error);

    return notification;
  } catch (error) {
    console.error('Notification Service Error:', error);
    // Do not throw error to avoid breaking the booking flow
  }
};

const getNotificationTitle = (type, status, booking) => {
  const prefix = type === 'cab' ? 'Baraat Cab' : 'Service';
  switch (status) {
    case 'confirmed': return `✅ ${prefix} Booking Confirmed!`;
    case 'cancelled': return `❌ ${prefix} Booking Cancelled`;
    case 'completed': return `🎉 ${prefix} Service Completed`;
    case 'rejected': return `⚠️ ${prefix} Booking Rejected`;
    default: return `${prefix} Booking Update`;
  }
};

const getNotificationMessage = (type, status, booking) => {
  const serviceName = booking.serviceName || (booking.vehicles ? `Baraat Cab (${booking.vehicles[0].vehicleType})` : 'Wedding Service');
  switch (status) {
    case 'confirmed': return `Great news! Your booking for ${serviceName} (#${booking.bookingId}) has been confirmed.`;
    case 'cancelled': return `Your booking for ${serviceName} (#${booking.bookingId}) has been cancelled.`;
    case 'completed': return `Thank you for choosing ShaadiSaathi! Your service for ${serviceName} is now complete.`;
    case 'rejected': return `We're sorry, your booking request for ${serviceName} (#${booking.bookingId}) was not accepted by the vendor.`;
    default: return `The status of your booking #${booking.bookingId} has been updated to ${status}.`;
  }
};

const sendEmailNotification = async (user, booking, type, status) => {
  const serviceName = booking.serviceName || (booking.vehicles ? `Baraat Cab (${booking.vehicles[0].vehicleType})` : 'Wedding Service');

  const bookingPayload = {
    bookingId: booking.bookingId || "N/A",
    customerName: user.name || "Customer",
    customerEmail: user.email || "Not Provided",
    customerPhone: user.phone || "Not Provided",
    vendorName: booking.vendorProfileId?.businessName || booking.vendor?.businessName || 'ShaadiSaathi Vendor',
    serviceName: serviceName || "Wedding Service",
    eventDate: booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN') : "To Be Confirmed",
    eventTime: booking.eventTime || "TBD",
    eventLocation: booking.eventVenue || booking.eventCity || booking.pickupLocation?.city || "TBD",
    bookingAmount: booking.totalPrice || booking.amount || 0,
    bookingStatus: status || "updated"
  };

  console.log("[EMAIL PAYLOAD] sendEmailNotification:", bookingPayload);

  const template = emailTemplates.bookingStatusUpdate(user.name, bookingPayload);
  return sendEmail({
    to: user.email,
    ...template
  });
};

const sendSMSNotification = async (user, booking, type, status) => {
  if (!user.phone) return;

  const message = `ShaadiSaathi: Your booking #${booking.bookingId} for ${type === 'cab' ? 'Baraat Cab' : 'Service'} is now ${status.toUpperCase()}. Check dashboard for details.`;

  // Production: Integration with Twilio/Gupshup here
  console.log(`📱 SMS Sent to ${user.phone}: ${message}`);
};

module.exports = { sendBookingNotification, sendNotification };
