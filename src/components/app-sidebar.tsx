import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { Link } from "@tanstack/react-router"
import {
  EditIcon,
  FolderIcon,
  InfoIcon,
  MoreVerticalIcon,
  PlayIcon,
  PlusIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react"
import { useState } from "react"

export function AppSidebar() {
  const { workspaces, launchWorkspace, deleteWorkspace } = useWorkspaceStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(
    null,
  )

  const handleDeleteWorkspace = (workspaceId: string) => {
    setWorkspaceToDelete(workspaceId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (workspaceToDelete) {
      deleteWorkspace(workspaceToDelete)
      setDeleteDialogOpen(false)
      setWorkspaceToDelete(null)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-2 px-4 py-2">
          <FolderIcon className="h-6 w-6" />
          <h1 className="text-lg font-semibold">Workspace Launcher</h1>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaces.map((workspace) => {
                return (
                  <SidebarMenuItem key={workspace.id}>
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {workspace.name}
                          </span>
                        </div>
                        {workspace.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {workspace.description}
                          </p>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "sm",
                            }),
                            "h-8 w-8 p-0",
                          )}
                        >
                          <MoreVerticalIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => launchWorkspace(workspace.id)}
                            asChild
                          >
                            <button type="button" className="w-full">
                              <PlayIcon className="size-4" />
                              Launch
                            </button>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/workspaces/$id/edit"
                              params={{ id: workspace.id }}
                            >
                              <EditIcon className="size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                            className="text-destructive"
                          >
                            <Trash2Icon className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                )
              })}

              {workspaces.length === 0 && (
                <SidebarMenuItem>
                  <div className="text-sm text-muted-foreground p-2 text-center">
                    No workspaces yet
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/workspaces/add">
                <PlusIcon className="h-4 w-4" />
                Add Workspace
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings">
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/about">
                <InfoIcon className="h-4 w-4" />
                About
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              workspace and all its configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
