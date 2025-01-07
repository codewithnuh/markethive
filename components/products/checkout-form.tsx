"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  createCheckoutSession,
  createOrder,
} from "@/lib/actions/stripe/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { getCurrentCartId } from "@/lib/actions/product/cart/actions";

const addressSchema = z.object({
  addressLine1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(["cash", "stripe"]),
});

type CheckoutFormData = z.infer<typeof addressSchema> &
  z.infer<typeof paymentSchema>;

export const CheckoutForm = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<"payment" | "address" | "confirmation">(
    "payment"
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe" | null>(
    null
  );
  const { toast } = useToast();
  const router = useRouter();
  const { userId } = useAuth();

  // Dynamically set validation schema based on the current step
  const getValidationSchema = () => {
    if (step === "payment") {
      return paymentSchema;
    } else if (step === "address") {
      return addressSchema;
    } else {
      return addressSchema.merge(paymentSchema); // Use full schema for confirmation
    }
  };

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(getValidationSchema()),
    defaultValues: {
      addressLine1: "",
      city: "",
      zipCode: "",
      country: "",
      paymentMethod: "cash",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (step === "payment") {
      setPaymentMethod(data.paymentMethod); // Save payment method
      setStep("address"); // Move to address step
    } else if (step === "address") {
      setStep("confirmation"); // Move to confirmation step
    } else {
      try {
        if (data.paymentMethod === "stripe") {
          const result = await createCheckoutSession();
          if (result.success) {
            toast({
              variant: "default",
              title: "Redirecting to Stripe",
              description: "Please complete your payment on Stripe.",
            });
            router.push(result.url as string);
          } else {
            throw new Error(result.error || "Stripe checkout failed");
          }
        } else if (data.paymentMethod === "cash") {
          if (!userId) {
            throw new Error("Please sign in");
          }

          const cartId = await getCurrentCartId(userId);
          if (!cartId) {
            throw new Error("No cart found");
          }

          const result = await createOrder({
            paymentMethod: "CASH_ON_DELIVERY",
            cartId,
            userId,
            paymentAddress: {
              name: data.city, // You can update this with an input field if needed
              address: data.addressLine1,
              countryName: data.country,
              postalCode: data.zipCode,
            },
          });

          if (result.success) {
            toast({
              variant: "default",
              title: "Order Placed Successfully",
              description: "Your order has been placed successfully!",
            });
            onClose(); // Close the checkout modal or reset the form
          } else {
            throw new Error("Failed to place the order");
          }
        } else {
          throw new Error("Invalid payment method selected");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Checkout Error",
          description:
            error instanceof Error ? error.message : "An error occurred",
        });
      }
    }
  };

  return (
    <ScrollArea>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Payment Step */}
          {step === "payment" && (
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cash" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Cash on Delivery
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="stripe" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Pay with Stripe
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Address Step */}
          {step === "address" && (
            <>
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Confirmation Step */}
          {step === "confirmation" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Confirmation</h3>
              <p>Please review your order details:</p>
              <div>
                <strong>Payment Method:</strong>{" "}
                {paymentMethod === "cash" ? "Cash on Delivery" : "Stripe"}
              </div>
              <div>
                <strong>Shipping Address:</strong>
                <p>{form.getValues("addressLine1")}</p>
                <p>{form.getValues("zipCode")}</p>
                <p>{form.getValues("country")}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {step !== "payment" && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setStep(step === "address" ? "payment" : "address")
                }
              >
                Back
              </Button>
            )}
            <Button type="submit">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : step === "confirmation" ? (
                "Place Order"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ScrollArea>
  );
};
