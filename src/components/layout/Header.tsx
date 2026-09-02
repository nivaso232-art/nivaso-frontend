import { useEffect } from 'react'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useAppStore } from '@/store/appStore'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { data: businesses } = useBusinesses()
  const { selectedBusinessSlug, setSelectedBusinessSlug } = useAppStore()

  useEffect(() => {
    if (!selectedBusinessSlug && businesses?.length) {
      setSelectedBusinessSlug(businesses[0].slug)
    }
  }, [businesses, selectedBusinessSlug, setSelectedBusinessSlug])

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      {businesses && businesses.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Business:</span>
          <select
            value={selectedBusinessSlug}
            onChange={(e) => setSelectedBusinessSlug(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            {businesses.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </header>
  )
}
