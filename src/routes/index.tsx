import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	EditIcon,
	FolderIcon,
	MoreVerticalIcon,
	PlayIcon,
	PlusIcon,
	StopCircleIcon,
	Trash2Icon,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		workspaces,
		workspaceStatuses,
		launchWorkspace,
		stopWorkspace,
		deleteWorkspace,
	} = useWorkspaceStore();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(
		null,
	);

	const handleDeleteWorkspace = (workspaceId: string) => {
		setWorkspaceToDelete(workspaceId);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (workspaceToDelete) {
			deleteWorkspace(workspaceToDelete);
			setDeleteDialogOpen(false);
			setWorkspaceToDelete(null);
		}
	};

	if (workspaces.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-4">
				<div className="text-center">
					<FolderIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
					<h2 className="text-2xl font-semibold mb-2">No workspaces yet</h2>
					<p className="text-muted-foreground mb-6 max-w-md">
						Create your first workspace to get started. A workspace is a
						collection of applications that launch together to set up your work
						environment.
					</p>
					<Button asChild size="lg">
						<Link to="/workspaces/add">
							<PlusIcon className="size-4" />
							Create Your First Workspace
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Your Workspaces</h1>
					<p className="text-muted-foreground">
						Manage and launch your application workspaces
					</p>
				</div>
				<Button asChild>
					<Link to="/workspaces/add">
						<PlusIcon className="size-4" />
						Add Workspace
					</Link>
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{workspaces.map((workspace) => {
					const status = workspaceStatuses[workspace.id];
					const isRunning = status?.isRunning || false;
					const hasProgress = status?.launchProgress;
					const progressPercentage = hasProgress
						? Math.round((hasProgress.completed / hasProgress.total) * 100)
						: 0;

					return (
						<Card key={workspace.id} className="flex flex-col">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex-1 min-w-0">
										<CardTitle className="text-lg truncate">
											{workspace.name}
										</CardTitle>
										{workspace.description && (
											<CardDescription className="mt-1 line-clamp-2">
												{workspace.description}
											</CardDescription>
										)}
									</div>
									<div className="flex items-center gap-2">
										{isRunning && (
											<Badge variant="secondary" className="text-xs">
												Running
											</Badge>
										)}
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
								</div>
							</CardHeader>

							<CardContent className="flex-1">
								<div className="space-y-3">
									<div className="text-sm text-muted-foreground">
										{workspace.apps.length} app
										{workspace.apps.length !== 1 ? "s" : ""}
									</div>

									{hasProgress && (
										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span>Launching...</span>
												<span>{progressPercentage}%</span>
											</div>
											<Progress value={progressPercentage} className="h-2" />
											<div className="text-xs text-muted-foreground">
												{hasProgress.current}
											</div>
										</div>
									)}

									{workspace.apps.length > 0 && (
										<div className="text-xs text-muted-foreground">
											<div className="space-y-1">
												{workspace.apps.slice(0, 3).map((app) => (
													<div key={app.id} className="truncate">
														• {app.name}
													</div>
												))}
												{workspace.apps.length > 3 && (
													<div>• +{workspace.apps.length - 3} more</div>
												)}
											</div>
										</div>
									)}
								</div>
							</CardContent>

							<CardFooter className="pt-3">
								<div className="flex gap-2 w-full">
									{isRunning ? (
										<Button
											variant="outline"
											size="sm"
											onClick={() => stopWorkspace(workspace.id)}
											className="flex-1"
										>
											<StopCircleIcon className="size-4" />
											Stop
										</Button>
									) : (
										<Button
											size="sm"
											onClick={() => launchWorkspace(workspace.id)}
											variant="outline"
											disabled={!!hasProgress}
											className="flex-1"
										>
											<PlayIcon className="size-4" />
											{hasProgress ? "Launching..." : "Launch"}
										</Button>
									)}
								</div>
							</CardFooter>
						</Card>
					);
				})}
			</div>

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
		</div>
	);
}
