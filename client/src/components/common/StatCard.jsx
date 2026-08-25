import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon, trend, color = 'blue', onClick }) => {
  const colorSchemes = {
    blue: {
      bg: 'bg-white border-[#a0c396]/30',
      iconBg: 'bg-[#ebf5eb] text-[#1e3a1e] border border-[#a0c396]/30',
      valueColor: 'text-[#1e3a1e]'
    },
    emerald: {
      bg: 'bg-white border-[#a0c396]/30',
      iconBg: 'bg-[#ebf5eb] text-[#3d6b3d] border border-[#a0c396]/30',
      valueColor: 'text-[#2d4a2d]'
    },
    amber: {
      bg: 'bg-white border-amber-200/90',
      iconBg: 'bg-amber-50 text-amber-700 border border-amber-200',
      valueColor: 'text-amber-800'
    },
    rose: {
      bg: 'bg-white border-rose-200/90',
      iconBg: 'bg-rose-50 text-rose-700 border border-rose-200',
      valueColor: 'text-rose-700'
    },
    purple: {
      bg: 'bg-white border-[#a0c396]/30',
      iconBg: 'bg-[#ebf5eb] text-[#2d4a2d] border border-[#a0c396]/30',
      valueColor: 'text-[#1e3a1e]'
    }
  };


  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`p-5 rounded-3xl border shadow-soft ${scheme.bg} ${onClick ? 'cursor-pointer' : ''} relative overflow-hidden transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <div className={`text-2xl sm:text-3xl font-black mt-1 tracking-tight ${scheme.valueColor}`}>
            {value}
          </div>
        </div>

        <div className={`p-3 rounded-2xl ${scheme.iconBg} shadow-2xs flex-shrink-0`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
        <span className="text-slate-500 font-medium text-[11px] truncate">{subtitle}</span>
        {trend && (
          <span className={`font-black text-[10px] ${trend.isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.text}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
