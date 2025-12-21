import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type PageInfo = {
  slug: string
  title: string
} | null

type SidebarContextValue = {
  pageSlug: string | null
  pageTitle: string | null
  setPage: (slug: string | null, title?: string) => void
  bookmarkDialogOpen: boolean
  openBookmarkDialog: () => void
  closeBookmarkDialog: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [page, setPageState] = useState<PageInfo>(null)
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false)

  const setPage = useCallback((slug: string | null, title?: string) => {
    if (slug) {
      setPageState({ slug, title: title || slug })
    } else {
      setPageState(null)
    }
  }, [])

  const openBookmarkDialog = useCallback(() => {
    setBookmarkDialogOpen(true)
  }, [])

  const closeBookmarkDialog = useCallback(() => {
    setBookmarkDialogOpen(false)
  }, [])

  return (
    <SidebarContext.Provider value={{
      pageSlug: page?.slug ?? null,
      pageTitle: page?.title ?? null,
      setPage,
      bookmarkDialogOpen,
      openBookmarkDialog,
      closeBookmarkDialog,
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
}
