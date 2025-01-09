import { isSessionExists } from "@/lib/actions/auth/actions";
import React from "react";
import NavBar from "./navbar";

const NavbarWrapper = async () => {
  const session = await isSessionExists();

  return <NavBar session={session.success} />;
};

export default NavbarWrapper;
