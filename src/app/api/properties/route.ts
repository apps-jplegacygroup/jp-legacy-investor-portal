import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Property } from '@/lib/types'

export async function GET() {
  try {
    const properties = await query<Property>(
      'SELECT * FROM properties WHERE is_active = true ORDER BY status ASC, created_at DESC'
    )
    return NextResponse.json(properties)
  } catch (error) {
    console.error('GET /api/properties error:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const [property] = await query<Property>(
      `INSERT INTO properties (
        address, city, state, zip, property_type, num_units, beds_per_unit, baths_per_unit,
        year_built, sqft, image_url, image_urls, ylopo_link, video_url, description,
        purchase_price, equity_percent, annual_interest_rate, loan_term_years,
        monthly_rent_year1, rent_increase_percent, vacancy_rate,
        insurance, maintenance_percent, property_mgmt_percent, utilities_percent,
        broker_fees, hoa, property_tax, tax_rate, depreciation_years,
        points_percent, other_equity_spent, total_equity_invested,
        monthly_rent_improved, renovation_cost, renovation_notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,
        $35,$36,$37
      ) RETURNING *`,
      [
        body.address, body.city, body.state, body.zip, body.property_type,
        body.num_units, body.beds_per_unit, body.baths_per_unit,
        body.year_built || null, body.sqft || null, body.image_url || null,
        body.image_urls || null,
        body.ylopo_link || null, body.video_url || null, body.description || null,
        body.purchase_price, body.equity_percent, body.annual_interest_rate,
        body.loan_term_years, body.monthly_rent_year1, body.rent_increase_percent,
        body.vacancy_rate, body.insurance, body.maintenance_percent,
        body.property_mgmt_percent, body.utilities_percent, body.broker_fees,
        body.hoa, body.property_tax, body.tax_rate, body.depreciation_years,
        body.points_percent, body.other_equity_spent, body.total_equity_invested,
        body.monthly_rent_improved || null, body.renovation_cost || null, body.renovation_notes || null,
      ]
    )
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('POST /api/properties error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
