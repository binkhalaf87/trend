import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe/client";
import { getPriceId, type PlanId } from "@/lib/stripe/plans";
import { z } from "zod";

const Schema = z.object({
  plan: z.enum(["STARTER", "GROWTH", "ENTERPRISE"]),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = Schema.parse(await req.json());

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const priceId = getPriceId(plan as PlanId);
    if (!priceId) {
      return NextResponse.json(
        { error: `STRIPE_PRICE_${plan} is not configured` },
        { status: 500 }
      );
    }

    const customerId = await getOrCreateStripeCustomer(dbUser.id, dbUser.email, dbUser.name);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: dbUser.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId: dbUser.id, plan },
      },
      success_url: `${appUrl}/billing?success=true`,
      cancel_url:  `${appUrl}/pricing?canceled=true`,
      metadata: { userId: dbUser.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/stripe/checkout]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
