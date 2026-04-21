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
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: `Extract property information from this MLS listing PDF. Return ONLY a valid JSON object with exactly these fields:
{
  "address": "full street address only (no city/state)",
  "city": "city name",
  "state": "2-letter state code like FL",
  "zip": "zip code as string",
  "property_type": "Multifamily",
  "num_units": integer number of units,
  "beds_per_unit": integer bedrooms per unit,
  "baths_per_unit": decimal bathrooms per unit,
  "year_built": integer year or null,
  "sqft": integer total sqft or null,
  "purchase_price": listing price as number,
  "description": "brief property description max 150 chars",
  "image_url": null,
  "ylopo_link": null,
  "video_url": null
}
Return ONLY the JSON object. No explanation, no markdown, no code blocks.`,
          },
        ],
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim()
    const data = JSON.parse(cleaned)

    return NextResponse.json({ success: true, data, filename: file.name })
  } catch (err) {
    console.error('PDF import error:', err)
    return NextResponse.json({ error: 'Error procesando el PDF', filename: file.name }, { status: 500 })
  }
}
