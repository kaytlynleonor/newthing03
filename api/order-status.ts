import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BrevoClient } from '@getbrevo/brevo';

const FROM_EMAIL = process.env.FROM_EMAIL || 'kaytlynleonor@gmail.com';
const FROM_NAME  = process.env.FROM_NAME  || 'Kaytlyn Leonor';

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

const statusHtml = (o: any) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F5F1EB;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#F5F1EB;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #EEE8DF;max-width:600px;">
  <tr><td style="background:#11100E;padding:32px;text-align:center;">
    <h1 style="color:#F5F1EB;font-family:serif;font-size:22px;letter-spacing:0.3em;margin:0;">KAYTLYN LEONOR</h1>
    <p style="color:#A99684;font-size:10px;letter-spacing:0.3em;margin:8px 0 0;">ORDER UPDATE</p>
  </td></tr>
  <tr><td style="padding:36px 40px;">
    <p style="font-family:serif;font-size:20px;color:#11100E;margin:0 0 8px;">Your order has been updated.</p>
    <p style="font-size:13px;color:#A99684;margin:0 0 24px;">Order <strong>${o.id}</strong> is now:</p>
    <div style="background:#F5F1EB;padding:20px;text-align:center;margin-bottom:24px;">
      <span style="font-family:serif;font-size:28px;color:#11100E;letter-spacing:0.2em;">${(o.status || '').toUpperCase()}</span>
    </div>
    ${o.status === 'Shipped' ? `<p style="font-size:13px;color:#11100E;">Your tracking number is: <strong>${o.trackingNumber}</strong></p>` : ''}
    ${o.status === 'Delivered' ? `<p style="font-size:13px;color:#11100E;">Your order has been delivered. Thank you for shopping with Kaytlyn Leonor!</p>` : ''}
  </td></tr>
  <tr><td style="background:#F5F1EB;padding:24px;text-align:center;border-top:1px solid #EEE8DF;">
    <p style="font-size:11px;color:#A99684;letter-spacing:0.2em;margin:0;">© 2026 KAYTLYN LEONOR</p>
  </td></tr>
</table></td></tr></table></body></html>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order, newStatus } = req.body;
  if (!order || !newStatus) return res.status(400).json({ error: 'Missing order or newStatus.' });

  if (!order.customerEmail) return res.status(200).json({ success: true, note: 'No customer email.' });

  try {
    await sendEmail(
      order.customerEmail,
      order.shippingAddress?.fullName || 'Client',
      `Order ${newStatus} — ${order.id} | Kaytlyn Leonor`,
      statusHtml({ ...order, status: newStatus })
    );
    return res.status(200).json({ success: true });
  } catch (e: any) {
    console.error('Status email failed:', e);
    return res.status(500).json({ error: e.message });
  }
}
