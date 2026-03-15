import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utilitário padrão shadcn/ui para merge de classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
