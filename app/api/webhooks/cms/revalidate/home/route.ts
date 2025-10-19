import { NextResponse, type NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import { ErrorResponses } from '@/lib/utils/apiErrors';
import { cmsTags, categoryTags, productTags } from '@/lib/cache/tags';

export async function POST(request: NextRequest) {
    const authz = request.headers.get('authorization') || '';
    const expected = process.env.CONTENTFUL_WEBHOOK_SECRET?.trim();

    if (!expected || authz !== `Bearer ${expected}`) {
        return ErrorResponses.unauthorized();
    }

    // Get the body to ensure the request is fully read
    const body = await request.json();
    // Revalidate the relevant tag
    const revalidatedTags = new Set<string>();
    for (const locale of SUPPORTED_LOCALES) {
        const categories = body.fields?.featuredCategorySlugs?.[locale] || null;
        if (categories && Array.isArray(categories)) {
            for (const catSlug of categories) {
                const tag = categoryTags.plp(catSlug, locale);
                revalidateTag(tag);
                revalidatedTags.add(tag);
            }
        }

        const homeTag = cmsTags.home(locale);
        const productsTag = productTags.all(locale);
        revalidateTag(homeTag);
        revalidateTag(productsTag);
        revalidatedTags.add(homeTag);
        revalidatedTags.add(productsTag);
    }

    return NextResponse.json({ ok: true, revalidated: Array.from(revalidatedTags) });
}
