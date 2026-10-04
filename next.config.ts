import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/guides/how-ayushpicks-evaluates-products',
        destination: '/guides/how-ksnatic-evaluates-products',
        permanent: true,
      },
      {
        source: '/products/span-idproducttitle-classa-size-large-product-title-word-break-cetaphil-oily-skin-cleanser-daily-face-wash-for-oily-acne-prone-skin-gentle-foaming-118ml-span-199140',
        destination: '/products/cetaphil-oily-skin-cleanser-daily-face-wash-118ml-199140',
        permanent: true,
      },
      {
        source: '/products/cerave-hydrating-cleanser-for-normal-to-dry-skin-236ml-non-foaming-face-wash-with-hyaluronic-acid-and-ceramides-non-comedogenic-non-irritating-and-fragrance-free-cleanser-938164',
        destination: '/products/cerave-hydrating-cleanser-236ml-938164',
        permanent: true,
      },
      {
        source: '/products/dot-key-vitamin-c-e-super-bright-sunscreen-in-vivo-tested-spf-50-pa-with-new-age-uv-filters-water-light-fluid-boosts-glow-reduces-dullness-dark-spots-checks-tanning-no-white-cast-50g-236459',
        destination: '/products/dot-key-vitamin-c-e-sunscreen-spf-50-pa-236459',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
