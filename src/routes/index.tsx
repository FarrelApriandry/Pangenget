import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: IndexPage,
});

function IndexPage() {
	return (
		<main className="max-w-4xl mx-auto px-6 py-8">
			<h1 className="text-2xl font-semibold text-text-main">
				Pangenget — My Day
			</h1>
			<p className="text-text-muted mt-2">Coming soon...</p>
		</main>
	);
}
