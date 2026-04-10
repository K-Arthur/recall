import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export function LoadingOverlay({ message = "Generating..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 gap-5"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{message}</p>
        <p className="text-sm text-foreground-muted mt-1">Powered by AI — this may take a moment</p>
      </div>
    </motion.div>
  );
}
