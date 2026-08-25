import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, subtitle, icon, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className={`bg-white rounded-3xl ${maxWidth} w-full p-6 sm:p-7 text-slate-900 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start gap-3 pb-4 border-b border-slate-100 mb-5">
            {icon && (
              <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0B4F9C] flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="font-extrabold text-lg text-slate-900 leading-snug">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
        )}

        {/* Body */}
        {children}
      </motion.div>
    </div>
  );
};

export default Modal;
