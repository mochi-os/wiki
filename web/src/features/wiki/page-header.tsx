import type { WikiPage } from '@/types/wiki'

interface PageHeaderProps {
  page: WikiPage
}

export function PageHeader({ page }: PageHeaderProps) {
  return (
    <div className="flex flex-1 items-center justify-between gap-4">
      <h1 className="truncate text-3xl font-semibold leading-normal">{page.title}</h1>
    </div>
  )
}
