import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SessionPayload } from "./definitions";
import { cookies } from "next/headers";
const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function createSession(userId: string, isAdmin: boolean) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({
    userId,
    isAdmin,
    expiresAt: expiresAt.toISOString(),
  });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as { userId: string; isAdmin: boolean; expiresAt: string };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {}
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
export async function getUserIdFromSession() {
  const cookieStore = cookies();
  const session = (await cookieStore).get("session")?.value;

  if (!session) {
    throw new Error("Session cookie not found");
  }

  const payload = await decrypt(session);

  if (!payload || typeof payload.userId !== "string") {
    throw new Error("Invalid or expired session");
  }

  return payload.userId;
}
