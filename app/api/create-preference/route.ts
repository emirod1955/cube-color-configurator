import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { PRICES } from "../../../src/lib/pricing";

const SIZE_LABEL: Record<string, string> = { "0.8": "S", "1": "M", "1.2": "L" };

interface PersonPayload {
  gender: "man" | "woman";
  size: number;
  color: string;
  position: [number, number, number];
  name: string;
}

export async function POST(req: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "MP_ACCESS_TOKEN no configurado" }, { status: 500 });
  }

  const client = new MercadoPagoConfig({ accessToken });
  const { persons, woodText, customerEmail, customerName } = await req.json() as {
    persons: PersonPayload[];
    woodText: string;
    customerEmail: string;
    customerName: string;
  };

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const items = [
    {
      id: "base",
      title: `Base de madera${woodText ? ` · "${woodText}"` : ""}`,
      quantity: 1,
      unit_price: PRICES.base,
      currency_id: "UYU",
    },
    ...persons.map((p, i) => ({
      id: `persona-${i}`,
      title: `Figura ${p.gender === "man" ? "hombre" : "mujer"} — Talla ${SIZE_LABEL[String(p.size)] ?? p.size}`,
      quantity: 1,
      unit_price: PRICES.perPerson,
      currency_id: "UYU",
    })),
  ];

  const preference = new Preference(client);
  const response = await preference.create({
    body: {
      items,
      payer: { email: customerEmail, name: customerName },
      back_urls: {
        success: `${baseUrl}/pago/exitoso`,
        pending: `${baseUrl}/pago/pendiente`,
        failure: `${baseUrl}/pago/error`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhook`,
      metadata: { persons, woodText, customerEmail, customerName },
    },
  });

  return NextResponse.json({ checkoutUrl: response.init_point });
}
