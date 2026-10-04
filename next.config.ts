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
    ]
  },
}

export default nextConfig
