import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const isBrowser = typeof window !== "undefined"

export function getEnv<T>(key: string, defaultValue?: T) {
  const value = isBrowser ? import.meta.env[key] : process.env[key]
  if (value) {
    return value as T
  }
  if (!defaultValue) {
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return defaultValue
}