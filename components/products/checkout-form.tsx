"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
import { createCheckoutSession } from "@/lib/actions/stripe/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  addressLine1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
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
      fullName: "",
      addressLine1: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      paymentMethod: "cash",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    console.log("Form Submitted", data);

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
            router.push(result.url as string);
          } else {
            throw new Error(result.error || "Checkout failed");
          }
        } else {
          toast({
            title: "Order Placed",
            description:
              "Your order has been placed successfully for cash on delivery.",
          });
          onClose();
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Checkout Error",
          description:
            error instanceof Error ? error.message : "Checkout failed",
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="NY" {...field} />
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
                <p>{form.getValues("fullName")}</p>
                <p>{form.getValues("addressLine1")}</p>
                <p>
                  {form.getValues("city")}, {form.getValues("state")}{" "}
                  {form.getValues("zipCode")}
                </p>
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
