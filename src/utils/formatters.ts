import { format } from 'date-fns'

export function formatCurrency(amount: string, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(
    parseFloat(amount),
  )
}

export function formatDate(iso: string) {
  return format(new Date(iso), 'dd MMM yyyy, HH:mm')
}
