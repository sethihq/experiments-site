/**
 * Route transition variants for page animations
 * Used with AnimatePresence at the layout level for smooth route transitions
 */

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(10px)",
  },
};

export const pageTransition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};
