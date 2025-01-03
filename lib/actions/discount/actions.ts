// lib/actions/discount/actions.ts
"use server";

import { db } from "@/lib/database/db";
import { revalidatePath } from "next/cache";

// Assuming your Discount type looks like this:
interface Discount {
  discount: number;
}

export async function addDiscount({
  discountPercentage,
}: {
  discountPercentage: number;
}): Promise<{ message: string }> {
  try {
    // First, delete any existing discount to ensure only one is active
    await db.discount.deleteMany();

    // Then, create the new discount
    await db.discount.create({
      data: { discount: discountPercentage },
    });

    revalidatePath("/admin/dashboard");
    return { message: "Discount added successfully!" };
  } catch (error) {
    console.error("Error adding discount:", error);
    return { message: "Error adding discount!" };
  }
}

//Updated discount
export async function updateDiscount({
  discountId,
  discountPercentage,
}: {
  discountId: string;
  discountPercentage: number;
}): Promise<{ message: string }> {
  try {
    await db.discount.update({
      where: { id: discountId },
      data: { discount: discountPercentage },
    });

    revalidatePath("/admin/dashboard");
    return { message: "Discount updated successfully!" };
  } catch (error) {
    console.error("Error updating discount:", error);
    return { message: "Error updating discount!" };
  }
}
//get discount
export async function getDiscount(): Promise<Discount | null> {
  try {
    const discount = await db.discount.findFirst();
    return discount;
  } catch (error) {
    console.error("Error fetching discount:", error);
    return null;
  }
}
