import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "@workspace/ui/shared/theme-toggle/theme-toggle";

export default function Page() {
	return (
		<div className="flex items-center justify-center min-h-svh">
			<div className="flex flex-col items-center justify-center gap-4">
				<h1 className="text-2xl font-bold">Hello Consumer</h1>
				<Button size="sm">Button</Button>
			</div>
			<ThemeToggle />
		</div>
	);
}
