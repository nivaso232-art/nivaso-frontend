import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useArticle } from '@/hooks/useKnowledge'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { KNOWLEDGE_STATUS_COLORS } from '@/utils/constants'

export function ArticleDetail() {
  const { articleId } = useParams<{ articleId: string }>()
  const { selectedBusinessSlug } = useAppStore()
  const { data: article, isLoading } = useArticle(selectedBusinessSlug, articleId ?? '')

  if (isLoading) return <Spinner />
  if (!article) return <p className="text-gray-500">Article not found.</p>

  return (
    <div className="max-w-2xl">
      <Link to="/knowledge" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{article.title}</h2>
          <Badge colorClass={KNOWLEDGE_STATUS_COLORS[article.status]}>{article.status}</Badge>
        </div>

        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap">
          {article.content}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-500">Source</p>
            <p className="text-gray-900">{article.source ?? '—'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Keywords</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {article.keywords.length === 0
                ? <span className="text-gray-400">—</span>
                : article.keywords.map((kw) => (
                  <span key={kw} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{kw}</span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
