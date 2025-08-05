import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Utilidad para combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utilidades de fecha

// Exportar directamente para uso en componentes
export const formatDate = (date: string | Date, pattern: string = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Fecha inválida';
    return format(dateObj, pattern, { locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Fecha inválida';
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

// Mantener dateUtils para compatibilidad
export const dateUtils = {
  /**
   * Formatear fecha a formato legible
   */
  format: (date: string | Date, pattern: string = 'dd/MM/yyyy'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return 'Fecha inválida';
      return format(dateObj, pattern, { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  },

  /**
   * Formatear fecha con hora
   */
  formatDateTime: (date: string | Date): string => {
    return dateUtils.format(date, 'dd/MM/yyyy HH:mm');
  },

  /**
   * Obtener fecha relativa (hace X días)
   */
  relative: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return 'Fecha inválida';
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
    } catch {
      return 'Fecha inválida';
    }
  },

  /**
   * Calcular días entre fechas
   */
  daysBetween: (date1: string | Date, date2: string | Date): number => {
    try {
      const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
      const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
      
      if (!isValid(d1) || !isValid(d2)) return 0;
      
      const diffTime = d2.getTime() - d1.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  },

  /**
   * Verificar si una fecha está vencida
   */
  isExpired: (date: string | Date): boolean => {
    return dateUtils.daysBetween(new Date(), date) < 0;
  },

  /**
   * Verificar si una fecha está por vencer (próximos 30 días)
   */
  isExpiringSoon: (date: string | Date, days: number = 30): boolean => {
    const daysUntil = dateUtils.daysBetween(new Date(), date);
    return daysUntil >= 0 && daysUntil <= days;
  }
};

// Utilidades de formato
export const formatUtils = {
  /**
   * Formatear números con separadores de miles
   */
  number: (num: number): string => {
    return new Intl.NumberFormat('es-ES').format(num);
  },

  /**
   * Formatear tamaño de archivo
   */
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Capitalizar primera letra
   */
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Truncar texto
   */
  truncate: (str: string, length: number = 50): string => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
  },

  /**
   * Formatear porcentaje
   */
  percentage: (value: number, total: number): string => {
    if (total === 0) return '0%';
    return Math.round((value / total) * 100) + '%';
  }
};

// Utilidades de validación
export const validationUtils = {
  /**
   * Validar email
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validar contraseña fuerte
   */
  strongPassword: (password: string): boolean => {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  /**
   * Validar código interno de extintor
   */
  extintorCode: (code: string): boolean => {
    // Permite letras, números y guiones, 3-20 caracteres
    const codeRegex = /^[A-Za-z0-9-]{3,20}$/;
    return codeRegex.test(code);
  },

  /**
   * Validar fecha no pasada
   */
  futureDate: (date: string): boolean => {
    const inputDate = parseISO(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isValid(inputDate) && inputDate >= today;
  }
};

// Utilidades de color
export const colorUtils = {
  /**
   * Obtener color según estado de vencimiento
   */
  getStatusColor: (estado: 'vencido' | 'por_vencer' | 'vigente'): string => {
    const colors = {
      'vencido': '#ef4444',      // Rojo
      'por_vencer': '#f59e0b',   // Amarillo
      'vigente': '#22c55e'       // Verde
    };
    return colors[estado];
  },

  /**
   * Obtener color de tipo de extintor
   */
  getExtintorTypeColor: (tipo: string): string => {
    const colors: Record<string, string> = {
      'ABC': '#dc2626',    // Rojo
      'CO2': '#1f2937',    // Gris oscuro
      'H2O': '#3b82f6',    // Azul
      'FOAM': '#f59e0b',   // Amarillo
      'K': '#7c3aed'       // Púrpura
    };
    return colors[tipo] || '#6b7280';
  },

  /**
   * Convertir hex a rgba
   */
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /**
   * Generar color aleatorio
   */
  random: (): string => {
    const colors = [
      '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
};

// Utilidades de almacenamiento local
export const storageUtils = {
  /**
   * Guardar en localStorage con manejo de errores
   */
  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Obtener de localStorage con manejo de errores
   */
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },

  /**
   * Remover de localStorage
   */
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Limpiar todo el localStorage
   */
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

// Utilidades de URL y navegación
export const urlUtils = {
  /**
   * Construir URL con parámetros de consulta
   */
  buildQuery: (baseUrl: string, params: Record<string, any>): string => {
    const url = new URL(baseUrl, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
    
    return url.toString();
  },

  /**
   * Obtener parámetros de la URL actual
   */
  getQueryParams: (): Record<string, string> => {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(window.location.search);
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  },

  /**
   * Generar URL para imagen
   */
  getImageUrl: (path?: string): string => {
    if (!path) return '/placeholder-extintor.png';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL}${path}`;
  }
};

// Utilidades de archivos
export const fileUtils = {
  /**
   * Validar tipo de archivo de imagen
   */
  isValidImage: (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  },

  /**
   * Validar tamaño de archivo
   */
  isValidSize: (file: File, maxSizeMB: number = 5): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  /**
   * Convertir archivo a base64
   */
  toBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },

  /**
   * Redimensionar imagen
   */
  resizeImage: (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob y crear nuevo archivo
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
};

// Utilidades de debounce y throttle
export const performanceUtils = {
  /**
   * Debounce function
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Utilidades de exportación
export const exportUtils = {
  /**
   * Descargar archivo
   */
  downloadFile: (data: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Convertir datos a CSV
   */
  toCSV: (data: any[], headers: string[]): string => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
};

// Constantes útiles
export const CONSTANTS = {
  ROLES: {
    ADMIN: 'admin' as const,
    TECNICO: 'tecnico' as const,
    CONSULTA: 'consulta' as const
  },
  
  ESTADOS_VENCIMIENTO: {
    VENCIDO: 'vencido' as const,
    POR_VENCER: 'por_vencer' as const,
    VIGENTE: 'vigente' as const
  },
  
  TIPOS_EVENTO: {
    INSPECCION: 'inspeccion' as const,
    RECARGA: 'recarga' as const,
    REPARACION: 'reparacion' as const,
    INCIDENTE: 'incidente' as const,
    REEMPLAZO: 'reemplazo' as const
  },
  
  TIPOS_EXTINTOR: {
    ABC: 'ABC' as const,
    CO2: 'CO2' as const,
    H2O: 'H2O' as const,
    FOAM: 'FOAM' as const,
    K: 'K' as const
  },
  
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  
  FILE_LIMITS: {
    MAX_IMAGE_SIZE_MB: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  }
};
