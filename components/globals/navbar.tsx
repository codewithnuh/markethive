"use client";
import React from "react";
import { ModeToggle } from "../theme/theme-toggler";
import Link from "next/link";
import NavItems from "./nav-items";
import ShoppingCart from "../products/shopping-cart";
const NavBar = () => {
  return (
    <header>
      <nav className="container py-8 flex justify-between items-center">
        <div className="font-bold text-xl uppercase tracking-wide">
          <Link href={"/"}>
            Market<span className="text-primary">Hive</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <NavItems />
          <ModeToggle />
          <div>
            <ShoppingCart />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
