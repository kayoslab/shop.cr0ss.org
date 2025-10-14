import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
    const authz = request.headers.get('authorization') || '';
    const expected = process.env.CONTENTFUL_WEBHOOK_SECRET?.trim();
    
    if (!expected || authz !== `Bearer ${expected}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the body to ensure the request is fully read
    const body = await request.json();
    // Get content type from the webhook payload
    const contentType = body.sys?.contentType?.sys?.id || 'unknown';
    // Revalidate the relevant tag
    revalidateTag(`cms:${contentType}`);

    return NextResponse.json({ ok: true, revalidated: [`cms:${contentType}`] });
}
