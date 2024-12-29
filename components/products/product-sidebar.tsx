"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const categories = [
  { name: "All Electronics", count: 100 },
  { name: "Smartwatches", count: 15 },
  { name: "Gaming Consoles", count: 8 },
  { name: "Tablets", count: 12 },
  { name: "Computers", count: 25 },
  { name: "Laptops", count: 20 },
  { name: "Smartphones", count: 20 },
];

export default function Sidebar() {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [isOpen, setIsOpen] = useState(false);

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([Math.min(value, priceRange[1]), priceRange[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
  };

  const sidebarContent = (
    <div className="w-64 flex-shrink-0 space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Categories</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  className="w-full justify-between"
                >
                  {category.name}
                  <span className="text-muted-foreground">
                    ({category.count})
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Price Range</h3>
          <div className="space-y-4">
            <Slider
              value={priceRange}
              max={5000}
              step={100}
              onValueChange={handlePriceChange}
              className="my-6"
            />
            <div className="flex items-center gap-4">
              <div className="grid w-full">
                <label className="text-sm text-muted-foreground mb-2">
                  Min
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={handleMinChange}
                    className="pl-6"
                    min={0}
                    max={priceRange[1]}
                  />
                </div>
              </div>
              <div className="grid w-full">
                <label className="text-sm text-muted-foreground mb-2">
                  Max
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={handleMaxChange}
                    className="pl-6"
                    min={priceRange[0]}
                    max={5000}
                  />
                </div>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Brand</h3>
          <div className="space-y-2">
            {["Apple", "Sony", "Samsung", "Microsoft"].map((brand) => (
              <Button
                key={brand}
                variant="ghost"
                className="w-full justify-start"
              >
                {brand}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetTitle className="sr-only">Filter</SheetTitle>
          {sidebarContent}
        </SheetContent>
      </Sheet>
      <div className="hidden lg:block">{sidebarContent}</div>
    </>
  );
}
