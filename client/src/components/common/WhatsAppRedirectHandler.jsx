import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

export default function WhatsAppRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isProcessing) return;

    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const vendorId = params.get('vendorId');

    if (action === 'whatsapp' && vendorId) {
      setIsProcessing(true);

      const fetchContact = async () => {
        try {
          // Show loading toast
          toast.loading('Connecting to WhatsApp...', { id: 'wa-redirect' });
          
          const api = await import('../../utils/api').then(m => m.default);
          const res = await api.get(`/vendors/${vendorId}/contact`);
          
          if (res.data?.success && res.data?.whatsappNumber) {
            toast.success('Redirecting...', { id: 'wa-redirect' });
            
            let phone = res.data.whatsappNumber.replace(/[^0-9]/g, '');
            if (phone.length === 10) phone = `91${phone}`;
            
            // Clean up the URL so it doesn't fire again on refresh
            const newSearch = new URLSearchParams(location.search);
            newSearch.delete('action');
            newSearch.delete('vendorId');
            navigate({ pathname: location.pathname, search: newSearch.toString() }, { replace: true });
            
            // Redirect
            const encodedMsg = res.data.encodedMessage || encodeURIComponent("Hello, I found your service on ShaadiSaathi and I am interested in your wedding services.");
            window.location.href = `https://wa.me/${phone}?text=${encodedMsg}`;
          } else {
            toast.error('WhatsApp number not available.', { id: 'wa-redirect' });
            setIsProcessing(false);
          }
        } catch (err) {
          console.error('WhatsApp redirect error:', err);
          toast.error('Failed to get contact details.', { id: 'wa-redirect' });
          setIsProcessing(false);
        }
      };

      fetchContact();
    }
  }, [isAuthenticated, location, navigate, isProcessing]);

  return null;
}
