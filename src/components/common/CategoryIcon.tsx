import React from 'react';
import {
  Apple, Baby, Beef, BookOpen, Briefcase, Building2, Bus, Candy, Car, Coffee,
  CreditCard, Dog, Droplets, Dumbbell, Egg, Flame, Fuel, Gamepad2, Gift, Hammer,
  HeartPulse, House, Pill, Plane, Salad, Scissors, Shirt, ShoppingBag,
  ShoppingCart, Smartphone, Sparkles, Sprout, Tag, Tv, Users, UtensilsCrossed,
  Wifi, Wine, Wrench, Zap,
  type LucideIcon,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Explicit icon map.
 *
 * This used to `import * as Icons from 'lucide-react'` and index it by string,
 * which defeats tree-shaking and pulls all ~4,000 icons into the bundle for the
 * sake of twenty. One family, one stroke weight, one grid.
 *
 * Every name offered by the category picker must appear here: an unmapped name
 * silently renders the fallback tag, so a user could pick the plane icon and
 * get a label instead.
 */
const ICONS: Record<string, LucideIcon> = {
  Apple, Baby, Beef, BookOpen, Briefcase, Building2, Bus, Candy, Car, Coffee,
  CreditCard, Dog, Droplets, Dumbbell, Egg, Flame, Fuel, Gamepad2, Gift, Hammer,
  HeartPulse, Home: House, House, Pill, Plane, Salad, Scissors, Shirt,
  ShoppingBag, ShoppingCart, Smartphone, Sparkles, Sprout, Tag, Tv, Users,
  UtensilsCrossed, Wifi, Wine, Wrench, Zap,
};

/** The set offered when creating a category. Kept in sync with ICONS above. */
export const PICKER_ICONS: string[] = [
  'ShoppingCart', 'UtensilsCrossed', 'Coffee', 'Wine', 'Apple', 'Beef',
  'House', 'Building2', 'Car', 'Bus', 'Plane', 'Fuel',
  'HeartPulse', 'Pill', 'Dumbbell', 'Baby', 'Dog', 'Sprout',
  'Shirt', 'ShoppingBag', 'Gift', 'Scissors', 'Smartphone', 'Tv',
  'Gamepad2', 'BookOpen', 'Wrench', 'Hammer', 'Briefcase', 'Sparkles',
];

/** Category ids that ship without a matching icon name. */
const BY_CATEGORY: Record<string, LucideIcon> = {
  verduleria: Salad,
  fruteria: Apple,
  carniceria: Beef,
  huevos: Egg,
  supermercado: ShoppingCart,
  alquiler: House,
  expensas: Building2,
  combustible: Fuel,
  subscripciones: Tv,
  salidas: UtensilsCrossed,
  tarjetas: CreditCard,
  gym: Dumbbell,
  gym_operacion: Users,
  force: Dumbbell,
  suplemento: Zap,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = '',
  size = 20,
  color,
  strokeWidth = 1.75,
}) => {
  const Icon = ICONS[name] ?? BY_CATEGORY[name?.toLowerCase()] ?? Tag;
  return <Icon size={size} className={className} color={color} strokeWidth={strokeWidth} />;
};
