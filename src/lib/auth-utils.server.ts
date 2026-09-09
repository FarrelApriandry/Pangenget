/**
 * Authentication Utilities — Password hashing & session cookie management
 *
 * Uses Node/Bun built-in scrypt for password hashing and
 * TanStack Start server primitives for HTTP-only cookie management.
 */
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import {
	getRequestHeader,
	setResponseHeader,
} from "@tanstack/react-start/server";

// ── Password hashing (scrypt) ──────────────────────────────

const SCRYPT_KEYLEN = 64;
const SESSION_COOKIE = "pangenget_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function scryptAsync(
	password: string,
	salt: string,
	keylen: number,
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		scrypt(password, salt, keylen, (err, derivedKey) => {
			if (err) reject(err);
			else resolve(derivedKey);
		});
	});
}

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString("hex");
	const derivedKey = await scryptAsync(password, salt, SCRYPT_KEYLEN);
	return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	const [salt, storedHash] = hash.split(":");
	const derivedKey = await scryptAsync(password, salt, SCRYPT_KEYLEN);
	const storedKey = Buffer.from(storedHash, "hex");
	return timingSafeEqual(derivedKey, storedKey);
}

// ── Session ID generation ──────────────────────────────────

export function generateSessionId(): string {
	return randomBytes(32).toString("hex");
}

// ── Session cookie management ──────────────────────────────

export function setSessionCookie(sessionId: string) {
	setResponseHeader(
		"Set-Cookie",
		[
			`${SESSION_COOKIE}=${sessionId}`,
			"HttpOnly",
			"SameSite=Lax",
			"Path=/",
			`Max-Age=${SESSION_MAX_AGE}`,
		].join("; "),
	);
}

export function clearSessionCookie() {
	setResponseHeader(
		"Set-Cookie",
		`${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
	);
}

export function readSessionCookie(): string | null {
	const header = getRequestHeader("cookie");
	if (!header) return null;
	for (const part of header.split(/;\s*/)) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		if (part.slice(0, eq) === SESSION_COOKIE) return part.slice(eq + 1);
	}
	return null;
}
