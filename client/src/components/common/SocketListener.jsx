import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket } from '../../utils/socket'
import { addNotification } from '../../store/slices/notificationSlice'
import { receiveMessage } from '../../store/slices/chatSlice'
import { updateLocalBooking } from '../../store/slices/bookingSlice'
import toast from 'react-hot-toast'
import { useNotificationSound } from '../../context/NotificationSoundContext'

export default function SocketListener() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const socket = getSocket()

  // Request browser notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [])

  useEffect(() => {
    if (!socket || !user) return

    // Show HTML5 native browser notification
    const showBrowserNotification = (notification) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        } catch (e) {
          console.error('Browser Notification failed:', e);
        }
      }
    }

    // Unified notification receiver
    const handleNewNotification = (notification) => {
      // 1. Save in Redux
      dispatch(addNotification(notification))

      // 2. Determine ID based on type for the toast listener
      let toastId = 'notification';
      if (notification.type === 'lead') toastId = 'lead';
      else if (notification.type === 'booking_status') toastId = 'success';

      // 3. Show Toast
      toast(notification.title, {
        id: toastId,
        icon: '🔔',
        position: 'bottom-right',
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        }
      })

      // 4. Show browser native pop-up
      showBrowserNotification(notification)
    }

    // Listeners for both formats
    socket.on('newNotification', handleNewNotification)
    socket.on('new_notification', handleNewNotification)

    // Listen for new chat messages
    socket.on('new_message', (data) => {
      dispatch(receiveMessage(data))
      
      // Only show toast if not on the chat page
      if (window.location.pathname !== '/chat') {
        toast(`New message from ${data.message.sender?.name || 'User'}`, {
          icon: '💬',
          position: 'bottom-right'
        })
      }
    })

    // Listen for booking updates
    socket.on('booking_updated', ({ booking }) => {
      toast.success(`Booking #${booking.bookingId} ${booking.status}`, {
        icon: '📅',
        position: 'bottom-right'
      })
      dispatch(updateLocalBooking(booking))
    })

    socket.on('bookingUpdated', (booking) => {
      toast.success(`Booking #${booking.bookingId} ${booking.status}`, {
        icon: '📅',
        position: 'bottom-right'
      })
      dispatch(updateLocalBooking(booking))
    })

    // Listen for new bookings (Vendor/Admin)
    socket.on('new_booking', ({ booking }) => {
      toast.success(`New Booking Received! #${booking.bookingId}`, {
        icon: '✨',
        position: 'bottom-right'
      })
    })

    return () => {
      socket.off('newNotification', handleNewNotification)
      socket.off('new_notification', handleNewNotification)
      socket.off('new_message')
      socket.off('booking_updated')
      socket.off('bookingUpdated')
      socket.off('new_booking')
    }
  }, [socket, user, dispatch])

  return null
}
