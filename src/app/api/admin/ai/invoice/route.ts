import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { clientName, clientEmail, clientAddress, projectTitle, projectDescription, items, dueDate, notes } = await req.json();

  if (!clientName?.trim() || !items?.length) {
    return NextResponse.json({ error: "Client name and items are required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  const itemsText = items.map((item: { description: string; quantity: string; price: string }, i: number) =>
    `${i + 1}. ${item.description} — Qty: ${item.quantity} × $${item.price}`
  ).join("\n");

  const subtotal = items.reduce((sum: number, item: { price: string; quantity: string }) =>
    sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0
  );

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `Generate a professional invoice in the style of a creative portfolio. Generate EXACTLY this format, no extra text:

INVOICE
[Invoice Number: INV-{YYYYMMDD}-{###}]
[Date: {Today's date}]
[Due Date: ${dueDate || 'Net 30'}]

FROM:
Rizky Irawan
rizkyirawan0404@gmail.com

BILL TO:
${clientName}
${clientEmail || ''}
${clientAddress || ''}

PROJECT: ${projectTitle || 'Creative Services'}

ITEMS:
${itemsText}

SUBTOTAL: $${subtotal.toFixed(2)}
TAX (0%): $0.00
TOTAL: $${subtotal.toFixed(2)}

${notes ? `NOTES:\n${notes}` : ''}

Payment Terms: ${dueDate ? `Due upon receipt` : 'Net 30 days'}
${projectDescription ? `\nProject Description: ${projectDescription}` : ''}

---
Rizky Irawan — Visual Artist & Designer
rizkyirawan0404@gmail.com | https://rizkyirawan.my.id`,
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai invoice] Groq API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const invoice = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ invoice, subtotal, total: subtotal });
  } catch (err) {
    console.error("[ai invoice] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
