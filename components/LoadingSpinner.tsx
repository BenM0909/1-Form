'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 40, color = '#4F46E5' }: LoadingSpinnerProps) {
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const dotVariants = {
    initial: { opacity: 0.4, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  };

  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut',
  };

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      variants={containerVariants}
      animate="animate"
    >
      {[...Array(8)].map((_, index) => (
        <motion.span
          key={index}
          style={{
            position: 'absolute',
            width: size / 5,
            height: size / 5,
            borderRadius: '50%',
            backgroundColor: color,
            transform: `rotate(${index * 45}deg) translate(${size / 2 - size / 10}px)`,
          }}
          variants={dotVariants}
          animate="animate"
          initial="initial"
          transition={{
            ...dotTransition,
            delay: index * 0.075,
          }}
        />
      ))}
    </motion.div>
  );
}

