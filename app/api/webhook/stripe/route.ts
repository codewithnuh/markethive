import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { handleCheckoutSuccess } from "@/lib/actions/stripe/actions";
import Stripe from "stripe";

export async function POST(req: Request) {
  // You can find your endpoint's secret in your webhook settings
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  // Get the signature sent by Stripe
  const headerPayload = headers();
  const signature = (await headerPayload).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      endpointSecret
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
    }
    return new NextResponse("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await handleCheckoutSuccess(session.id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error handling checkout success:", error.message);
      }
      return new NextResponse("Checkout failed", { status: 500 });
    }
  }

  return new NextResponse("OK", { status: 200 });
}
