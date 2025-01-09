// app/api/session/route.ts
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get("session")?.value;

    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ error: "Session cookie not found", isAdmin: false }),
        { status: 401 }
      );
    }

    const session = await decrypt(sessionCookie);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Failed to verify session", isAdmin: false }),
        { status: 403 }
      );
    }

    return new Response(JSON.stringify({ isAdmin: session.isAdmin }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error validating session:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", isAdmin: false }),
      { status: 500 }
    );
  }
}
