"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth/actions";

const NavItems = ({ session }: { session: boolean }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname(); // Get the current route

  const isOnAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {/* If on admin route and admin is signed in */}
      {isOnAdminRoute && session ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2">
            <UserIcon />
            <span>Admin Account</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-8 focus:outline-none">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Admin-Specific Links */}
            <DropdownMenuItem>
              <Link href={"/admin"}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={"/admin/product/create"}>Create Product</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <form action={logout}>
                <Button size="sm">Logout as Admin</Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // If on non-admin route
        <>
          {user?.id ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2">
                <UserIcon />
                <span>Account</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-8 focus:outline-none">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* User-Specific Links */}
                <DropdownMenuItem>
                  <Link href={"/profile"}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={"/orders"}>My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button onClick={() => signOut({ redirectUrl: "/" })}>
                    SignOut
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // If user is not signed in
            <Button asChild size="sm">
              <Link href={"/sign-in"}>Sign In</Link>
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default NavItems;
