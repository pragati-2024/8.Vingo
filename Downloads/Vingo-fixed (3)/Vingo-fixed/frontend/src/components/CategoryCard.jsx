import React from 'react'
import { motion } from 'framer-motion'

function CategoryCard({name,image,onClick}) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className='w-[130px] h-[160px] md:w-[170px] md:h-[210px] rounded-[2rem] shrink-0 overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 cursor-pointer group relative' 
      onClick={onClick}
    >
      <div className='w-full h-[75%] overflow-hidden'>
        <img 
          src={image} 
          alt={name} 
          className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
      </div>
      <div className='h-[25%] flex items-center justify-center px-2 bg-white group-hover:bg-[#fff9f6] transition-colors'>
        <span className='text-xs md:text-sm font-black text-gray-800 uppercase tracking-widest group-hover:text-[#ff4d2d] transition-colors'>
          {name}
        </span>
      </div>
    </motion.div>
  )
}

export default CategoryCard
