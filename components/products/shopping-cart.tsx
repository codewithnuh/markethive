import React from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { ShoppingCartIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Image from "next/image";

const ShoppingCart = () => {
  return (
    <Sheet>
      <SheetTrigger className="ring-0 border-0 focus-visible:ring-0">
        <ShoppingCartIcon />
      </SheetTrigger>
      <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
      <SheetContent>
        <span className="font-bold">Shopping Cart</span>
        <div>
          <Card>
            <CardHeader>
              <div className="w-48 h-48">
                <Image src={"/test-2.png"} width={48} height={48} alt="Image" />
              </div>
            </CardHeader>
            <CardContent>
              PC system All in One APPLE iMac (2023) mqrq3ro/a, Apple M3, 24"
              Retina 4.5K, 8GB, SSD 256GB, 10-core GPU, Keyboard layout INT
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;
