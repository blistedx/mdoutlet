import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { X, Printer, Download, QrCode, Sparkles } from 'lucide-react';

const QrGeneratorModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-slate-200 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-50 text-dairy-blue">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Product QR Sticker</h3>
            <p className="text-[11px] text-slate-500">Scan code to auto-populate product forms</p>
          </div>
        </div>

        {/* Printable Label Card */}
        <div 
          id="printable-qr-sticker"
          className="bg-[#FAF8F5] p-5 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-3"
        >
          <div className="font-black text-xs uppercase tracking-widest text-[#0B4F9C]">
            DAIRY INVENTORY SYSTEM
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-sm">
            <QRCodeSVG
              value={product.qrCode}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#0B4F9C"
            />
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
              {product.name}
            </h4>
            <div className="text-xs font-mono font-black text-dairy-blue mt-0.5">
              {product.qrCode}
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-bold mt-1">
              <span>₹{product.unitPrice} / {product.unit}</span>
              <span>•</span>
              <span className="capitalize">{product.category}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 mt-5">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-[#0B4F9C] hover:bg-[#083D7A] text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print QR Sticker</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default QrGeneratorModal;
