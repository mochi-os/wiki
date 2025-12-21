import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Save, X, Eye, Edit2, Image, Trash2 } from 'lucide-react'
import { Button } from '@mochi/common'
import { Input } from '@mochi/common'
import { Textarea } from '@mochi/common'
import { Label } from '@mochi/common'
import { Separator } from '@mochi/common'
import { Skeleton } from '@mochi/common'
import { useEditPage, useCreatePage } from '@/hooks/use-wiki'
import { usePermissions } from '@/context/wiki-context'
import type { WikiPage } from '@/types/wiki'
import { MarkdownContent } from './markdown-content'

interface PageEditorProps {
  page?: WikiPage
  slug: string
  isNew?: boolean
}

export function PageEditor({ page, slug, isNew = false }: PageEditorProps) {
  const navigate = useNavigate()
  const editPage = useEditPage()
  const createPage = useCreatePage()
  const permissions = usePermissions()

  const [title, setTitle] = useState(page?.title ?? '')
  const [content, setContent] = useState(page?.content ?? '')
  const [comment, setComment] = useState('')
  const [newSlug, setNewSlug] = useState(slug)
  const [showPreview, setShowPreview] = useState(false)

  const isPending = editPage.isPending || createPage.isPending

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    if (isNew) {
      if (!newSlug.trim()) {
        toast.error('Page URL is required')
        return
      }

      createPage.mutate(
        { slug: newSlug.trim(), title: title.trim(), content },
        {
          onSuccess: (data) => {
            toast.success('Page created')
            navigate({ to: '/$page', params: { page: data.slug } })
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to create page')
          },
        }
      )
    } else {
      editPage.mutate(
        { slug, title: title.trim(), content, comment: comment.trim() },
        {
          onSuccess: () => {
            toast.success('Page saved')
            navigate({ to: '/$page', params: { page: slug } })
          },
          onError: (error) => {
            toast.error(error.message || 'Failed to save page')
          },
        }
      )
    }
  }

  const handleCancel = () => {
    if (isNew) {
      navigate({ to: '/' })
    } else {
      navigate({ to: '/$page', params: { page: slug } })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          {isNew ? 'Create new page' : `Editing: ${page?.title ?? slug}`}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/$page/attachments" params={{ page: slug }}>
              <Image className="mr-2 h-4 w-4" />
              Attachments
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          {!isNew && permissions.delete && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/$page/delete" params={{ page: slug }}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete page
              </Link>
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Separator />

      {showPreview ? (
        /* Preview mode */
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{title || 'Untitled'}</h2>
          <MarkdownContent content={content || '*No content*'} />
        </div>
      ) : (
        /* Edit mode */
        <div className="space-y-4">
          {/* Slug (only for new pages) */}
          {isNew && (
            <div className="space-y-2">
              <Label htmlFor="slug">Page URL</Label>
              <Input
                id="slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="my-page-name"
              />
              <p className="text-muted-foreground text-sm">
                This will be the path for the page. Use lower case letters,
                numbers, and hyphens.
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here using Markdown..."
              className="min-h-[400px] font-mono"
            />
          </div>

          {/* Comment (only for edits) */}
          {!isNew && (
            <div className="space-y-2">
              <Label htmlFor="comment">Edit summary (optional)</Label>
              <Input
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Briefly describe your changes"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PageEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  )
}
