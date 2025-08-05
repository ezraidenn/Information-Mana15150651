import React, { forwardRef, HTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/utils';

// Props base para Card
interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  motionProps?: MotionProps;
}

// Variantes de card
const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  outlined: 'bg-white border-2 border-gray-300',
  elevated: 'bg-white shadow-lg border-0',
  filled: 'bg-gray-50 border border-gray-200',
};

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

// Componente Card principal
export const Card = forwardRef<HTMLDivElement, BaseCardProps>(
  ({
    variant = 'default',
    size = 'md',
    hover = false,
    clickable = false,
    className,
    children,
    motionProps,
    ...props
  }, ref) => {
    const cardClasses = cn(
      // Clases base
      'rounded-lg transition-all duration-200',
      
      // Variantes
      cardVariants[variant],
      sizeClasses[size],
      
      // Estados interactivos
      hover && 'hover:shadow-md hover:-translate-y-1',
      clickable && 'cursor-pointer hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      
      className
    );

    if (motionProps || hover || clickable) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          whileHover={hover || clickable ? { y: -2, boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)' } : undefined}
          whileTap={clickable ? { scale: 0.98 } : undefined}
          {...motionProps}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Componente CardHeader
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  divider?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  divider = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-start justify-between',
        divider && 'border-b border-gray-200 pb-4 mb-4',
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

// Componente CardContent
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export const CardContent: React.FC<CardContentProps> = ({
  padding = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        padding && 'px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente CardFooter
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  divider = false,
  justify = 'end',
  className,
  children,
  ...props
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center',
        justifyClasses[justify],
        divider && 'border-t border-gray-200 pt-4 mt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente StatCard para métricas
interface StatCardProps extends Omit<BaseCardProps, 'children'> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  className,
  ...props
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    gray: 'text-gray-600 bg-gray-50 border-gray-200',
  };

  return (
    <Card
      className={cn('relative overflow-hidden', className)}
      hover
      {...props}
    >
      {/* Icono de fondo decorativo */}
      {icon && (
        <div className="absolute top-4 right-4 opacity-10">
          <div className="h-16 w-16 text-gray-400">
            {icon}
          </div>
        </div>
      )}

      <div className="relative">
        {/* Icono principal */}
        {icon && (
          <div className={cn('inline-flex p-3 rounded-lg mb-4', colorClasses[color])}>
            <div className="h-6 w-6">
              {icon}
            </div>
          </div>
        )}

        {/* Contenido */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {/* Subtítulo y tendencia */}
          <div className="flex items-center justify-between">
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            
            {trend && (
              <div className={cn(
                'flex items-center text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                <span className="mr-1">
                  {trend.isPositive ? '↗' : '↘'}
                </span>
                <span>{Math.abs(trend.value)}%</span>
                {trend.label && (
                  <span className="text-gray-500 ml-1">{trend.label}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Componente ImageCard para mostrar imágenes con overlay
interface ImageCardProps extends Omit<BaseCardProps, 'children'> {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  overlay?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
}

export const ImageCard: React.FC<ImageCardProps> = ({
  src,
  alt,
  title,
  subtitle,
  overlay,
  aspectRatio = 'landscape',
  className,
  ...props
}) => {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <Card className={cn('overflow-hidden p-0', className)} {...props}>
      <div className={cn('relative', aspectRatioClasses[aspectRatio])}>
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay */}
        {overlay && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-4 text-white w-full">
              {overlay}
            </div>
          </div>
        )}
      </div>
      
      {/* Contenido de texto */}
      {(title || subtitle) && (
        <div className="p-4">
          {title && (
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
    </Card>
  );
};

// Componente CardGrid para layouts de grillas
interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

export const CardGrid: React.FC<CardGridProps> = ({
  columns = 3,
  gap = 'md',
  responsive = true,
  className,
  children,
  ...props
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const responsiveClasses = responsive ? {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  } : columnClasses;

  return (
    <div
      className={cn(
        'grid',
        responsive ? responsiveClasses[columns] : columnClasses[columns],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Hook para animaciones de cards
export const useCardAnimation = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -4, boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)' },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return { cardVariants, containerVariants };
};
