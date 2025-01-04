"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  addDiscount,
  getDiscount,
  updateDiscount,
  Discount,
} from "@/lib/actions/discount/actions";

export function DiscountsManager() {
  const [discount, setDiscount] = useState<string>("");
  const [existingDiscount, setExistingDiscount] = useState<Discount | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDiscount = async () => {
      const discountData = await getDiscount();
      if (discountData) {
        setExistingDiscount(discountData);
        setDiscount(discountData.discount.toString());
      }
    };
    fetchDiscount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const discountValue = parseInt(discount, 10);

    if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      setErrorMessage("Please enter a valid number between 0 and 100.");
      return;
    } else {
      setErrorMessage(null);
    }

    try {
      let res;
      if (existingDiscount) {
        // Update existing discount
        res = await updateDiscount({
          discountId: existingDiscount.id,
          discountPercentage: discountValue,
        });
        setExistingDiscount({ ...existingDiscount, discount: discountValue });
      } else {
        // Add new discount
        res = await addDiscount({
          discountPercentage: discountValue,
        });
        // After adding, fetch the new discount to get its ID
        const newDiscount = await getDiscount();
        setExistingDiscount(newDiscount);
      }

      toast({
        title: existingDiscount ? "Discount Updated" : "Discount Applied",
        description: res.message,
      });
    } catch (error) {
      console.error("Error updating/adding discount:", error);
      toast({
        title: "Error",
        description: "Failed to apply discount. Please try again.",
        variant: "destructive",
      });
    }
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
        <Button type="submit">
          {existingDiscount ? "Update Discount" : "Apply Discount"}
        </Button>
      </form>
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      {existingDiscount && (
        <p className="mt-4">
          Current active discount: {existingDiscount.discount}%
        </p>
      )}
    </div>
  );
}
