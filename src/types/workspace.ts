export interface WorkspaceApp {
  id: string
  name: string
  path: string
  args?: string
  icon?: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  icon?: string
  apps: WorkspaceApp[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceStore {
  workspaces: Workspace[]
  addWorkspace: (
    workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">,
  ) => void
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void
  deleteWorkspace: (id: string) => void
  launchWorkspace: (id: string) => Promise<void>
}
