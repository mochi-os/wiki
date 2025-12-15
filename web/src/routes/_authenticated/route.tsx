import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore, AuthenticatedLayout } from '@mochi/common'
import { sidebarData } from '@/components/layout/data/sidebar-data'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    // Initialize auth state from cookies if available
    // but don't redirect to login if not authenticated (allow anonymous access)
    const store = useAuthStore.getState()

    if (!store.isInitialized) {
      store.syncFromCookie()
    }

    return
  },
  component: () => <AuthenticatedLayout title="Wiki" sidebarData={sidebarData} />,
})
