import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface RollingNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  showDecimals?: boolean;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  prefix = '$ ',
  suffix = '',
  className = '',
  showDecimals = false,
}) => {
  const spring = useSpring(value, {
    mass: 0.7,
    stiffness: 85,
    damping: 16,
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  const display = useTransform(spring, (latest) => {
    const formatted = Math.round(latest).toLocaleString('es-AR', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  return (
    <motion.span className={`font-impact-num inline-block ${className}`}>
      {display}
    </motion.span>
  );
};
