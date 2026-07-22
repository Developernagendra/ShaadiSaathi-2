import { useEffect, useRef } from 'react';
import { useToaster } from 'react-hot-toast';
import { useNotificationSound } from '../../context/NotificationSoundContext';

export default function ToastSoundListener() {
  const { toasts } = useToaster();
  const { playSound } = useNotificationSound();
  const playedToasts = useRef(new Set());

  useEffect(() => {
    toasts.forEach((toast) => {
      if (!playedToasts.current.has(toast.id)) {
        playedToasts.current.add(toast.id);

        // Don't play sound if toast specifically disables it (optional feature)
        if (toast.sound === false) return;

        // Play specific sound based on toast type or id
        if (toast.type === 'success') {
          playSound('success');
        } else if (toast.type === 'error') {
          playSound('error');
        } else if (toast.id && typeof toast.id === 'string' && toast.id.includes('approval')) {
          playSound('approval');
        } else if (toast.id && typeof toast.id === 'string' && toast.id.includes('lead')) {
          playSound('lead');
        } else {
          playSound('notification');
        }
      }
    });

    // Cleanup memory for removed toasts
    const currentToastIds = new Set(toasts.map(t => t.id));
    playedToasts.current.forEach(id => {
      if (!currentToastIds.has(id)) {
        playedToasts.current.delete(id);
      }
    });

  }, [toasts, playSound]);

  return null;
}
