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
const NavItems = ({ isAdmin }: { isAdmin: boolean | undefined }) => {
  const { user } = useUser();
  const { signOut } = useClerk();

  return user?.id !== undefined ? (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 ">
        <UserIcon />
        <span>Account</span>{" "}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-8 focus:outline-none">
        <DropdownMenuLabel> My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem>
              <Link href={"/admin"}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={"/admin/product/create"}>Create Product</Link>
            </DropdownMenuItem>
          </>
        )}
        <>
          <DropdownMenuItem>
            <Link href={"/profile"}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={"/orders"}>Orders</Link>
          </DropdownMenuItem>
        </>

        <DropdownMenuItem>
          <Button onClick={() => signOut({ redirectUrl: "/" })}>SignOut</Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button asChild size={"sm"}>
      <Link href={"/sign-in"}>SignIn</Link>
    </Button>
  );
};

export default NavItems;
