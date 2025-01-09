import "server-only";
import { cookies } from "next/headers";
import { decrypt } from "./auth/session";

export const verifySession = async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  if (session) return true;

  return false;
};
