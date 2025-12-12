import { Edit, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { WikiPage } from '@/types/wiki'
import { MarkdownContent } from './markdown-content'
import { TagManager } from './tag-manager'
import { usePermissions } from '@/context/wiki-context'

interface PageViewProps {
  page: WikiPage
}

export function PageView({ page }: PageViewProps) {
  return (
    <article className="space-y-4">
      <Separator />
      <MarkdownContent content={page.content} />
      <Separator />
      <TagManager slug={page.slug} tags={page.tags} />
    </article>
  )
}

interface PageNotFoundProps {
  slug: string
}

export function PageNotFound({ slug }: PageNotFoundProps) {
  const permissions = usePermissions()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileQuestion className="text-muted-foreground mb-4 h-16 w-16" />
      <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground mb-6">
        The page "{slug}" does not exist yet.
      </p>
      {permissions.edit && (
        <Button asChild>
          <a href={`new?slug=${encodeURIComponent(slug)}`}>
            <Edit className="mr-2 h-4 w-4" />
            Create this page
          </a>
        </Button>
      )}
    </div>
  )
}

export function PageViewSkeleton() {
  return (
    <article className="space-y-4">
      <Separator />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Separator />
      <Skeleton className="h-5 w-24" />
    </article>
  )
}
