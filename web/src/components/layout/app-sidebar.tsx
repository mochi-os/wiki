import { useMemo } from 'react'
import { useLayout } from '@/context/layout-provider'
import { usePermissions } from '@/context/wiki-context'
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const permissions = usePermissions()

  const filteredNavGroups = useMemo(() => {
    return sidebarData.navGroups
      .map((group) => {
        // Filter items based on permissions
        const filteredItems = group.items.filter((item) => {
          // Hide "New Page" if user can't edit
          if (item.title === 'New Page' && !permissions.edit) {
            return false
          }
          // Hide admin items if user can't manage
          if (
            (item.title === 'Wiki Settings' || item.title === 'Redirects') &&
            !permissions.manage
          ) {
            return false
          }
          return true
        })

        return { ...group, items: filteredItems }
      })
      .filter((group) => group.items.length > 0) // Remove empty groups
  }, [permissions])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarContent className="pt-6">
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
