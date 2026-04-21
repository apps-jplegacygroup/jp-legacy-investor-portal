import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true })
    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
