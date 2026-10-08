import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BrevoClient } from '@getbrevo/brevo';

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'kaytlynleonor@gmail.com';
const FROM_EMAIL  = process.env.FROM_EMAIL  || 'kaytlynleonor@gmail.com';
const FROM_NAME   = process.env.FROM_NAME   || 'Kaytlyn Leonor';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const sendEmail = async (to: string, toName: string, subject: string, html: string) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('Brevo API key not configured.');
  const client = new BrevoClient({ apiKey });
  await client.transactionalEmails.sendTransacEmail({
    sender: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to, name: toName }],
    subject,
    htmlContent: html,
  });
};

const itemsHtml = (items: any[]) =>
  (items || []).map((i: any) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:14px;">${i.productName}</td>
      <td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;color:#A99684;">${i.variantName} · ${i.size}</td>
      <td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;text-align:center;">${i.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;text-align:right;">${fmt(i.price * i.quantity)}</td>
    </tr>`).join('');

const confirmationHtml = (o: any) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F5F1EB;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#F5F1EB;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #EEE8DF;max-width:600px;">
  <tr><td style="background:#11100E;padding:32px;text-align:center;">
    <h1 style="color:#F5F1EB;font-family:serif;font-size:22px;letter-spacing:0.3em;margin:0;">KAYTLYN LEONOR</h1>
    <p style="color:#A99684;font-size:10px;letter-spacing:0.3em;margin:8px 0 0;">ORDER CONFIRMATION</p>
  </td></tr>
  <tr><td style="padding:36px 40px;">
    <p style="font-family:serif;font-size:20px;color:#11100E;margin:0 0 8px;">Thank you, ${o.shippingAddress?.fullName || 'Valued Client'}.</p>
    <p style="font-size:13px;color:#A99684;margin:0 0 28px;">Your order has been received and is being processed with care.</p>
    <table width="100%" style="background:#F5F1EB;padding:16px;margin-bottom:24px;border-collapse:collapse;">
      <tr>
        <td style="font-size:11px;color:#A99684;letter-spacing:0.2em;text-transform:uppercase;padding:4px 8px;">Order ID</td>
        <td style="font-size:11px;color:#A99684;letter-spacing:0.2em;text-transform:uppercase;padding:4px 8px;">Date</td>
        <td style="font-size:11px;color:#A99684;letter-spacing:0.2em;text-transform:uppercase;padding:4px 8px;">Tracking</td>
        <td style="font-size:11px;color:#A99684;letter-spacing:0.2em;text-transform:uppercase;padding:4px 8px;">Total</td>
      </tr>
      <tr>
        <td style="font-family:serif;font-size:14px;padding:6px 8px;">${o.id}</td>
        <td style="font-family:serif;font-size:14px;padding:6px 8px;">${o.date}</td>
        <td style="font-family:serif;font-size:14px;padding:6px 8px;">${o.trackingNumber}</td>
        <td style="font-family:serif;font-size:16px;font-weight:bold;padding:6px 8px;">${fmt(o.totalAmount)}</td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr style="background:#F5F1EB;">
        <th style="padding:8px 10px;font-size:10px;text-align:left;letter-spacing:0.2em;color:#A99684;">PRODUCT</th>
        <th style="padding:8px 10px;font-size:10px;text-align:left;letter-spacing:0.2em;color:#A99684;">VARIANT</th>
        <th style="padding:8px 10px;font-size:10px;text-align:center;letter-spacing:0.2em;color:#A99684;">QTY</th>
        <th style="padding:8px 10px;font-size:10px;text-align:right;letter-spacing:0.2em;color:#A99684;">PRICE</th>
      </tr>
      ${itemsHtml(o.items)}
    </table>
    <table width="100%"><tr>
      <td width="50%" style="vertical-align:top;padding-right:16px;">
        <h4 style="font-size:11px;letter-spacing:0.2em;color:#A99684;text-transform:uppercase;margin:0 0 8px;">SHIPPING ADDRESS</h4>
        <p style="font-size:13px;line-height:1.7;margin:0;color:#11100E;">
          ${o.shippingAddress?.fullName}<br/>
          ${o.shippingAddress?.addressLine}<br/>
          ${o.shippingAddress?.city}, ${o.shippingAddress?.postalCode}<br/>
          ${o.shippingAddress?.country}
        </p>
      </td>
      <td width="50%" style="vertical-align:top;">
        <h4 style="font-size:11px;letter-spacing:0.2em;color:#A99684;text-transform:uppercase;margin:0 0 8px;">PAYMENT</h4>
        <p style="font-size:13px;color:#11100E;margin:0;">${o.paymentMethod}</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#F5F1EB;padding:24px;text-align:center;border-top:1px solid #EEE8DF;">
    <p style="font-size:11px;color:#A99684;letter-spacing:0.2em;margin:0;">© 2026 KAYTLYN LEONOR · All rights reserved</p>
    <p style="font-size:11px;color:#A99684;margin:6px 0 0;">Questions? Contact ${OWNER_EMAIL}</p>
  </td></tr>
</table></td></tr></table></body></html>`;

const ownerAlertHtml = (o: any) => `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;background:#F5F1EB;">
<h2 style="font-family:serif;color:#11100E;">🛍 New Order — ${o.id}</h2>
<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #EEE8DF;">
  <tr style="background:#11100E;color:#F5F1EB;">
    <th style="padding:10px;text-align:left;font-size:12px;">Field</th>
    <th style="padding:10px;text-align:left;font-size:12px;">Details</th>
  </tr>
  <tr><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-weight:bold;font-size:13px;">Order ID</td><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;">${o.id}</td></tr>
  <tr><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-weight:bold;font-size:13px;">Customer</td><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;">${o.shippingAddress?.fullName}</td></tr>
  <tr><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-weight:bold;font-size:13px;">Email</td><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;">${o.customerEmail}</td></tr>
  <tr><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-weight:bold;font-size:13px;">Phone</td><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;">${o.customerPhone}</td></tr>
  <tr><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-weight:bold;font-size:13px;">Total</td><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;font-weight:bold;">${fmt(o.totalAmount)}</td></tr>
  <tr><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-weight:bold;font-size:13px;">Payment</td><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;">${o.paymentMethod}</td></tr>
  <tr><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-weight:bold;font-size:13px;">Tracking</td><td style="padding:10px;border-bottom:1px solid #EEE8DF;font-size:13px;">${o.trackingNumber}</td></tr>
  <tr><td style="padding:10px;font-weight:bold;font-size:13px;">Address</td><td style="padding:10px;font-size:13px;">${o.shippingAddress?.addressLine}, ${o.shippingAddress?.city}, ${o.shippingAddress?.postalCode}, ${o.shippingAddress?.country}</td></tr>
</table>
<h3 style="font-family:serif;margin-top:24px;">Items Ordered:</h3>
<table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #EEE8DF;">${itemsHtml(o.items)}</table>
<p style="margin-top:16px;font-size:12px;color:#A99684;">Update order status in Firebase Console → Firestore → orders collection.</p>
</body></html>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const order = req.body;
  if (!order || !order.id) return res.status(400).json({ error: 'Invalid order data.' });

  const errors: string[] = [];

  // Email customer
  if (order.customerEmail) {
    try {
      await sendEmail(
        order.customerEmail,
        order.shippingAddress?.fullName || 'Client',
        `Order Confirmed — ${order.id} | Kaytlyn Leonor`,
        confirmationHtml(order)
      );
    } catch (e: any) {
      console.error('Customer email failed:', e);
      errors.push('customer_email_failed');
    }
  }

  // Email owner
  try {
    await sendEmail(
      OWNER_EMAIL,
      'Kaytlyn Leonor',
      `🛍 New Order — ${order.id} · ${fmt(order.totalAmount)}`,
      ownerAlertHtml(order)
    );
  } catch (e: any) {
    console.error('Owner email failed:', e);
    errors.push('owner_email_failed');
  }

  return res.status(200).json({ success: true, errors });
}
