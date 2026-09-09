/**
 * Auth Server Functions — Registration, login, logout, session validation
 *
 * Uses cookie-based sessions stored in the `sessions` table.
 * Only `createServerFn` wrappers are exported here to keep this file
 * safe for client imports. Plain helpers live in `auth-helpers.server.ts`.
 */

import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq, lt } from "drizzle-orm";

import { db } from "#/db/index.server";
import { sessions, users } from "#/db/schema";
import {
	clearSessionCookie,
	generateSessionId,
	hashPassword,
	readSessionCookie,
	setSessionCookie,
	verifyPassword,
} from "#/lib/auth-utils.server";
import { getCurrentUserId } from "#/server/auth-helpers.server";

// ── GET: Current user ──────────────────────────────────────

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await getCurrentUserId();
		if (!userId) return null;

		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: { id: true, email: true, name: true },
		});

		return user ?? null;
	},
);

// ── POST: Register ─────────────────────────────────────────

export const registerUser = createServerFn({ method: "POST" })
	.validator((data: { email: string; password: string; name?: string }) => data)
	.handler(async ({ data }) => {
		const email = data.email.trim().toLowerCase();

		// Check for existing user
		const existing = await db.query.users.findFirst({
			where: eq(users.email, email),
		});
		if (existing) {
			return { error: "Email sudah terdaftar." };
		}

		// Create user
		const passwordHash = await hashPassword(data.password);
		const [user] = await db
			.insert(users)
			.values({
				email,
				passwordHash,
				name: data.name?.trim() || null,
			})
			.returning({ id: users.id });

		// Create session
		const sessionId = generateSessionId();
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
		await db.insert(sessions).values({
			id: sessionId,
			userId: user.id,
			expiresAt,
		});

		setSessionCookie(sessionId);
		throw redirect({ to: "/" });
	});

// ── POST: Login ────────────────────────────────────────────

export const loginUser = createServerFn({ method: "POST" })
	.validator((data: { email: string; password: string }) => data)
	.handler(async ({ data }) => {
		const email = data.email.trim().toLowerCase();

		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});
		if (!user) {
			return { error: "Email atau kata sandi salah." };
		}

		const valid = await verifyPassword(data.password, user.passwordHash);
		if (!valid) {
			return { error: "Email atau kata sandi salah." };
		}

		// Create session
		const sessionId = generateSessionId();
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
		await db.insert(sessions).values({
			id: sessionId,
			userId: user.id,
			expiresAt,
		});

		setSessionCookie(sessionId);
		throw redirect({ to: "/" });
	});

// ── POST: Logout ───────────────────────────────────────────

export const logoutUser = createServerFn({ method: "POST" }).handler(
	async () => {
		const sessionId = readSessionCookie();
		if (sessionId) {
			await db.delete(sessions).where(eq(sessions.id, sessionId));
		}
		clearSessionCookie();
		throw redirect({ to: "/login" });
	},
);

// ── Housekeeping: clean expired sessions ───────────────────

export const cleanExpiredSessions = createServerFn({ method: "POST" }).handler(
	async () => {
		await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
	},
);
