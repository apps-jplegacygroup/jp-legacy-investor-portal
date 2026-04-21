import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  try {
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: `This PDF may contain one or multiple MLS property listings. Extract ALL properties found.

Return ONLY a valid JSON array (even if just one property). Each object must have exactly these fields:
[
  {
    "address": "full street address only (no city/state)",
    "city": "city name",
    "state": "2-letter state code like FL",
    "zip": "zip code as string",
    "property_type": "Multifamily",
    "num_units": integer number of units (default 1 if not found),
    "beds_per_unit": integer bedrooms per unit (default 2 if not found),
    "baths_per_unit": decimal bathrooms per unit (default 1 if not found),
    "year_built": integer year or null,
    "sqft": integer total sqft or null,
    "purchase_price": listing price as number (required),
    "description": "brief property description max 150 chars",
    "image_url": null,
    "ylopo_link": null,
    "video_url": null
  }
]

Rules:
- If the PDF has multiple listings, return one object per listing
- purchase_price is required — skip properties with no price
- Return ONLY the JSON array, no explanation, no markdown, no code blocks`,
          },
        ],
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned)
    const properties = Array.isArray(parsed) ? parsed : [parsed]

    return NextResponse.json({ success: true, properties, filename: file.name })
  } catch (err) {
    console.error('PDF import error:', err)
    return NextResponse.json({ error: 'Error procesando el PDF', filename: file.name }, { status: 500 })
  }
}
