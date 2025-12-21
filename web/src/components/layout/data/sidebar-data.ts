import {
  FilePlus,
  History,
  Home,
  Library,
  Search,
  Settings,
  Tags,
} from 'lucide-react'
import { getAppPath } from '@mochi/common'
import type { SidebarData } from '@mochi/common'
import { APP_ROUTES } from '@/config/routes'

// Static sidebar data for CommandMenu (Cmd+K)
// The full dynamic sidebar is built in WikiLayout
export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'All wikis',
      items: [
        {
          title: 'All wikis',
          url: getAppPath() + '/',
          icon: Library,
          external: true,
        },
      ],
    },
    {
      title: 'This wiki',
      items: [
        { title: 'Home', url: APP_ROUTES.WIKI.HOME, icon: Home },
        { title: 'Search', url: APP_ROUTES.WIKI.SEARCH, icon: Search },
        { title: 'Tags', url: APP_ROUTES.WIKI.TAGS, icon: Tags },
        { title: 'Recent changes', url: APP_ROUTES.WIKI.CHANGES, icon: History },
        { title: 'New page', url: APP_ROUTES.WIKI.NEW, icon: FilePlus },
        { title: 'Settings', url: APP_ROUTES.WIKI.SETTINGS, icon: Settings },
      ],
    },
  ],
}
