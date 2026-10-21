import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[500px] px-6 py-24 text-center">
      <p className="text-6xl">🤷</p>
      <h1 className="section-title mt-4">Page not found</h1>
      <p className="mt-2 text-grey-500">The page or product you are looking for does not exist.</p>
      <Link href="/products" className="btn btn-primary mt-8">
        Back to Shop
      </Link>
    </div>
  );
}
