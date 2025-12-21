import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { requestHelpers, getAppPath } from '@mochi/common'
import endpoints from '@/api/endpoints'
import { Card, CardHeader, CardTitle, Button } from '@mochi/common'
import { toast } from 'sonner'
import { BookOpen, Link2, Bookmark, X } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePage, useRemoveBookmark } from '@/hooks/use-wiki'
import { Header } from '@mochi/common'
import { Main } from '@mochi/common'
import {
  PageView,
  PageNotFound,
  PageViewSkeleton,
} from '@/features/wiki/page-view'
import { PageHeader } from '@/features/wiki/page-header'
import { GeneralError } from '@mochi/common'
import { useSidebarContext } from '@/context/sidebar-context'
import { cacheWikisList, setLastLocation } from '@/hooks/use-wiki-storage'

interface InfoResponse {
  entity: boolean
  wiki?: { id: string; name: string; home: string }
  wikis?: Array<{ id: string; name: string; home: string; source?: string }>
  bookmarks?: Array<{ id: string; name: string; added: number }>
}

type WikiType = 'owned' | 'subscribed' | 'bookmarked'

interface WikiItem {
  id: string
  name: string
  type: WikiType
}

export const Route = createFileRoute('/_authenticated/')({
  loader: async () => {
    const info = await requestHelpers.get<InfoResponse>(endpoints.wiki.info)

    // Cache wikis list for sidebar
    if (info.wikis || info.bookmarks) {
      cacheWikisList(
        info.wikis?.map(w => ({ id: w.id, name: w.name, source: w.source })) || [],
        info.bookmarks?.map(b => ({ id: b.id, name: b.name })) || []
      )
    }

    return info
  },
  component: IndexPage,
  errorComponent: ({ error }) => <GeneralError error={error} />,
})

function IndexPage() {
  const data = Route.useLoaderData()

  // If we're in entity context, show the wiki's home page directly
  if (data.entity && data.wiki) {
    return <WikiHomePage wikiId={data.wiki.id} homeSlug={data.wiki.home} />
  }

  // Class context with no wikis - show empty state
  return <WikisListPage wikis={data.wikis} bookmarks={data.bookmarks} />
}

function WikiHomePage({ wikiId, homeSlug }: { wikiId: string; homeSlug: string }) {
  const { data, isLoading, error } = usePage(homeSlug)
  const pageTitle = data && 'page' in data && typeof data.page === 'object' && data.page?.title ? data.page.title : 'Home'
  usePageTitle(pageTitle)

  // Register page with sidebar context for tree expansion
  const { setPage } = useSidebarContext()
  useEffect(() => {
    setPage(homeSlug, pageTitle)
    return () => setPage(null)
  }, [homeSlug, pageTitle, setPage])

  // Store last visited location
  useEffect(() => {
    setLastLocation(wikiId, homeSlug)
  }, [wikiId, homeSlug])

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
          <PageNotFound slug={homeSlug} />
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
          <PageView page={data.page} />
        </Main>
      </>
    )
  }

  return null
}

interface WikisListPageProps {
  wikis?: Array<{ id: string; name: string; home: string; source?: string }>
  bookmarks?: Array<{ id: string; name: string; added: number }>
}

function WikisListPage({ wikis, bookmarks }: WikisListPageProps) {
  usePageTitle('Wikis')
  const removeBookmark = useRemoveBookmark()

  const handleRemoveBookmark = (id: string) => {
    removeBookmark.mutate(id, {
      onSuccess: () => {
        toast.success('Bookmark removed')
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to remove bookmark')
      },
    })
  }

  // Combine all wikis into a single list with type indicators
  const allWikis: WikiItem[] = [
    ...(wikis || []).map((w) => ({
      id: w.id,
      name: w.name,
      type: (w.source ? 'subscribed' : 'owned') as WikiType,
    })),
    ...(bookmarks || []).map((b) => ({
      id: b.id,
      name: b.name,
      type: 'bookmarked' as WikiType,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name))

  const hasWikis = allWikis.length > 0

  const getIcon = (type: WikiType) => {
    switch (type) {
      case 'owned':
        return <BookOpen className="h-5 w-5" />
      case 'subscribed':
        return <Link2 className="h-5 w-5" />
      case 'bookmarked':
        return <Bookmark className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Wikis</h1>

      {!hasWikis ? (
        <Card className="p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No wikis yet</h2>
          <p className="text-muted-foreground">
            Use the sidebar to create a new wiki, join an existing one, or bookmark a wiki to follow.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allWikis.map((wiki) => (
            <Card key={wiki.id} className="transition-colors hover:bg-highlight relative">
              <a href={`${getAppPath()}/${wiki.id}`} className="block">
                <CardHeader className="flex items-center justify-center py-8">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {getIcon(wiki.type)}
                    {wiki.name}
                  </CardTitle>
                </CardHeader>
              </a>
              {wiki.type === 'bookmarked' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 absolute top-2 right-2"
                  onClick={() => handleRemoveBookmark(wiki.id)}
                  disabled={removeBookmark.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
