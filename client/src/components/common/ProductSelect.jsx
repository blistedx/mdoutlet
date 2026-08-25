import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus, AlertCircle, Camera, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductSelect = ({
  products = [],
  selectedProductId = '',
  onSelectProduct,
  label = 'Select Dairy Product',
  placeholder = 'Type to write or search product name...',
  required = false,
  showStock = false,
  showScanner = false,
  onOpenScanner,
  accentColor = 'blue',
  filterOutOutOfStock = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  // Sync search term with selected product name when not open
  useEffect(() => {
    if (selectedProduct) {
      setSearchTerm(selectedProduct.name);
    } else if (!isOpen) {
      setSearchTerm('');
    }
  }, [selectedProductId, selectedProduct, isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (selectedProduct) {
          setSearchTerm(selectedProduct.name);
        } else {
          setSearchTerm('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedProduct]);

  const filteredProducts = products.filter((prod) => {
    if (filterOutOutOfStock && prod.currentQuantity <= 0) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      prod.name?.toLowerCase().includes(term) ||
      prod.category?.toLowerCase().includes(term) ||
      prod.qrCode?.toLowerCase().includes(term) ||
      prod.unit?.toLowerCase().includes(term)
    );
  });

  const handleSelect = (prod) => {
    onSelectProduct(prod);
    setSearchTerm(prod ? prod.name : '');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelectProduct(null);
    setSearchTerm('');
    if (inputRef.current) inputRef.current.focus();
  };

  const ringColors = {
    blue: 'focus:ring-[#1e3a1e] border-[#a0c396]/40',
    emerald: 'focus:ring-[#2d4a2d] border-[#a0c396]/40',
    rose: 'focus:ring-rose-500 border-rose-200',
    amber: 'focus:ring-amber-500 border-amber-200'
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black text-[#1e3a1e] uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {showScanner && onOpenScanner && (
          <button
            type="button"
            onClick={onOpenScanner}
            className="px-2.5 py-1 bg-[#ebf5eb] hover:bg-[#d8e8d8] text-[#1e3a1e] border border-[#a0c396]/40 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors"
          >
            <Camera className="w-3 h-3 text-[#6a9c6a]" />
            <span>Scan QR</span>
          </button>
        )}
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            required={required && !selectedProductId}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full pl-9 pr-16 py-2.5 bg-[#f4f8f2] border border-[#a0c396]/40 rounded-xl text-xs font-bold text-[#1e3a1e] focus:outline-none focus:ring-2 ${ringColors[accentColor] || 'focus:ring-[#1e3a1e]'} focus:bg-white transition-all`}
          />
          <div className="absolute right-2 flex items-center gap-1">
            {selectedProduct && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#a0c396]/40 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
            {products.length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-[#1e3a1e]">Catalog is currently empty</p>
                <p className="text-[11px] text-[#3f5a3f]">No dairy products have been added yet.</p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a1e] hover:bg-[#2d4a2d] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-[#1e3a1e]/15"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Product in Catalog</span>
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs font-bold text-[#1e3a1e]">No matching product for "{searchTerm}"</p>
                <p className="text-[11px] text-[#3f5a3f]">Want to create this new product?</p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a1e] hover:bg-[#2d4a2d] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-[#1e3a1e]/15"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add "{searchTerm}" to Catalog</span>
                </Link>
              </div>
            ) : (

              filteredProducts.map((prod) => {
                const isSelected = prod._id === selectedProductId;
                const isOut = prod.currentQuantity <= 0;
                return (
                  <button
                    key={prod._id}
                    type="button"
                    onClick={() => handleSelect(prod)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-blue-50/70' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {prod.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                          {prod.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="capitalize">{prod.category}</span>
                        <span>•</span>
                        <span>QR: {prod.qrCode}</span>
                        <span>•</span>
                        <span>Price: ₹{prod.unitPrice}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {showStock && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOut
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : `${prod.currentQuantity || 0} in stock`}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-[#0B4F9C]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Selected Product Details Pill */}
      {selectedProduct && (
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-bold gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Category:</span>
            <span className="capitalize text-[#0B4F9C]">{selectedProduct.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Unit:</span>
            <span>{selectedProduct.unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Cost:</span>
            <span>₹{selectedProduct.costPrice || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Selling Price:</span>
            <span className="text-emerald-700">₹{selectedProduct.unitPrice || 0}</span>
          </div>
          {showStock && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Available:</span>
              <span className={selectedProduct.currentQuantity <= 0 ? 'text-rose-600' : 'text-emerald-700'}>
                {selectedProduct.currentQuantity || 0} {selectedProduct.unit}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSelect;
