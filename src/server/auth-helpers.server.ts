/**
 * Auth Helpers — Pure server-only utility functions.
 *
 * These are NOT exported to the client. The `.server.ts` extension
 * tells Vite / TanStack Start to exclude this module from client bundles.
 */

import { eq } from "drizzle-orm";

import { db } from "#/db/index.server";
import { sessions } from "#/db/schema";
import { readSessionCookie } from "#/lib/auth-utils.server";

// ── Helpers ────────────────────────────────────────────────

/** Read the current session cookie, validate it, and return the userId. */
export async function getCurrentUserId(): Promise<string | null> {
	const sessionId = readSessionCookie();
	if (!sessionId) return null;

	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, sessionId),
	});

	if (!session) return null;
	if (new Date(session.expiresAt) < new Date()) {
		// Expired — clean up
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		return null;
	}

	return session.userId;
}

/** Like getCurrentUserId but throws if unauthenticated. */
export async function requireUserId(): Promise<string> {
	const userId = await getCurrentUserId();
	if (!userId) throw new Error("Unauthorized");
	return userId;
}
