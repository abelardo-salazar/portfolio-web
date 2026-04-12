"use client";

import { motion } from "framer-motion";
import { Mouse } from "lucide-react";
import { scrollToSection } from "@/utils/scroll-to-section";

interface ScrollIndicatorProps {
  targetId: string;
}

export const ScrollIndicator = ({ targetId }: ScrollIndicatorProps) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-base-content hover:text-primary transition-colors"
      onClick={(e) => scrollToSection(e, `#${targetId}`)}
      aria-label="Scroll to next section"
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Mouse className="w-6 h-6" />
      </motion.div>
    </motion.button>
  );
};
