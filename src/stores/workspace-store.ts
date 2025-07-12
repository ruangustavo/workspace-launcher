import type { Workspace, WorkspaceStore } from "@/types/workspace";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceStoreState extends WorkspaceStore {
	isLoading: boolean;
	loadWorkspaces: () => Promise<void>;
	saveWorkspaces: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStoreState>()(
	persist(
		(set, get) => ({
			workspaces: [],
			isLoading: false,

			loadWorkspaces: async () => {
				set({ isLoading: true });
				try {
					const data = await invoke<string>("load_workspaces_data");
					const workspaces = JSON.parse(data) as Workspace[];

					const processedWorkspaces = workspaces.map((workspace) => ({
						...workspace,
						createdAt: new Date(workspace.createdAt),
						updatedAt: new Date(workspace.updatedAt),
					}));

					set({ workspaces: processedWorkspaces });
				} catch (error) {
					console.error("Failed to load workspaces:", error);
					toast.error("Failed to load workspaces");
				} finally {
					set({ isLoading: false });
				}
			},

			saveWorkspaces: async () => {
				try {
					const { workspaces } = get();
					const data = JSON.stringify(workspaces, null, 2);
					await invoke("save_workspaces_data", { data });
				} catch (error) {
					console.error("Failed to save workspaces:", error);
					toast.error("Failed to save workspaces");
				}
			},

			addWorkspace: (workspaceData) => {
				const newWorkspace: Workspace = {
					...workspaceData,
					id: crypto.randomUUID(),
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				set((state) => ({
					workspaces: [...state.workspaces, newWorkspace],
				}));

				get().saveWorkspaces();
				toast.success("Workspace added successfully");
			},

			updateWorkspace: (id, updates) => {
				set((state) => ({
					workspaces: state.workspaces.map((workspace) =>
						workspace.id === id
							? { ...workspace, ...updates, updatedAt: new Date() }
							: workspace,
					),
				}));

				get().saveWorkspaces();
				toast.success("Workspace updated successfully");
			},

			deleteWorkspace: (id) => {
				set((state) => ({
					workspaces: state.workspaces.filter(
						(workspace) => workspace.id !== id,
					),
				}));

				get().saveWorkspaces();
				toast.success("Workspace deleted successfully");
			},

			launchWorkspace: async (id) => {
				const { workspaces } = get();
				const workspace = workspaces.find((w) => w.id === id);

				if (!workspace) {
					toast.error("Workspace not found");
					return;
				}

				try {
					const tauriApps = workspace.apps.map((app) => ({
						id: app.id,
						name: app.name,
						path: app.path,
						args: app.args || null,
					}));

					await invoke("launch_workspace_apps", { apps: tauriApps });
					toast.success(`Workspace "${workspace.name}" launched successfully`);
				} catch (error) {
					console.error("Failed to launch workspace:", error);
					toast.error("Failed to launch workspace");
				}
			},
		}),
		{
			name: "workspace-store",
			partialize: (state) => ({ workspaces: state.workspaces }),
		},
	),
);
