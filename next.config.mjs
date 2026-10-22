/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Old page addresses keep working.
  async redirects() {
    return [
      { source: "/admin", destination: "/dashboard", permanent: true },
      { source: "/register", destination: "/signup", permanent: true },
    ];
  },
};

export default nextConfig;
