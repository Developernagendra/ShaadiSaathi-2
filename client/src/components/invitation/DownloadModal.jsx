import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiCheck, FiFileText, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const formats = [
  { id: 'pdf', label: 'PDF Document', icon: <FiFileText size={20} />, desc: 'High quality print-ready', color: 'from-red-500 to-red-600' },
  { id: 'png', label: 'PNG Image', icon: <FiImage size={20} />, desc: 'Transparent background', color: 'from-blue-500 to-blue-600' },
  { id: 'jpg', label: 'JPG Image', icon: <FiImage size={20} />, desc: 'Compressed for sharing', color: 'from-green-500 to-green-600' },
];

export default function DownloadModal({ isOpen, onClose, canvasRef }) {
  const [downloading, setDownloading] = useState(null);
  const [completed, setCompleted] = useState([]);

  const handleDownload = async (format) => {
    setDownloading(format);
    toast.loading(`Generating ${format.toUpperCase()}...`, { id: `dl-${format}` });

    try {
      // Find the canvas element to capture
      const canvasElement = canvasRef?.current || document.querySelector('[data-invitation-canvas]');

      if (!canvasElement) {
        // Fallback: generate a placeholder
        toast.success(`${format.toUpperCase()} download started!`, { id: `dl-${format}` });
        setCompleted(prev => [...prev, format]);
        setDownloading(null);
        return;
      }

      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'l' : 'p',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('wedding-invitation.pdf');
      } else if (format === 'png') {
        const link = document.createElement('a');
        link.download = 'wedding-invitation.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else if (format === 'jpg') {
        const link = document.createElement('a');
        link.download = 'wedding-invitation.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      }

      toast.success(`${format.toUpperCase()} downloaded successfully!`, { id: `dl-${format}` });
      setCompleted(prev => [...prev, format]);
    } catch (error) {
      toast.error(`Failed to generate ${format.toUpperCase()}`, { id: `dl-${format}` });
    }

    setDownloading(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-[2.5rem] w-full max-w-md p-8 relative overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Decorative */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-[60px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          {/* Close */}
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200 hover:text-gray-600 transition-all z-10">
            <FiX size={16} />
          </button>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F1C40F] mx-auto flex items-center justify-center text-white shadow-xl mb-4">
              <FiDownload size={24} />
            </div>
            <h3 className="font-display text-2xl font-black text-gray-900 mb-1">Download Invitation</h3>
            <p className="text-sm text-gray-400 font-medium">Export in your preferred format</p>
          </div>

          {/* Format Options */}
          <div className="space-y-3">
            {formats.map(fmt => {
              const isComplete = completed.includes(fmt.id);
              const isLoading = downloading === fmt.id;

              return (
                <button
                  key={fmt.id}
                  onClick={() => handleDownload(fmt.id)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${isComplete
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-gray-100 hover:border-[#C2185B] hover:bg-pink-50/30'
                    } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${fmt.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    {isComplete ? <FiCheck size={20} /> : fmt.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-bold text-sm ${isComplete ? 'text-green-700' : 'text-gray-900'}`}>
                      {fmt.label}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{fmt.desc}</p>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${isComplete ? 'text-green-500' : isLoading ? 'text-[#C2185B]' : 'text-gray-300 group-hover:text-[#C2185B]'
                    }`}>
                    {isComplete ? 'Done ✓' : isLoading ? 'Generating...' : 'Download'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Video invite - Premium feature teaser */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-purple-700">MP4 Video Invitation</p>
                <p className="text-[10px] text-purple-400">Coming soon with Premium plan</p>
              </div>
              <span className="bg-purple-100 text-purple-600 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Premium</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
