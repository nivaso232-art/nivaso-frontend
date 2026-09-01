import { BookOpen, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useArticles } from '@/hooks/useKnowledge'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { KNOWLEDGE_STATUS_COLORS } from '@/utils/constants'

export function ArticleList() {
  const { selectedBusinessSlug } = useAppStore()
  const { data: articles, isLoading } = useArticles(selectedBusinessSlug)

  if (isLoading) return <Spinner />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{articles?.length ?? 0} articles</p>
        <Link to="/knowledge/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      {articles?.length === 0 ? (
        <EmptyState icon={BookOpen} title="No articles" description="Add knowledge base articles for the AI to use." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Keywords</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles?.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link to={`/knowledge/${a.id}`} className="font-medium text-blue-600 hover:underline">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{a.source ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{a.keywords.slice(0, 3).join(', ')}{a.keywords.length > 3 ? '…' : ''}</td>
                  <td className="px-5 py-3">
                    <Badge colorClass={KNOWLEDGE_STATUS_COLORS[a.status]}>{a.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
