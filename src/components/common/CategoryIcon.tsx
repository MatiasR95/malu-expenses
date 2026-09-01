import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = '',
  size = 20,
  color,
}) => {
  // Try to find icon in Lucide
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string; color?: string }>>)[name];

  if (IconComponent) {
    return <IconComponent size={size} className={className} color={color} />;
  }

  // Fallbacks for known category names or default
  switch (name.toLowerCase()) {
    case 'verduleria':
      return <Icons.Salad size={size} className={className} color={color} />;
    case 'fruteria':
      return <Icons.Apple size={size} className={className} color={color} />;
    case 'carniceria':
      return <Icons.Beef size={size} className={className} color={color} />;
    case 'huevos':
      return <Icons.Egg size={size} className={className} color={color} />;
    case 'supermercado':
      return <Icons.ShoppingCart size={size} className={className} color={color} />;
    case 'alquiler':
      return <Icons.Home size={size} className={className} color={color} />;
    case 'expensas':
      return <Icons.Building2 size={size} className={className} color={color} />;
    case 'combustible':
      return <Icons.Fuel size={size} className={className} color={color} />;
    case 'subscripciones':
      return <Icons.Tv size={size} className={className} color={color} />;
    case 'salidas':
      return <Icons.UtensilsCrossed size={size} className={className} color={color} />;
    case 'tarjetas':
      return <Icons.CreditCard size={size} className={className} color={color} />;
    case 'gym':
    case 'force':
      return <Icons.Dumbbell size={size} className={className} color={color} />;
    case 'suplemento':
      return <Icons.Zap size={size} className={className} color={color} />;
    default:
      return <Icons.Tag size={size} className={className} color={color} />;
  }
};
