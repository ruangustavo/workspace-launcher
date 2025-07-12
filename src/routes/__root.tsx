import "../index.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { Outlet, createRootRoute } from "@tanstack/react-router"
import { useEffect } from "react"

function RootComponent() {
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces)

  useEffect(() => {
    loadWorkspaces()
  }, [loadWorkspaces])

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
