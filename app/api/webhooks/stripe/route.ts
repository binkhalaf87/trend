import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Map Stripe price IDs → SubscriptionPlan
function priceToplan(priceId: string): SubscriptionPlan {
  const map: Record<string, SubscriptionPlan> = {
    [process.env.STRIPE_PRICE_STARTER ?? ""]:    "STARTER",
    [process.env.STRIPE_PRICE_GROWTH ?? ""]:     "GROWTH",
    [process.env.STRIPE_PRICE_ENTERPRISE ?? ""]: "ENTERPRISE",
  };
  return map[priceId] ?? "STARTER";
}

function stripeStatusToDb(status: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active:             "ACTIVE",
    trialing:           "TRIALING",
    past_due:           "PAST_DUE",
    canceled:           "CANCELED",
    paused:             "PAUSED",
    incomplete:         "PAST_DUE",
    incomplete_expired: "CANCELED",
    unpaid:             "PAST_DUE",
  };
  return map[status] ?? "ACTIVE";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── مستخدم جديد أتمّ checkout
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.customer || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price.id ?? "";

        await prisma.subscription.upsert({
          where: { stripeCustomerId: session.customer as string },
          update: {
            stripeSubscriptionId: sub.id,
            stripePriceId:        priceId,
            plan:                 priceToplan(priceId),
            status:               stripeStatusToDb(sub.status),
            currentPeriodStart:   new Date(sub.current_period_start * 1000),
            currentPeriodEnd:     new Date(sub.current_period_end   * 1000),
          },
          create: {
            userId:               session.client_reference_id ?? "",
            stripeCustomerId:     session.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId:        priceId,
            plan:                 priceToplan(priceId),
            status:               stripeStatusToDb(sub.status),
            currentPeriodStart:   new Date(sub.current_period_start * 1000),
            currentPeriodEnd:     new Date(sub.current_period_end   * 1000),
          },
        });
        break;
      }

      // ── تحديث اشتراك قائم
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id ?? "";

        await prisma.subscription.update({
          where:  { stripeSubscriptionId: sub.id },
          data: {
            stripePriceId:      priceId,
            plan:               priceToplan(priceId),
            status:             stripeStatusToDb(sub.status),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd:   new Date(sub.current_period_end   * 1000),
            cancelAtPeriodEnd:  sub.cancel_at_period_end,
          },
        });
        break;
      }

      // ── إلغاء اشتراك
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data:  { status: "CANCELED" },
        });
        break;
      }

      // ── فشل في الدفع
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data:  { status: "PAST_DUE" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook]", event.type, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
