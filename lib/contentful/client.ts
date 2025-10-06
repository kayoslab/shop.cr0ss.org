import { createClient } from 'contentful';

const space = process.env.CONTENTFUL_SPACE_ID!;
const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';
const usePreview =
  String(process.env.CONTENTFUL_PREVIEW_ENABLED || 'false') === 'true';

const CDA_TOKEN = process.env.CONTENTFUL_CDA_TOKEN!;
const CPA_TOKEN = process.env.CONTENTFUL_CPA_TOKEN || '';

/**
 * Named export expected by your imports:
 *   import { contentfulClient } from '@/lib/contentful/client'
 */
export function contentfulClient(preview = usePreview) {
  return createClient({
    space,
    environment,
    accessToken: preview ? (CPA_TOKEN || CDA_TOKEN) : CDA_TOKEN,
    host: preview ? 'preview.contentful.com' : 'cdn.contentful.com',
  });
}

export type CfSys = { id: string };
export type CfEntry<TFields = unknown> = { sys: CfSys; fields: TFields };
