import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const ProductCard = () => {
  return (
    <Card className="border-2 border-primary bg-background/50 ">
      <CardHeader>
        <div className="aspect-[4/2.5] relative">
          <Image
            src={"/test-2.png"}
            alt="window"
            fill
            className="object-cover absolute"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h2 className="font-semibold text-2xl">{` Apple iMac 27", 1TB HDD, Retina 5K Display, M3 Max`}</h2>

          <div className="flex items-center justify-between ">
            <span className="font-bold text-xl">$1,699</span>

            <ShoppingCart />
            <Dialog>
              <DialogTrigger>
                <span>Add to card</span>
              </DialogTrigger>
              <DialogTitle className="sr-only">Product Details</DialogTitle>
              <DialogContent>
                <h1>HEllo</h1>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
