import { decrypt } from "@/lib/auth/session";
import { cookies } from "next/headers";
import React from "react";
import NavBar from "./navbar";

const NavbarWrapper = async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;
  const isAdmin = session?.isAdmin || false;

  return (
    <div>
      <NavBar isAdmin={isAdmin} />
    </div>
  );
};

export default NavbarWrapper;
