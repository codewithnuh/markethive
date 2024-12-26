"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function DiscountsManager() {
  const [discount, setDiscount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the discount to your backend
    console.log("Discount submitted:", discount);
    setDiscount("");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage Discounts</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="discount">Discount Percentage</Label>
          <Input
            id="discount"
            type="number"
            placeholder="Enter discount percentage"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            min="0"
            max="100"
            required
          />
        </div>
        <Button type="submit">Apply Discount</Button>
      </form>
    </div>
  );
}
