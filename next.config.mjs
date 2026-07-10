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
      // video/film = dezelfde categorie als foto (bron: photo & film studios)
      {
        source: "/videostudio-huren",
        destination: "/fotostudio-huren",
        permanent: true,
      },
      {
        source: "/videostudio-huren-:stad",
        destination: "/fotostudio-huren-:stad",
        permanent: true,
      },
      {
        source: "/filmstudio-huren",
        destination: "/fotostudio-huren",
        permanent: true,
      },
      {
        source: "/filmstudio-huren-:stad",
        destination: "/fotostudio-huren-:stad",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
