/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Next.js starts one build worker per CPU. Hostinger's build server reports ~58 CPUs,
    // and that many workers run out of memory (build "exited with signal: SIGABRT").
    cpus: 2,
  },
  // Old page addresses keep working.
  async redirects() {
    return [
      { source: "/admin", destination: "/dashboard", permanent: true },
      { source: "/register", destination: "/signup", permanent: true },
    ];
  },
};

export default nextConfig;
