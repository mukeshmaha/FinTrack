import React from 'react';
import { 
  Utensils, 
  Car, 
  Film, 
  ShoppingBag, 
  HeartPulse, 
  ReceiptText, 
  GraduationCap, 
  TrendingUp, 
  Layers,
  LucideProps
} from 'lucide-react';
import { Category } from '../types';
import { CATEGORY_COLORS } from '../utils';

interface CategoryIconProps extends LucideProps {
  category: Category;
  showBackground?: boolean;
  className?: string;
}

const ICON_MAP: Record<Category, React.ForwardRefExoticComponent<LucideProps>> = {
  Food: Utensils,
  Transport: Car,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Health: HeartPulse,
  Bills: ReceiptText,
  Education: GraduationCap,
  Income: TrendingUp,
  Other: Layers,
};

export default function CategoryIcon({ 
  category, 
  showBackground = false, 
  className,
  size = 16,
  ...props 
}: CategoryIconProps) {
  const Icon = ICON_MAP[category] || Layers;
  const color = CATEGORY_COLORS[category] || '#64748B';
  const numericSize = typeof size === 'number' ? size : parseInt(String(size));

  if (showBackground) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg"
        style={{ 
          backgroundColor: `${color}15`, // 15% opacity hex
          width: numericSize * 2,
          height: numericSize * 2,
        }}
      >
        <Icon size={size} style={{ color }} {...props} />
      </div>
    );
  }

  return <Icon size={size} style={{ color }} className={className} {...props} />;
}
