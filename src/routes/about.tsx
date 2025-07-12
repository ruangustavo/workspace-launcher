import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon, FolderIcon } from "lucide-react";

export const Route = createFileRoute("/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="flex items-center gap-2">
				<Link to="/">
					<Button variant="ghost" size="icon">
						<ArrowLeftIcon className="h-4 w-4" />
					</Button>
				</Link>
				<h1 className="text-2xl font-bold">About</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FolderIcon className="h-5 w-5" />
						Workspace Launcher
						<Badge variant="secondary">v0.1.0</Badge>
					</CardTitle>
					<CardDescription>
						A productivity tool for managing and launching application
						workspaces
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h3 className="font-semibold mb-2">What is Workspace Launcher?</h3>
						<p className="text-muted-foreground">
							Workspace Launcher is a desktop application that helps you
							organize and launch multiple applications together as a
							"workspace". This is perfect for setting up your work environment
							quickly - whether you're starting a development session, design
							work, or any other activity that requires multiple programs.
						</p>
					</div>

					<div>
						<h3 className="font-semibold mb-2">Key Features</h3>
						<ul className="list-disc list-inside text-muted-foreground space-y-1">
							<li>Create custom workspaces with multiple applications</li>
							<li>Configure launch arguments for each app</li>
							<li>Test launch functionality before saving</li>
							<li>Modern, intuitive interface built with React and Tauri</li>
							<li>Cross-platform support (Windows, macOS, Linux)</li>
						</ul>
					</div>

					<div>
						<h3 className="font-semibold mb-2">Built With</h3>
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline">React</Badge>
							<Badge variant="outline">TypeScript</Badge>
							<Badge variant="outline">Tauri</Badge>
							<Badge variant="outline">Tailwind CSS</Badge>
							<Badge variant="outline">shadcn/ui</Badge>
							<Badge variant="outline">Zustand</Badge>
						</div>
					</div>

					<div className="text-sm text-muted-foreground">
						<p>
							This application was created to boost productivity by eliminating
							the manual process of opening multiple applications every time you
							start working on a project.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
