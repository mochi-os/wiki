import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Settings, Save, Trash2, Plus, X, Shield, ShieldCheck, ShieldX } from 'lucide-react'
import { getAppPath } from '@/lib/app-path'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  useWikiSettings,
  useSetWikiSetting,
  useDeleteWiki,
  useAccessRules,
  useGrantAccess,
  useDenyAccess,
  useRevokeAccess,
} from '@/hooks/use-wiki'
import type { AccessRule } from '@/types/wiki'

export function WikiSettings() {
  const { data, isLoading, error } = useWikiSettings()
  const setSetting = useSetWikiSetting()
  const deleteWiki = useDeleteWiki()

  const [homePage, setHomePage] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize from loaded settings
  useEffect(() => {
    if (data?.settings) {
      setHomePage(data.settings.home || 'home')
      setHasChanges(false)
    }
  }, [data])

  const handleHomePageChange = (value: string) => {
    setHomePage(value)
    setHasChanges(value !== (data?.settings?.home || 'home'))
  }

  const handleSave = () => {
    setSetting.mutate(
      { name: 'home', value: homePage.trim() || 'home' },
      {
        onSuccess: () => {
          toast.success('Settings saved')
          setHasChanges(false)
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to save settings')
        },
      }
    )
  }

  const handleDelete = () => {
    deleteWiki.mutate(undefined, {
      onSuccess: () => {
        toast.success('Wiki deleted')
        window.location.href = getAppPath() + '/'
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete wiki')
      },
    })
  }

  if (isLoading) {
    return <WikiSettingsSkeleton />
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading settings: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Wiki Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || setSetting.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {setSetting.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Separator />

      {/* Settings cards */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Home Page</CardTitle>
            <CardDescription>
              The page that users see when they first visit the wiki. This should
              be the slug of an existing page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="home-page">Home page slug</Label>
              <Input
                id="home-page"
                value={homePage}
                onChange={(e) => handleHomePageChange(e.target.value)}
                placeholder="home"
              />
              <p className="text-muted-foreground text-sm">
                Example: "home", "welcome", "index"
              </p>
            </div>
          </CardContent>
        </Card>

        <AccessControlCard />

        <Card>
          <CardHeader>
            <CardTitle>Delete Wiki</CardTitle>
            <CardDescription>
              Permanently delete this wiki and all its pages, revisions, tags, and attachments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleteWiki.isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteWiki.isPending ? 'Deleting...' : 'Delete Wiki'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the wiki
                      and all its contents including pages, revisions, tags, redirects,
                      and attachments.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Wiki
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function WikiSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Subject type labels for display
const SUBJECT_LABELS: Record<string, string> = {
  '*': 'Anyone (including anonymous)',
  '+': 'Authenticated users',
  '#user': 'All users with a role',
  '#administrator': 'Administrators',
}

// Operation labels
const OPERATION_LABELS: Record<string, string> = {
  view: 'View',
  edit: 'Edit',
  delete: 'Delete',
  manage: 'Manage',
  '*': 'All operations',
}

function formatSubject(subject: string): string {
  if (SUBJECT_LABELS[subject]) {
    return SUBJECT_LABELS[subject]
  }
  if (subject.startsWith('@')) {
    return `Group: ${subject.slice(1)}`
  }
  // Truncate long entity IDs
  if (subject.length > 20) {
    return `${subject.slice(0, 8)}...${subject.slice(-8)}`
  }
  return subject
}

function AccessControlCard() {
  const { data, isLoading, error } = useAccessRules()
  const grantAccess = useGrantAccess()
  const denyAccess = useDenyAccess()
  const revokeAccess = useRevokeAccess()

  const [newSubject, setNewSubject] = useState('')
  const [newOperation, setNewOperation] = useState('view')
  const [newType, setNewType] = useState<'allow' | 'deny'>('allow')

  const handleAdd = () => {
    if (!newSubject.trim()) {
      toast.error('Subject is required')
      return
    }

    const mutation = newType === 'allow' ? grantAccess : denyAccess
    mutation.mutate(
      { subject: newSubject.trim(), operation: newOperation },
      {
        onSuccess: () => {
          toast.success(`Access rule added`)
          setNewSubject('')
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to add access rule')
        },
      }
    )
  }

  const handleRevoke = (rule: AccessRule) => {
    // Extract operation from the rule
    revokeAccess.mutate(
      { subject: rule.subject, operation: rule.operation },
      {
        onSuccess: () => {
          toast.success('Access rule removed')
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to remove access rule')
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Access Control
        </CardTitle>
        <CardDescription>
          Control who can view, edit, delete, and manage this wiki. Use special
          subjects: <code className="text-xs">*</code> (anyone),{' '}
          <code className="text-xs">+</code> (authenticated),{' '}
          <code className="text-xs">@groupname</code> (group members), or a user ID.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new rule */}
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="*, +, @group, or user ID"
            />
          </div>
          <div className="w-32">
            <Label htmlFor="operation">Operation</Label>
            <Select value={newOperation} onValueChange={setNewOperation}>
              <SelectTrigger id="operation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="manage">Manage</SelectItem>
                <SelectItem value="*">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-28">
            <Label htmlFor="type">Type</Label>
            <Select value={newType} onValueChange={(v) => setNewType(v as 'allow' | 'deny')}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="deny">Deny</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAdd}
            disabled={grantAccess.isPending || denyAccess.isPending}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <Separator />

        {/* Rules table */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="text-destructive text-sm">
            Error loading access rules: {error.message}
          </div>
        ) : data?.rules && data.rules.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-mono text-sm">
                    {formatSubject(rule.subject)}
                  </TableCell>
                  <TableCell>{OPERATION_LABELS[rule.operation] || rule.operation}</TableCell>
                  <TableCell>
                    {rule.grant === 1 ? (
                      <Badge variant="default" className="bg-green-600">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Allow
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <ShieldX className="h-3 w-3 mr-1" />
                        Deny
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevoke(rule)}
                      disabled={revokeAccess.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-sm">
            No access rules configured. Add rules to control who can access this wiki.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
