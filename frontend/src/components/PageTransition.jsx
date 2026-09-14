import React from 'react';
import { motion } from 'framer-motion';

export default function PageTransition({ children }) {
  return (
    <motion.div
      // Starts slightly lower, faded out, with a tiny blur
      initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
      
      // Animates to full opacity, natural position, and sharp focus
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      
      // When navigating away, it fades out and moves slightly up
      exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
      
      transition={{ 
        type: 'tween', 
        ease: 'circOut', 
        duration: 0.4 
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}