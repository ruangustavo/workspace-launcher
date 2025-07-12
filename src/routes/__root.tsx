import "../index.css"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import { useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { useWorkspaceStore } from "@/stores/workspace-store"

function RootComponent() {
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces)

  useEffect(() => {
    loadWorkspaces()
  }, [loadWorkspaces])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="workspace-launcher-theme">
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
    </ThemeProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
