import { ExpenseCategory, RecurringCommitment, SupplementProduct, UserProfile } from '../types/finance';

export const USER_PROFILES: Record<'mati' | 'belu', UserProfile> = {
  mati: {
    id: 'mati',
    name: 'Mati',
    avatar: 'M',
    color: '#C7DBF8', // Malu Pastel Signal Blue
    badge: 'Force HQ & Tech',
  },
  belu: {
    id: 'belu',
    name: 'Belu',
    avatar: 'B',
    color: '#FBC3B8', // Malu Pastel Peach
    badge: 'Admin & Household',
  },
};

export const FORCE_REGULAR_MEMBERS = [
  { id: 'mem-1', name: 'Lucas Fernandez', plan: 'Full Cross & Strength', defaultAmount: 45000 },
  { id: 'mem-2', name: 'Camila Rodriguez', plan: 'Morning Pass', defaultAmount: 45000 },
  { id: 'mem-3', name: 'Gonzalo Rossi', plan: 'Athlete Performance', defaultAmount: 45000 },
  { id: 'mem-4', name: 'Julian Castro', plan: 'Strength & Conditioning', defaultAmount: 45000 },
  { id: 'mem-5', name: 'Agustin Navarro', plan: 'Evening Unlimited', defaultAmount: 45000 },
  { id: 'mem-6', name: 'Federico Perez', plan: 'Full Cross', defaultAmount: 45000 },
  { id: 'mem-7', name: 'Sofia Romero', plan: 'Functional Training', defaultAmount: 45000 },
  { id: 'mem-8', name: 'Mariano Benitez', plan: 'Open Gym Plus', defaultAmount: 45000 },
];

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'supermercado',
    name: 'Supermarket',
    icon: 'ShoppingCart',
    color: '#C4E8D1', // Pastel Mint
    pastelBg: 'rgba(196, 232, 209, 0.12)',
    monthlyBudget: 220000,
  },
  {
    id: 'alquiler',
    name: 'Rent & Garage',
    icon: 'Home',
    color: '#DED2F9', // Pastel Lilac
    pastelBg: 'rgba(222, 210, 249, 0.12)',
    monthlyBudget: 380000,
  },
  {
    id: 'gym_operacion',
    name: 'Gym Payroll & Partners',
    icon: 'Users',
    color: '#FBE4A0', // Pastel Gold
    pastelBg: 'rgba(251, 228, 160, 0.12)',
    monthlyBudget: 700000,
  },
  {
    id: 'combustible',
    name: 'Fuel & Transport',
    icon: 'Fuel',
    color: '#F8D896', // Pastel Amber
    pastelBg: 'rgba(248, 216, 150, 0.12)',
    monthlyBudget: 80000,
  },
  {
    id: 'salidas',
    name: 'Dining & Social',
    icon: 'UtensilsCrossed',
    color: '#FBC3B8', // Pastel Peach
    pastelBg: 'rgba(251, 195, 184, 0.12)',
    monthlyBudget: 100000,
  },
  {
    id: 'expensas',
    name: 'Building HOA',
    icon: 'Building2',
    color: '#C7DBF8', // Pastel Cerulean
    pastelBg: 'rgba(199, 219, 248, 0.12)',
    monthlyBudget: 65000,
  },
  {
    id: 'carniceria',
    name: 'Butcher Shop',
    icon: 'Beef',
    color: '#F7B5A8', // Pastel Salmon
    pastelBg: 'rgba(247, 181, 168, 0.12)',
    monthlyBudget: 120000,
  },
  {
    id: 'verduleria',
    name: 'Produce & Greens',
    icon: 'Salad',
    color: '#BBDCC7', // Pastel Sage
    pastelBg: 'rgba(187, 220, 199, 0.12)',
    monthlyBudget: 60000,
  },
  {
    id: 'subscripciones',
    name: 'Subscriptions & Fiber',
    icon: 'Tv',
    color: '#E2D9F3', // Pastel Lavender
    pastelBg: 'rgba(226, 217, 243, 0.12)',
    monthlyBudget: 35000,
  },
  {
    id: 'fruteria',
    name: 'Fresh Fruits',
    icon: 'Apple',
    color: '#FDE5A8', // Pastel Butter
    pastelBg: 'rgba(253, 229, 168, 0.12)',
    monthlyBudget: 35000,
  },
  {
    id: 'huevos',
    name: 'Farm Eggs',
    icon: 'Egg',
    color: '#F4DE9C', // Pastel Cream
    pastelBg: 'rgba(244, 222, 156, 0.12)',
    monthlyBudget: 30000,
  },
  {
    id: 'tarjetas',
    name: 'Credit Card Lump',
    icon: 'CreditCard',
    color: '#B6C8F5', // Pastel Sky
    pastelBg: 'rgba(182, 200, 245, 0.12)',
    monthlyBudget: 150000,
  },
];

export const DEFAULT_SUPPLEMENTS: SupplementProduct[] = [
  {
    id: 'barra-proteina',
    name: 'Protein Bar',
    category: 'barras',
    defaultPrice: 2600,
    icon: 'Candy',
  },
  {
    id: 'creatina-300g',
    name: 'Creatine Monohydrate (300g)',
    category: 'creatinas',
    defaultPrice: 29000,
    icon: 'Zap',
  },
  {
    id: 'whey-protein-1kg',
    name: 'Whey Protein (1kg)',
    category: 'proteinas',
    defaultPrice: 42000,
    icon: 'Dumbbell',
  },
  {
    id: 'pre-entreno',
    name: 'Explosive Pre-Workout',
    category: 'pre_entreno',
    defaultPrice: 25000,
    icon: 'Flame',
  },
  {
    id: 'bebida-isotonica',
    name: 'Electrolyte Hydration Drink',
    category: 'otros',
    defaultPrice: 1800,
    icon: 'Droplets',
  },
];

export const DEFAULT_RECURRING: RecurringCommitment[] = [
  {
    id: 'rec-fer-giveback',
    name: 'Fer Partner Giveback',
    type: 'expense',
    categoryId: 'gym_operacion',
    defaultAmount: 250000,
    dueDay: 7, // 7th of every month
    icon: 'Users',
    paidMonths: {},
  },
  {
    id: 'rec-alquiler',
    name: 'Apartment Rent & Garage',
    type: 'expense',
    categoryId: 'alquiler',
    defaultAmount: 380000,
    dueDay: 10, // 10th of every month
    icon: 'Home',
    paidMonths: {},
  },
  {
    id: 'rec-expensas',
    name: 'Building HOA Maintenance',
    type: 'expense',
    categoryId: 'expensas',
    defaultAmount: 65000,
    dueDay: 15, // 15th of every month
    icon: 'Building2',
    paidMonths: {},
  },
  {
    id: 'rec-internet-spotify',
    name: 'Fiber Internet & Services',
    type: 'expense',
    categoryId: 'subscripciones',
    defaultAmount: 32000,
    dueDay: 18, // 18th of every month
    icon: 'Wifi',
    paidMonths: {},
  },
  {
    id: 'rec-gym-salaries',
    name: 'Force Gym Staff Payroll',
    type: 'expense',
    categoryId: 'gym_operacion',
    defaultAmount: 450000,
    dueDay: 30, // Last day of month
    icon: 'Briefcase',
    paidMonths: {},
  },
];

