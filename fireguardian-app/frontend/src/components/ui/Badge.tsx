import React from 'react';
import { cn } from '@/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  rounded = 'md',
  className,
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-primary-100 text-primary-800 border-primary-200',
    outline: 'bg-transparent border-gray-300 text-gray-700',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const roundedClasses = {
    full: 'rounded-full',
    md: 'rounded-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border',
        variantClasses[variant],
        sizeClasses[size],
        roundedClasses[rounded],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Variantes predefinidas para uso común
export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className, ...props }) => {
  const statusMap: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    active: { variant: 'success', label: 'Activo' },
    inactive: { variant: 'secondary', label: 'Inactivo' },
    pending: { variant: 'warning', label: 'Pendiente' },
    error: { variant: 'destructive', label: 'Error' },
    warning: { variant: 'warning', label: 'Advertencia' },
    info: { variant: 'default', label: 'Información' },
    success: { variant: 'success', label: 'Éxito' },
    
    // Estados específicos de extintores
    vencido: { variant: 'destructive', label: 'Vencido' },
    por_vencer: { variant: 'warning', label: 'Por vencer' },
    vigente: { variant: 'success', label: 'Vigente' },
    mantenimiento: { variant: 'secondary', label: 'En mantenimiento' },
    
    // Estados genéricos
    high: { variant: 'destructive', label: 'Alto' },
    medium: { variant: 'warning', label: 'Medio' },
    low: { variant: 'success', label: 'Bajo' },
  };

  const statusConfig = statusMap[status.toLowerCase()] || { variant: 'secondary', label: status };

  return (
    <Badge variant={statusConfig.variant} className={className} {...props}>
      {statusConfig.label}
    </Badge>
  );
};
