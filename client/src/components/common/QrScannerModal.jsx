import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, CheckCircle2, AlertCircle, RefreshCw, Zap, Type } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [scannerStarted, setScannerStarted] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setScannedSuccess(false);
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  const startScanner = async () => {
    try {
      const element = document.getElementById('qr-reader-target');
      if (!element) return;

      const html5QrCode = new Html5Qrcode('qr-reader-target');
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleSuccess(decodedText);
        },
        (errorMessage) => {
          // Continuous frame parse errors can be safely ignored
        }
      );
      setScannerStarted(true);
    } catch (err) {
      console.warn('Camera scan initialization failed:', err);
      setErrorMsg('Camera access unavailable or blocked. Please type the QR/Product Code manually below.');
      setScannerStarted(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
    }
    setScannerStarted(false);
  };

  const handleSuccess = (rawQrText) => {
    let cleanCode = rawQrText.trim();

    // Try parsing JSON if encoded as structured payload
    try {
      if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
        const parsed = JSON.parse(cleanCode);
        cleanCode = parsed.qrCode || parsed.id || cleanCode;
      }
    } catch (e) {
      // Keep string as-is
    }

    setScannedSuccess(true);
    stopScanner();
    addToast(`QR Scanned: "${cleanCode}"`, 'success');

    setTimeout(() => {
      onScanSuccess(cleanCode);
      onClose();
    }, 600);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleSuccess(manualCode.trim().toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-dairy-blue">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Scan Product QR Code</h3>
              <p className="text-[11px] text-slate-500">Align QR code within the target frame</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square flex items-center justify-center border-2 border-slate-200 mb-4">
          {/* Target Element for Html5Qrcode */}
          <div id="qr-reader-target" className="w-full h-full"></div>

          {/* Animated Scanning Laser Overlay */}
          {scannerStarted && !scannedSuccess && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Corner Reticle Frames */}
              <div className="w-60 h-60 border-2 border-dashed border-cyan-400/80 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>

                {/* Laser Line */}
                <div className="absolute left-2 right-2 h-0.5 bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-scan-laser"></div>
              </div>
              <span className="text-[10px] font-bold text-cyan-300 bg-black/60 px-3 py-1 rounded-full mt-3 backdrop-blur-xs">
                Position Dairy QR Code in Frame
              </span>
            </div>
          )}

          {/* Success Flash Animation */}
          {scannedSuccess && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-emerald-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 z-20"
            >
              <CheckCircle2 className="w-16 h-16 text-white animate-bounce" />
              <span className="font-black text-sm">Product Code Detected!</span>
            </motion.div>
          )}

          {/* Camera Error / Fallback UI */}
          {errorMsg && (
            <div className="p-6 text-center text-slate-300 space-y-3 z-10">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-300 max-w-xs mx-auto">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Fallback Manual Code Input */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <span>Or Enter QR / Product Code Manually:</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. DAIRY-MLK-1001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-dairy-blue"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2.5 bg-dairy-blue hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Apply
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default QrScannerModal;
