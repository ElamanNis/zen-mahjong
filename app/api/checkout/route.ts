import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

let stripeClient: Stripe | null = null;

function getStripe() {
  if (!stripeClient) {
    if (!stripeSecret) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    stripeClient = new Stripe(stripeSecret);
  }
  return stripeClient;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl =
      req.headers.get('origin') ||
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    if (!proPriceId || !proPriceId.startsWith('price_')) {
      return NextResponse.json({
        url: paymentLink ?? `${appUrl}#upgrade`,
        demo: true,
      });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/?status=success`,
      cancel_url: `${appUrl}/?status=cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: session.url, demo: false });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      {
        url:
          paymentLink ??
          `${req.headers.get('origin') || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}#upgrade`,
        demo: true,
      },
      { status: 200 },
    );
  }
}
