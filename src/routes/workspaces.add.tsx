import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspaceStore } from "@/stores/workspace-store"
import type { WorkspaceApp } from "@/types/workspace"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  FileIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/workspaces/add")({
  component: RouteComponent,
})

interface WorkspaceFormData {
  name: string
  description: string
  apps: WorkspaceApp[]
}

function RouteComponent() {
  const navigate = useNavigate()
  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WorkspaceFormData>({
    name: "",
    description: "",
    apps: [],
  })

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Workspace name is required")
      return
    }
    setCurrentStep(2)
  }

  const handleAddApp = async () => {
    try {
      const result = await open({
        title: "Select Application",
        multiple: false,
        filters: [
          {
            name: "Executable Files",
            extensions: ["exe", "app", "deb", "rpm", "dmg", "pkg"],
          },
          {
            name: "All Files",
            extensions: ["*"],
          },
        ],
      })

      if (result) {
        const appInfo = await invoke<{
          name: string
          path: string
          exists: boolean
        }>("get_app_info", { path: result })

        const newApp: WorkspaceApp = {
          id: crypto.randomUUID(),
          name: appInfo.name,
          path: appInfo.path,
          args: "",
        }

        setFormData((prev) => ({
          ...prev,
          apps: [...prev.apps, newApp],
        }))

        toast.success("Application added successfully")
      }
    } catch (error) {
      console.error("Failed to add app:", error)
      toast.error("Failed to add application")
    }
  }

  const handleRemoveApp = (appId: string) => {
    setFormData((prev) => ({
      ...prev,
      apps: prev.apps.filter((app) => app.id !== appId),
    }))
  }

  const handleAppUpdate = (appId: string, updates: Partial<WorkspaceApp>) => {
    setFormData((prev) => ({
      ...prev,
      apps: prev.apps.map((app) =>
        app.id === appId ? { ...app, ...updates } : app,
      ),
    }))
  }

  const handleMoveApp = (appId: string, direction: "up" | "down") => {
    setFormData((prev) => {
      const apps = [...prev.apps]
      const index = apps.findIndex((app) => app.id === appId)

      if (direction === "up" && index > 0) {
        ;[apps[index], apps[index - 1]] = [apps[index - 1], apps[index]]
      } else if (direction === "down" && index < apps.length - 1) {
        ;[apps[index], apps[index + 1]] = [apps[index + 1], apps[index]]
      }

      return { ...prev, apps }
    })
  }

  const handleTestLaunch = async () => {
    if (formData.apps.length === 0) {
      toast.error("No applications to test")
      return
    }

    toast.info("Testing workspace launch...")

    try {
      const tauriApps = formData.apps.map((app) => ({
        id: app.id,
        name: app.name,
        path: app.path,
        args: app.args || null,
      }))

      await invoke("launch_workspace_apps", { apps: tauriApps })
      toast.success("Test launch completed")
    } catch (error) {
      console.error("Test launch failed:", error)
      toast.error("Test launch failed")
    }
  }

  const handleSaveWorkspace = () => {
    if (!formData.name.trim()) {
      toast.error("Workspace name is required")
      return
    }

    if (formData.apps.length === 0) {
      toast.error("At least one application is required")
      return
    }

    addWorkspace({
      name: formData.name,
      description: formData.description,
      apps: formData.apps,
    })

    navigate({ to: "/" })
  }

  const renderStepIndicator = () => (
    <div className="flex items-center space-x-2 mb-6">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 1
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        1
      </div>
      <div
        className={`h-1 w-8 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`}
      />
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 2
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        2
      </div>
      <div
        className={`h-1 w-8 ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`}
      />
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 3
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        3
      </div>
    </div>
  )

  const renderBasicInfoStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Give your workspace a name and description
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Development Environment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of what this workspace is for..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              Next
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  const renderAppsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
        <CardDescription>
          Add applications that will be launched together
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAddApp} className="w-full">
          <PlusIcon className="size-4" />
          Add Application
        </Button>

        {formData.apps.length > 0 && (
          <div className="space-y-3">
            {formData.apps.map((app, index) => (
              <div key={app.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4" />
                    <span className="font-medium">{app.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveApp(app.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUpIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveApp(app.id, "down")}
                      disabled={index === formData.apps.length - 1}
                    >
                      <ArrowDownIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveApp(app.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                  {app.path}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`args-${app.id}`}>Arguments</Label>
                  <Input
                    id={`args-${app.id}`}
                    value={app.args || ""}
                    onChange={(e) =>
                      handleAppUpdate(app.id, { args: e.target.value })
                    }
                    placeholder="--flag value"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
          <div className="flex gap-2">
            {formData.apps.length > 0 && (
              <Button variant="outline" onClick={handleTestLaunch}>
                Test Launch
              </Button>
            )}
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={formData.apps.length === 0}
            >
              Next
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderReviewStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Review & Save</CardTitle>
        <CardDescription>
          Review your workspace configuration and save
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Workspace Name</Label>
          <div className="font-medium">{formData.name}</div>
        </div>

        {formData.description && (
          <div className="space-y-2">
            <Label>Description</Label>
            <div className="text-sm text-muted-foreground">
              {formData.description}
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <Label>Applications ({formData.apps.length})</Label>
          <div className="space-y-2">
            {formData.apps.map((app, index) => (
              <div
                key={app.id}
                className="flex items-center gap-2 p-2 bg-muted rounded"
              >
                <Badge variant="outline">{index + 1}</Badge>
                <FileIcon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{app.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {app.path}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
          <Button onClick={handleSaveWorkspace}>Save Workspace</Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Workspace</h1>
      </div>

      {renderStepIndicator()}

      {currentStep === 1 && renderBasicInfoStep()}
      {currentStep === 2 && renderAppsStep()}
      {currentStep === 3 && renderReviewStep()}
    </div>
  )
}
