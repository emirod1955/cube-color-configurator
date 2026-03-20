import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { PRICES, formatPrice } from "../../../src/lib/pricing";

const SIZE_LABEL: Record<string, string> = { "0.8": "S", "1": "M", "1.2": "L" };

interface PersonMeta {
  gender: "man" | "woman";
  size: number;
}

export async function POST(req: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return NextResponse.json({ ok: true });

  const body = await req.json();

  // MercadoPago envía diferentes tipos de notificaciones
  if (body.type !== "payment") {
    return NextResponse.json({ ok: true });
  }

  const paymentId = body.data?.id;
  if (!paymentId) return NextResponse.json({ ok: true });

  const client = new MercadoPagoConfig({ accessToken });
  const paymentApi = new Payment(client);
  const payment = await paymentApi.get({ id: paymentId });

  if (payment.status !== "approved") {
    return NextResponse.json({ ok: true });
  }

  // MercadoPago convierte las keys del metadata a snake_case
  const meta = payment.metadata as {
    persons: PersonMeta[];
    wood_text: string;
    customer_email: string;
    customer_name: string;
  };

  const persons: PersonMeta[] = meta.persons ?? [];
  const woodText: string = meta.wood_text ?? "";
  const customerEmail: string = meta.customer_email ?? "";
  const customerName: string = meta.customer_name ?? "";
  const total = PRICES.base + persons.length * PRICES.perPerson;

  const personsHtml = persons
    .map(
      (p, i) =>
        `<tr>
          <td style="padding:6px 0; color:#6E6A63;">Figura ${i + 1}</td>
          <td style="padding:6px 0;">${p.gender === "man" ? "Hombre" : "Mujer"} — Talla ${SIZE_LABEL[String(p.size)] ?? p.size}</td>
          <td style="padding:6px 0; text-align:right;">${formatPrice(PRICES.perPerson)}</td>
        </tr>`
    )
    .join("");

  const summaryTable = `
    <table style="width:100%; border-collapse:collapse; font-family:sans-serif; font-size:14px;">
      <tr>
        <td style="padding:6px 0; color:#6E6A63;">Base + letras</td>
        <td style="padding:6px 0;">"${woodText || "—"}"</td>
        <td style="padding:6px 0; text-align:right;">${formatPrice(PRICES.base)}</td>
      </tr>
      ${personsHtml}
      <tr style="border-top:1px solid #E8E5DF;">
        <td colspan="2" style="padding:10px 0 0; font-weight:600;">Total</td>
        <td style="padding:10px 0 0; text-align:right; font-weight:600;">${formatPrice(total)}</td>
      </tr>
    </table>
  `;

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return NextResponse.json({ ok: true });

  const resend = new Resend(resendApiKey);
  const from = process.env.RESEND_FROM || "onboarding@resend.dev";
  const ownerEmail = process.env.OWNER_EMAIL || "emirod1955@gmail.com";

  await Promise.all([
    // Email al dueño
    resend.emails.send({
      from,
      to: ownerEmail,
      subject: `Nuevo pedido SantaJusta — ${customerName || customerEmail} · ${formatPrice(total)}`,
      html: `
        <div style="font-family:sans-serif; max-width:520px;">
          <h2 style="font-size:20px; margin-bottom:4px;">Nuevo pedido recibido</h2>
          <p style="color:#6E6A63; margin-top:0;">ID de pago: ${paymentId}</p>
          <hr style="border:none; border-top:1px solid #E8E5DF; margin:16px 0;">
          <p><strong>Cliente:</strong> ${customerName || "—"}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <hr style="border:none; border-top:1px solid #E8E5DF; margin:16px 0;">
          ${summaryTable}
        </div>
      `,
    }),
    // Email al cliente
    resend.emails.send({
      from,
      to: customerEmail,
      subject: "¡Tu pedido en SantaJusta está confirmado!",
      html: `
        <div style="font-family:sans-serif; max-width:520px;">
          <h2 style="font-size:20px;">¡Gracias, ${customerName || ""}!</h2>
          <p style="color:#6E6A63;">Recibimos tu pedido. Nos pondremos en contacto a la brevedad para coordinar la entrega.</p>
          <hr style="border:none; border-top:1px solid #E8E5DF; margin:16px 0;">
          ${summaryTable}
          <hr style="border:none; border-top:1px solid #E8E5DF; margin:16px 0;">
          <p style="font-size:13px; color:#6E6A63;">
            Ante cualquier consulta escribinos por
            <a href="https://wa.me/59894394242" style="color:#0D0D0D;">WhatsApp al 094 394 242</a>
          </p>
          <p style="font-size:13px; color:#AEAAA3;">SantaJusta Lovemade · Hecho con amor en Uruguay</p>
        </div>
      `,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
