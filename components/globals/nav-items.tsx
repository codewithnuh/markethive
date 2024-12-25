import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { UserIcon } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
const NavItems = () => {
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  return isSignedIn ? (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 ">
        <UserIcon />
        <span>Account</span>{" "}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-8 focus:outline-none">
        <DropdownMenuLabel> My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={"/profile"}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>
          <Button onClick={() => signOut({ redirectUrl: "/" })}>SignOut</Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button asChild size={"sm"}>
      <Link href={"/signin"}>SignIn</Link>
    </Button>
  );
};

export default NavItems;
