import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { usePage } from '@/hooks/use-wiki'
import { Button, usePageTitle } from '@mochi/common'
import {
  PageView,
  PageNotFound,
  PageViewSkeleton,
} from '@/features/wiki/page-view'
import { PageHeader } from '@/features/wiki/page-header'
import { Header } from '@mochi/common'
import { Main } from '@mochi/common'
import { useSidebarContext } from '@/context/sidebar-context'
import { useWikiContext, usePermissions } from '@/context/wiki-context'
import { setLastLocation } from '@/hooks/use-wiki-storage'
import { History, Pencil } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/$page/')({
  component: WikiPageRoute,
})

function WikiPageRoute() {
  const params = Route.useParams()
  const slug = params.page
  const { data, isLoading, error } = usePage(slug)
  const { info } = useWikiContext()
  const permissions = usePermissions()
  const pageTitle = data && 'page' in data && typeof data.page === 'object' && data.page?.title ? data.page.title : slug
  usePageTitle(pageTitle)

  // Register page with sidebar context for tree expansion
  const { setPage } = useSidebarContext()
  useEffect(() => {
    setPage(slug, pageTitle)
    return () => setPage(null)
  }, [slug, pageTitle, setPage])

  // Store last visited location
  useEffect(() => {
    if (info?.wiki?.id) {
      setLastLocation(info.wiki.id, slug)
    }
  }, [info?.wiki?.id, slug])

  if (isLoading) {
    return (
      <>
        <Header />
        <Main>
          <PageViewSkeleton />
        </Main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <Main>
          <div className="text-destructive">
            Error loading page: {error.message}
          </div>
        </Main>
      </>
    )
  }

  // Check if page was not found
  if (data && 'error' in data && data.error === 'not_found') {
    return (
      <>
        <Header>
          <h1 className="text-lg font-semibold">Page not found</h1>
        </Header>
        <Main>
          <PageNotFound slug={slug} />
        </Main>
      </>
    )
  }

  // Page found
  if (data && 'page' in data && typeof data.page === 'object') {
    return (
      <>
        <Header>
          <PageHeader page={data.page} />
        </Header>
        <Main>
          {/* Action buttons */}
          <div className="-mt-1 flex justify-end gap-2 mb-4">
            {permissions.edit && (
              <Button asChild>
                <Link to="/$page/edit" params={{ page: slug }}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/$page/history" params={{ page: slug }}>
                <History className="size-4" />
                History
              </Link>
            </Button>
          </div>
          <PageView page={data.page} />
        </Main>
      </>
    )
  }

  return null
}
