import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export async function POST(req: NextRequest) {
  // Client upload: browser uploads directly to Vercel Blob (no body size limit)
  const adminKey = req.headers.get('x-admin-key') ||
    req.nextUrl.searchParams.get('adminKey')

  if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maximumSizeInBytes: 20 * 1024 * 1024, // 20MB per photo
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(jsonResponse)
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: String(err) }, { status: 400 })
  }
}
