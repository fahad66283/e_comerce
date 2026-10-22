import { unstable_rethrow } from "next/navigation";
import { describeDatabaseError } from "@/lib/server/db";
import { loadStoreData } from "@/lib/server/storeData";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Providers from "./Providers";
import WhatsAppButton from "./WhatsAppButton";

// Loads the store from MySQL and wraps every page with the header, footer and data providers.
export default async function StoreShell({ children }) {
  let data;
  try {
    data = await loadStoreData();
  } catch (err) {
    unstable_rethrow(err);
    console.error("[database]", err.code ?? "", err.message);
    return <DatabaseProblem message={describeDatabaseError(err)} />;
  }
  return (
    <Providers data={data}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </Providers>
  );
}

// Shown for a split second while the store data loads.
export function StoreLoading() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true">
      <div className="h-9 bg-ink" />
      <div className="border-b border-grey-200 bg-white">
        <div className="container-page flex items-center justify-between py-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- static logo */}
          <img src="/logo.svg" alt="" className="h-[30px] w-auto opacity-60" />
          <span className="h-9 w-40 animate-pulse rounded-full bg-grey-100" />
        </div>
      </div>
      <div className="container-page flex flex-1 items-center justify-center py-24">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-grey-200 border-t-brand-500" role="status" aria-label="Loading" />
      </div>
    </div>
  );
}

// Shown instead of the store when the database can't be reached (e.g. .env not filled in yet).
function DatabaseProblem({ message }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-grey-50 px-6 py-16">
      <div className="panel max-w-lg text-center">
        <p className="text-5xl">🛠️</p>
        <h1 className="section-title mt-4">The store is being set up</h1>
        <p className="mt-2 text-grey-500">We&apos;ll be back shortly. Please try again in a few minutes.</p>
        <div className="mt-6 rounded-field bg-amber-50 p-4 text-left text-sm text-amber-900">
          <p className="font-extrabold">For the site owner</p>
          <p className="mt-1">{message}</p>
          <p className="mt-2">
            Check the database settings (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD) in your <code>.env</code> file or in
            Hostinger&apos;s environment variables, then restart the app. Details are in the server log.
          </p>
        </div>
      </div>
    </main>
  );
}
