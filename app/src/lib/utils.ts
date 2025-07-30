import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatAmount(amount: string | number, decimals = 6) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return (num / Math.pow(10, decimals)).toFixed(2)
}

export function parseAmount(amount: string, decimals = 6) {
  const num = parseFloat(amount)
  return BigInt(Math.floor(num * Math.pow(10, decimals)))
}