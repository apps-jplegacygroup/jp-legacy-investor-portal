import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Property } from '@/lib/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [property] = await query<Property>(
      'SELECT * FROM properties WHERE id = $1 AND is_active = true',
      [id]
    )
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(property)
  } catch (error) {
    console.error('GET /api/properties/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const [property] = await query<Property>(
      `UPDATE properties SET
        address=$1, city=$2, state=$3, zip=$4, property_type=$5,
        num_units=$6, beds_per_unit=$7, baths_per_unit=$8,
        year_built=$9, sqft=$10, image_url=$11, image_urls=$12,
        ylopo_link=$13, video_url=$14, description=$15,
        purchase_price=$16, equity_percent=$17, annual_interest_rate=$18,
        loan_term_years=$19, monthly_rent_year1=$20, rent_increase_percent=$21,
        vacancy_rate=$22, insurance=$23, maintenance_percent=$24,
        property_mgmt_percent=$25, utilities_percent=$26, broker_fees=$27,
        hoa=$28, property_tax=$29, tax_rate=$30, depreciation_years=$31,
        points_percent=$32, other_equity_spent=$33, total_equity_invested=$34,
        monthly_rent_improved=$35, renovation_cost=$36, renovation_notes=$37
      WHERE id=$38 RETURNING *`,
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
        id,
      ]
    )
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(property)
  } catch (error) {
    console.error('PUT /api/properties/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const { status } = await req.json()
    if (status !== 'available' && status !== 'sold') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const [property] = await query<Property>(
      'UPDATE properties SET status=$1 WHERE id=$2 RETURNING *',
      [status, id]
    )
    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(property)
  } catch (error) {
    console.error('PATCH /api/properties/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await query('UPDATE properties SET is_active = false WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/properties/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}
