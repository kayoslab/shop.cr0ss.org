import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/card"
import { type ProductDTO } from '@/lib/ct/dto/product';
import { formatPrice } from '@/lib/utils/formatPrice';

interface ProductCardProps {
  product: ProductDTO
  compact?: boolean
  locale: string
}

function getPrimaryImage(p: ProductDTO): { url: string; alt: string } | null {
  // Oversimplified by picking the first image of the first variant as the primary image.
  const v = p.variants?.[0];
  const img = v?.images?.[0];
  if (!img?.url) return null;
  const url = img.url.startsWith('//') ? `https:${img.url}` : img.url;
  return { url, alt: p.name };
}

export function ProductCard({ product, compact = false, locale }: ProductCardProps) {
  const img = getPrimaryImage(product);
  return (
    <Link href={`/${locale}/products/${product.id}`} className="group">
      <Card className="overflow-hidden rounded-2xl border-border hover:shadow-lg transition-shadow h-full">
        <div className={`relative overflow-hidden ${compact ? "h-48" : "h-64"}`}>
            {img && (
                <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 50vw, 240px"
                    priority={false}
                />
            )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className={`font-semibold ${compact ? "text-sm" : "text-base"} line-clamp-2`}>{product.name}</h3>
          <div className="flex items-center gap-2">
            {formatPrice(product.variants?.[0]?.price)}
          </div>
        </div>
      </Card>
    </Link>
  )
}
