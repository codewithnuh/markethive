"use client";
import React, { useEffect, useState } from "react";
import { ModeToggle } from "../theme/theme-toggler";
import Link from "next/link";
import CartSidebar from "../products/cart-sidebar";
import { getDiscount } from "@/lib/actions/discount/actions";
import { Separator } from "@/components/ui/separator";
import { MenuIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { logout } from "@/lib/actions/auth/actions";
import { useAuth } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
const NavBar = ({ session }: { session: boolean }) => {
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  // Simulate fetching discount percentage from the backend
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const response = await getDiscount();
        if (!response?.discount) {
          throw new Error("Failed to fetch discount");
        }
        setDiscountPercentage(response.discount);
        setError(null);
      } catch (err) {
        setError("Unable to load discount information");
        setDiscountPercentage(null);
        console.error("Error fetching discount:", err);
      }
    };

    fetchDiscount();
  }, []);

  return (
    <header>
      {/* Discount Banner */}
      {discountPercentage && !error && (
        <div className="bg-orange-900 text-white text-sm py-2 text-center">
          🎉 Hurry! Enjoy {discountPercentage}% off on all items for a limited
          time!
        </div>
      )}
      {error && (
        <div className="bg-red-600 text-white text-sm py-2 text-center">
          {error}
        </div>
      )}
      <nav className="container py-6 flex justify-between items-center">
        {/* Logo */}
        <div className="font-bold text-xl uppercase tracking-wide">
          <Link href={"/"}>
            Market<span className="text-[#e23a39]">Hive</span>
          </Link>
        </div>

        {/* Navigation and Tools */}
        <div className="flex items-center space-x-4">
          {/* Sheet trigger and content */}
          <Sheet>
            <SheetTrigger>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side={"left"}>
              <SheetTitle className="mt-4">ADMIN</SheetTitle>
              <Separator />

              <ul className="flex flex-col items-start space-y-2 text-sm justify-center mt-3">
                {session && (
                  <>
                    <li>
                      <Link href={"/admin"}>Dashboard</Link>
                    </li>
                    <li>
                      <Link href={"/admin/product/create"}>Create Product</Link>
                    </li>
                  </>
                )}
                <li>
                  {session ? (
                    <form action={logout}>
                      <Button size={"sm"}>Logout</Button>
                    </form>
                  ) : (
                    <Button asChild size={"sm"}>
                      <Link href={"/admin/sign-in"}>SignIn</Link>
                    </Button>
                  )}
                </li>
              </ul>
              <SheetTitle className="mt-4">User</SheetTitle>
              <Separator />
              <ul className="flex flex-col items-start space-y-2 text-sm justify-center mt-3">
                {isSignedIn && (
                  <>
                    <li>
                      <Link href={"/profile"}>Profile</Link>
                    </li>
                    <li>
                      <Link href={"/orders"}>Orders</Link>
                    </li>
                  </>
                )}
                <li>
                  {isSignedIn ? (
                    <Button
                      onClick={() => signOut({ redirectUrl: "/" })}
                      size={"sm"}
                    >
                      Logout
                    </Button>
                  ) : (
                    <Button asChild size={"sm"}>
                      <Link href={"/sign-in"}>SignIn</Link>
                    </Button>
                  )}
                </li>
              </ul>
            </SheetContent>
          </Sheet>
          <ModeToggle />
          <div>
            <CartSidebar />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
