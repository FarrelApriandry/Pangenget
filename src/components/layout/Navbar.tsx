/**
 * Navbar — Sticky top header (Design: Navigation)
 *
 * Matches the design reference: sticky backdrop-blur header
 * with Pangenget logo, My Day / Semua Tugas nav links,
 * and user session display with logout.
 */
import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { logoutUser } from "#/server/auth";

const NAV_ITEMS = [
	{ to: "/", label: "My Day", icon: "wb_sunny" },
	{ to: "/tasks", label: "Semua Tugas", icon: "task_alt" },
];

export function Navbar() {
	const { currentUser } = useRouteContext({ from: "__root__" });
	const location = useLocation();
	const isOnAuthPage =
		location.pathname === "/login" || location.pathname === "/register";

	const handleLogout = async () => {
		await logoutUser();
	};

	return (
		<header className="sticky top-0 z-30 w-full backdrop-blur-md bg-canvas/80 border-b border-card-border/40">
			<div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
				{/* Left: Logo & Core Navigation */}
				<div className="flex items-center gap-7">
					<Link to="/" className="flex items-center gap-2.5 group">
						<span className="text-sm font-semibold tracking-tight text-[#e2e5cf] group-hover:text-white transition-colors">
							Pangenget
						</span>
					</Link>

					{!isOnAuthPage && (
						<nav className="hidden sm:flex items-center gap-5 text-xs font-medium">
							{NAV_ITEMS.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									className="flex items-center gap-1.5 py-1 text-text-muted hover:text-text-main transition-colors"
									activeProps={{
										className:
											"text-white flex items-center gap-1.5 py-1 border-b border-primary",
									}}
								>
									<span className="material-symbols-outlined text-[16px]">
										{item.icon}
									</span>
									<span>{item.label}</span>
								</Link>
							))}
						</nav>
					)}
				</div>

				{/* Right: Auth / User info */}
				<div className="flex items-center gap-3">
					{currentUser ? (
						<div className="flex items-center gap-3">
							<span className="text-xs text-text-muted font-mono hidden sm:inline">
								{currentUser.name ?? currentUser.email}
							</span>
							<button
								type="button"
								onClick={handleLogout}
								className="text-xs font-medium text-text-muted hover:text-text-main border border-card-border/50 rounded-md px-3 py-1.5 hover:border-card-border transition-colors"
							>
								Keluar
							</button>
						</div>
					) : (
						!isOnAuthPage && (
							<Link
								to="/login"
								className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
							>
								Masuk
							</Link>
						)
					)}

					{/* Mobile nav trigger */}
					<button
						type="button"
						className="sm:hidden text-text-muted hover:text-text-main p-1 transition-colors"
						aria-label="Menu"
					>
						<span className="material-symbols-outlined">menu</span>
					</button>
				</div>
			</div>
		</header>
	);
}
