"use client";
import React, { useEffect, useState } from "react";
import { ModeToggle } from "../theme/theme-toggler";
import Link from "next/link";
import NavItems from "./nav-items";
import CartSidebar from "../products/cart-sidebar";
import { getDiscount } from "@/lib/actions/discount/actions";

const NavBar = ({ isAdmin }: { isAdmin: boolean | undefined }) => {
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

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
  console.log(isAdmin);
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
          <NavItems isAdmin={isAdmin} />
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
