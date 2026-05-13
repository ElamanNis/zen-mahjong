import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { theme, email } = ((await request.json().catch(() => ({}))) ?? {}) as {
      theme?: string;
      email?: string;
    };

    const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    const appUrl = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    if (!stripeSecretKey || !priceId || !priceId.startsWith('price_')) {
      return NextResponse.json({
        url: paymentLink ?? `${appUrl}#upgrade`,
        demo: true,
      });
    }

    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: typeof email === 'string' ? email : undefined,
      success_url: `${appUrl}?checkout=success`,
      cancel_url: `${appUrl}?checkout=cancelled`,
      metadata: {
        product: 'Zen Mahjong Pro',
        requested_theme: theme ?? 'pro-pack',
      },
    });

    return NextResponse.json({
      url: session.url,
      demo: false,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        url:
          process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ??
          `${request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''}#upgrade`,
        demo: true,
      },
      { status: 200 },
    );
  }
}
