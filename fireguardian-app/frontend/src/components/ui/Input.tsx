import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/utils';

// Props base para inputs
interface BaseInputProps {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

// Props para Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
  variant?: 'default' | 'filled' | 'underlined';
}

// Props para Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {
  variant?: 'default' | 'filled';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

// Clases de variantes
const inputVariants = {
  default: 'border border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500',
  filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-primary-500',
  underlined: 'border-0 border-b-2 border-gray-300 bg-transparent focus:border-primary-500 rounded-none',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-3 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

// Componente Input principal
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    success,
    hint,
    required,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    fullWidth = true,
    className,
    id,
    type = 'text',
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const inputClasses = cn(
      // Clases base
      'block rounded-md shadow-sm transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400',
      
      // Variantes
      inputVariants[variant],
      sizeClasses[size],
      
      // Estados
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500',
      
      // Iconos
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      
      // Ancho
      fullWidth ? 'w-full' : 'w-auto',
      
      className
    );

    return (
      <div className={fullWidth ? 'w-full' : 'w-auto'}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 h-5 w-5">{leftIcon}</span>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={inputClasses}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-400 h-5 w-5">{rightIcon}</span>
            </div>
          )}

          {/* Status icons */}
          {(hasError || hasSuccess) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {hasError && <AlertCircle className="h-5 w-5 text-red-500" />}
              {hasSuccess && <Check className="h-5 w-5 text-green-500" />}
            </div>
          )}
        </div>

        {/* Messages */}
        {(error || success || hint) && (
          <div className="mt-1 text-sm">
            {error && (
              <motion.p
                className="text-red-600 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.p>
            )}
            {success && !error && (
              <motion.p
                className="text-green-600 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-4 w-4" />
                {success}
              </motion.p>
            )}
            {hint && !error && !success && (
              <p className="text-gray-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Componente Password Input
interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showPasswordToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    const rightIcon = showPasswordToggle ? (
      <button
        type="button"
        onClick={togglePassword}
        className="text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    ) : undefined;

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={rightIcon}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// Componente Textarea
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    error,
    success,
    hint,
    required,
    size = 'md',
    variant = 'default',
    resize = 'vertical',
    fullWidth = true,
    className,
    id,
    rows = 3,
    ...props
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const textareaClasses = cn(
      // Clases base
      'block rounded-md shadow-sm transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400',
      
      // Variantes (sin underlined para textarea)
      variant === 'filled' ? inputVariants.filled : inputVariants.default,
      sizeClasses[size],
      resizeClasses[resize],
      
      // Estados
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500',
      
      // Ancho
      fullWidth ? 'w-full' : 'w-auto',
      
      className
    );

    return (
      <div className={fullWidth ? 'w-full' : 'w-auto'}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClasses}
          {...props}
        />

        {/* Messages */}
        {(error || success || hint) && (
          <div className="mt-1 text-sm">
            {error && (
              <motion.p
                className="text-red-600 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.p>
            )}
            {success && !error && (
              <motion.p
                className="text-green-600 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-4 w-4" />
                {success}
              </motion.p>
            )}
            {hint && !error && !success && (
              <p className="text-gray-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Componente Select
interface SelectProps extends Omit<BaseInputProps, 'leftIcon' | 'rightIcon'> {
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  variant?: 'default' | 'filled';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    error,
    success,
    hint,
    required,
    size = 'md',
    variant = 'default',
    fullWidth = true,
    options,
    placeholder,
    className,
    id,
    value,
    onChange,
    ...props
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const selectClasses = cn(
      // Clases base
      'block rounded-md shadow-sm transition-all duration-200 appearance-none',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'bg-white bg-no-repeat bg-right-3 bg-center',
      'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")]',
      
      // Variantes
      variant === 'filled' ? inputVariants.filled : inputVariants.default,
      sizeClasses[size],
      
      // Estados
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500',
      
      // Padding para el icono
      'pr-10',
      
      // Ancho
      fullWidth ? 'w-full' : 'w-auto',
      
      className
    );

    return (
      <div className={fullWidth ? 'w-full' : 'w-auto'}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select */}
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Messages */}
        {(error || success || hint) && (
          <div className="mt-1 text-sm">
            {error && (
              <motion.p
                className="text-red-600 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.p>
            )}
            {success && !error && (
              <motion.p
                className="text-green-600 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-4 w-4" />
                {success}
              </motion.p>
            )}
            {hint && !error && !success && (
              <p className="text-gray-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Hook para manejar validación de formularios
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | undefined>
) => {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = React.useCallback((name: keyof T, value: any) => {
    const rule = validationRules[name];
    return rule ? rule(value) : undefined;
  }, [validationRules]);

  const setFieldValue = React.useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validar si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const setFieldTouched = React.useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar el campo cuando se marca como tocado
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const validateAll = React.useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => ({
        ...acc,
        [key]: true,
      }), {})
    );

    return isValid;
  }, [values, validationRules, validateField]);

  const reset = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};
