import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { Navbar } from "#/components/layout/Navbar";
import { getCurrentUser } from "#/server/auth";
import appCss from "../styles.css?url";

interface AuthUser {
	id: string;
	email: string;
	name: string | null;
}

export const Route = createRootRoute({
	beforeLoad: async () => {
		try {
			const user = await getCurrentUser();
			return { currentUser: user as AuthUser | null };
		} catch {
			return { currentUser: null as AuthUser | null };
		}
	},
	notFoundComponent: () => (
		<div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
			<h1 className="text-xl font-bold">404 — Halaman Tidak Ditemukan</h1>
			<a href="/" className="text-primary hover:underline text-sm">
				Kembali ke My Day
			</a>
		</div>
	),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: "Pangenget — Kelola Tugasmu" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
			},
		],
	}),
	component: RootDocument,
});

function RootDocument() {
	return (
		<html lang="id" className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="bg-canvas text-text-main min-h-screen font-sans antialiased selection:bg-primary selection:text-canvas">
				<Navbar />
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
