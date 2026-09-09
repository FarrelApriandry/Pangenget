/**
 * Login Page — Serene Olive design
 */
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { getCurrentUser, loginUser } from "#/server/auth";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		try {
			const user = await getCurrentUser();
			if (user) throw redirect({ to: "/" });
		} catch (e) {
			if (e && typeof e === "object" && "href" in e) throw e;
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setLoading(true);
			try {
				const result = await loginUser({
					data: { email, password },
				});
				if (result?.error) {
					setError(result.error);
				}
			} catch (err) {
				if (err && typeof err === "object" && "href" in err) {
					throw err;
				}
				setError("Terjadi kesalahan. Silakan coba lagi.");
			} finally {
				setLoading(false);
			}
		},
		[email, password],
	);

	return (
		<main className="max-w-sm mx-auto px-6 py-16">
			<div className="mb-8 text-center">
				<h1 className="text-2xl font-semibold text-[#e8ecd4] tracking-tight">
					Masuk
				</h1>
				<p className="text-sm text-text-muted mt-1">
					Selamat datang kembali di Pangenget
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="rounded-lg bg-urgent-bg border border-urgent-border/50 px-4 py-3 text-sm text-urgent-text">
						{error}
					</div>
				)}

				<div>
					<label
						htmlFor="email"
						className="block text-xs font-medium text-text-muted mb-1.5 font-mono uppercase tracking-wider"
					>
						Email
					</label>
					<input
						id="email"
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="kamu@email.com"
						className="w-full rounded-lg border border-card-border bg-surface-muted px-4 py-2.5 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:shadow-[0_0_0_1px_#a4ac86] transition-colors"
					/>
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-xs font-medium text-text-muted mb-1.5 font-mono uppercase tracking-wider"
					>
						Kata Sandi
					</label>
					<input
						id="password"
						type="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="••••••••"
						className="w-full rounded-lg border border-card-border bg-surface-muted px-4 py-2.5 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:shadow-[0_0_0_1px_#a4ac86] transition-colors"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-lg bg-[#a4ac86] hover:bg-[#b6bf97] disabled:opacity-50 text-[#1c2317] font-semibold text-sm py-2.5 transition-colors"
				>
					{loading ? "Masuk..." : "Masuk"}
				</button>
			</form>

			<p className="mt-6 text-center text-xs text-text-muted">
				Belum punya akun?{" "}
				<Link
					to="/register"
					className="text-primary hover:text-primary-hover transition-colors"
				>
					Daftar
				</Link>
			</p>
		</main>
	);
}
