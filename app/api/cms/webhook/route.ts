import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
    const authz = request.headers.get('authorization') || '';
    const expected = process.env.CONTENTFUL_WEBHOOK_SECRET?.trim();
    
    if (!expected || authz !== `Bearer ${expected}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const topic = request.headers.get('x-contentful-topic') ?? '';
    revalidateTag(`cms:${topic}`);

    return NextResponse.json({ ok: true, revalidated: [`cms:${topic}`] });
}
