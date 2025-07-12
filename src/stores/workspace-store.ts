import type { Workspace, WorkspaceStore } from "@/types/workspace";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
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
			workspaceStatuses: {},
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
					workspaceStatuses: {
						...state.workspaceStatuses,
						[newWorkspace.id]: {
							id: newWorkspace.id,
							isRunning: false,
							runningApps: [],
						},
					},
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
					workspaceStatuses: Object.fromEntries(
						Object.entries(state.workspaceStatuses).filter(
							([key]) => key !== id,
						),
					),
				}));

				get().saveWorkspaces();
				toast.success("Workspace deleted successfully");
			},

			launchWorkspace: async (id) => {
				const { workspaces, workspaceStatuses } = get();
				const workspace = workspaces.find((w) => w.id === id);

				if (!workspace) {
					toast.error("Workspace not found");
					return;
				}

				if (workspaceStatuses[id]?.isRunning) {
					toast.info("Workspace is already running");
					return;
				}

				set((state) => ({
					workspaceStatuses: {
						...state.workspaceStatuses,
						[id]: {
							id,
							isRunning: true,
							runningApps: [],
							launchProgress: {
								total: workspace.apps.length,
								completed: 0,
								current: workspace.apps[0]?.name,
							},
						},
					},
				}));

				const unlistenProgress = await listen(
					"workspace-launch-progress",
					(event) => {
						const payload = event.payload as {
							current: number;
							total: number;
							app_name: string;
							app_id: string;
						};

						get().updateWorkspaceStatus(id, {
							launchProgress: {
								total: payload.total,
								completed: payload.current,
								current: payload.app_name,
							},
						});
					},
				);

				const unlistenComplete = await listen(
					"workspace-launch-complete",
					(event) => {
						const payload = event.payload as {
							results: Array<{
								success: boolean;
								app_id: string;
								error?: string;
							}>;
						};

						const successfulApps = payload.results
							.filter((result) => result.success)
							.map((result) => result.app_id);

						const failedApps = payload.results.filter(
							(result) => !result.success,
						);

						get().updateWorkspaceStatus(id, {
							isRunning: successfulApps.length > 0,
							runningApps: successfulApps,
							launchProgress: undefined,
						});

						if (failedApps.length > 0) {
							toast.error(`Failed to launch ${failedApps.length} app(s)`);
						} else {
							toast.success(
								`Workspace "${workspace.name}" launched successfully`,
							);
						}

						unlistenProgress();
						unlistenComplete();
					},
				);

				try {
					const tauriApps = workspace.apps.map((app) => ({
						id: app.id,
						name: app.name,
						path: app.path,
						args: app.args || null,
						delay: app.delay || null,
					}));

					await invoke("launch_workspace_apps", { apps: tauriApps });
				} catch (error) {
					console.error("Failed to launch workspace:", error);
					toast.error("Failed to launch workspace");

					get().updateWorkspaceStatus(id, {
						isRunning: false,
						runningApps: [],
						launchProgress: undefined,
					});

					unlistenProgress();
					unlistenComplete();
				}
			},

			stopWorkspace: async (id) => {
				set((state) => ({
					workspaceStatuses: {
						...state.workspaceStatuses,
						[id]: {
							id,
							isRunning: false,
							runningApps: [],
						},
					},
				}));

				toast.success("Workspace stopped");
			},

			updateWorkspaceStatus: (id, status) => {
				set((state) => ({
					workspaceStatuses: {
						...state.workspaceStatuses,
						[id]: {
							...state.workspaceStatuses[id],
							...status,
						},
					},
				}));
			},
		}),
		{
			name: "workspace-store",
			partialize: (state) => ({ workspaces: state.workspaces }),
		},
	),
);
