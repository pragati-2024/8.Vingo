import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaSearch, FaUtensils, FaPizzaSlice, FaHamburger, FaIceCream, FaCoffee, FaBacon, FaCloud, FaFire, FaLeaf } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const categoryIcons = {
  "Snacks": <FaBacon className="text-orange-500" />,
  "Main Course": <FaUtensils className="text-blue-500" />,
  "Desserts": <FaIceCream className="text-pink-500" />,
  "Pizza": <FaPizzaSlice className="text-red-500" />,
  "Burgers": <FaHamburger className="text-yellow-600" />,
  "Sandwiches": <FaBacon className="text-green-600" />,
  "South Indian": <FaCloud className="text-gray-500" />,
  "North Indian": <FaFire className="text-orange-600" />,
  "Chinese": <FaLeaf className="text-green-500" />,
  "Fast Food": <FaFire className="text-red-600" />,
  "Others": <FaUtensils className="text-gray-400" />
};

const SearchableCategorySelect = ({ value, onChange, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest text-[10px]">Select Category</label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 ${isOpen ? 'border-[#ff4d2d] shadow-lg shadow-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
      >
        <div className="flex items-center gap-3">
          {value ? (
            <>
              <span className="text-lg">{categoryIcons[value] || <FaUtensils className="text-gray-400" />}</span>
              <span className="font-bold text-gray-800">{value}</span>
            </>
          ) : (
            <span className="text-gray-400 font-medium">Search or select category...</span>
          )}
        </div>
        <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={14} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="p-3 border-b border-gray-50">
              <div className="relative flex items-center">
                <FaSearch className="absolute left-4 text-gray-400" size={14} />
                <input 
                  type="text"
                  placeholder="Filter categories..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ff4d2d]/20 outline-none text-sm font-bold text-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      onChange(cat);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`px-4 py-3 flex items-center gap-4 cursor-pointer transition-colors ${value === cat ? 'bg-orange-50 text-[#ff4d2d]' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <span className="text-xl">{categoryIcons[cat] || <FaUtensils className="text-gray-400" />}</span>
                    <span className="font-black uppercase tracking-tighter text-sm">{cat}</span>
                    {value === cat && <div className="ml-auto w-2 h-2 rounded-full bg-[#ff4d2d]" />}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No categories found 😔</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableCategorySelect;
