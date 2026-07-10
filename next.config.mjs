/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // oud Vercel-domein → hoofddomein (301, behoudt SEO-waarde)
      {
        source: "/:path*",
        has: [{ type: "host", value: "kader-rho.vercel.app" }],
        destination: "https://www.kaderstudios.nl/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
