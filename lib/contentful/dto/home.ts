export interface HomeDTO {
  hero: {
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    imageUrl?: string;
  };
  featuredCategorySlugs: string[];
  recommendedHeading: string;
  showcaseHeading: string;
}
