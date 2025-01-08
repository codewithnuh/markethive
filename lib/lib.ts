import { cookies } from "next/headers";
import { decrypt } from "./auth/session";
export let isAdmin: boolean | undefined = false;
const getSessionDetails = async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  // Determine if the user is the admin
  isAdmin = session?.isAdmin;
};

getSessionDetails();
