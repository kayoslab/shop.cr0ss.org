export type AttributeValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, unknown>
  | null;

export interface ProductVariantDTO {
  id: number;
  sku?: string;
  images: { url: string; alt?: string }[];
  price?: {
    currencyCode: string;
    centAmount: number;
    discounted?: boolean;
    discountedCentAmount?: number;
  };
  attributes: Record<string, AttributeValue>;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  descriptionHtml?: string;
  specifications: Array<{ name: string; value: string }>;
  variants: ProductVariantDTO[];
  masterVariantId: number;
}

export type ProductProjectionVariantDTO = {
  id: number;
  sku?: string;
  images: { url: string; alt?: string }[];
  price?: {
    currencyCode: string;
    centAmount: number;
    discounted?: boolean;
    discountedCentAmount?: number;
  };
  attributes: Record<string, AttributeValue>;
};

export type ProductProjectionDTO = {
  id: string;
  key?: string;
  version?: number;
  name: string;
  slug: string;
  descriptionHtml?: string;
  specifications: Array<{ name: string; value: string }>;
  variants: ProductProjectionVariantDTO[];
  masterVariantId: number;
};
