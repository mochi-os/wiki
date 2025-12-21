import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { usePageTitle } from '@/hooks/usePageTitle'
import { AttachmentsPage, AttachmentsPageSkeleton } from '@/features/wiki/attachments-page'
import { Header } from '@mochi/common'
import { Main } from '@mochi/common'
import { useSidebarContext } from '@/context/sidebar-context'
import { useAttachments } from '@/hooks/use-wiki'

export const Route = createFileRoute('/_authenticated/$page/attachments')({
  component: AttachmentsRoute,
})

function AttachmentsRoute() {
  const params = Route.useParams()
  const slug = params.page
  usePageTitle('Attachments')
  const { isLoading } = useAttachments()

  // Register page with sidebar context for tree expansion
  const { setPage } = useSidebarContext()
  useEffect(() => {
    setPage(slug)
    return () => setPage(null)
  }, [slug, setPage])

  if (isLoading) {
    return (
      <>
        <Header />
        <Main>
          <AttachmentsPageSkeleton viewMode="grid" />
        </Main>
      </>
    )
  }

  return (
    <>
      <Header />
      <Main>
        <AttachmentsPage slug={slug} />
      </Main>
    </>
  )
}
