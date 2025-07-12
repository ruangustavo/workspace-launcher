export interface WorkspaceApp {
	id: string;
	name: string;
	path: string;
	args?: string;
	delay?: number; // seconds to wait before launching
	icon?: string;
}

export interface Workspace {
	id: string;
	name: string;
	description?: string;
	icon?: string;
	apps: WorkspaceApp[];
	createdAt: Date;
	updatedAt: Date;
}

export interface WorkspaceStatus {
	id: string;
	isRunning: boolean;
	runningApps: string[]; // app IDs that are currently running
	launchProgress?: {
		total: number;
		completed: number;
		current?: string; // current app being launched
	};
}

export interface WorkspaceStore {
	workspaces: Workspace[];
	workspaceStatuses: Record<string, WorkspaceStatus>;
	addWorkspace: (
		workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">,
	) => void;
	updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
	deleteWorkspace: (id: string) => void;
	launchWorkspace: (id: string) => Promise<void>;
	stopWorkspace: (id: string) => Promise<void>;
	updateWorkspaceStatus: (id: string, status: Partial<WorkspaceStatus>) => void;
}
