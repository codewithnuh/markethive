"use client";
import React, { useEffect, useState } from "react";
import { ModeToggle } from "../theme/theme-toggler";
import Link from "next/link";
import NavItems from "./nav-items";
import CartSidebar from "../products/cart-sidebar";

const NavBar = () => {
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(
    null
  );

  // Simulate fetching discount percentage from the backend
  useEffect(() => {
    const fetchDiscount = async () => {
      // Mock API response - replace with actual API call if needed
      const mockDiscount = 20; // Example: 20% off
      setDiscountPercentage(mockDiscount > 0 ? mockDiscount : null);
    };

    fetchDiscount();
  }, []);

  return (
    <header>
      {/* Discount Banner */}
      {discountPercentage && (
        <div className="bg-orange-900 text-white text-sm py-2 text-center">
          🎉 Hurry! Enjoy {discountPercentage}% off on all items for a limited
          time!
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
          <NavItems />
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
