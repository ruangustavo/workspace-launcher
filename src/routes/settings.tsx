import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeftIcon, SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({
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
				<h1 className="text-2xl font-bold">Settings</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<SettingsIcon className="h-5 w-5" />
						Application Settings
					</CardTitle>
					<CardDescription>
						Configure your workspace launcher preferences
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground">
						Settings panel coming soon! This will include options for:
						<ul className="list-disc list-inside mt-2 space-y-1">
							<li>Auto-start with system</li>
							<li>Hide window after launching workspace</li>
							<li>Global keyboard shortcuts</li>
							<li>Theme preferences</li>
							<li>Default launch delays</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
