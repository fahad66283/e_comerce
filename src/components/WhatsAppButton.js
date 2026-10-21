"use client";

import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { whatsappLink } from "@/data/siteContent";

// Floating "chat on WhatsApp" button on every customer-facing page (not the admin dashboard).
export default function WhatsAppButton() {
  const pathname = usePathname();
  const { whatsapp, whatsappMessage } = useSettings().settings.contact;
  if (!whatsapp || pathname.startsWith("/dashboard")) return null;

  return (
    <a
      href={whatsappLink(whatsapp, whatsappMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-lift transition hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C8.837 3 3.005 8.83 3.003 15.997a12.94 12.94 0 0 0 1.737 6.5L3 29l6.65-1.744a12.98 12.98 0 0 0 6.35 1.62h.005c7.166 0 12.998-5.832 13-12.999a12.92 12.92 0 0 0-3.806-9.197A12.91 12.91 0 0 0 16.004 3Zm0 23.68h-.004a10.78 10.78 0 0 1-5.493-1.504l-.394-.234-3.947 1.035 1.054-3.848-.257-.395a10.75 10.75 0 0 1-1.65-5.738c.002-5.954 4.847-10.798 10.806-10.798a10.73 10.73 0 0 1 7.636 3.168 10.73 10.73 0 0 1 3.16 7.638c-.003 5.955-4.848 10.676-10.91 10.676Zm5.924-8.085c-.325-.163-1.922-.948-2.22-1.057-.297-.108-.514-.162-.73.163-.217.325-.838 1.056-1.028 1.273-.19.217-.379.244-.704.081-.325-.162-1.372-.506-2.613-1.613-.966-.861-1.618-1.925-1.808-2.25-.19-.325-.02-.5.142-.663.146-.145.325-.379.488-.568.162-.19.216-.325.325-.542.108-.217.054-.406-.028-.569-.081-.162-.73-1.76-1-2.41-.264-.633-.532-.547-.73-.557l-.623-.011a1.194 1.194 0 0 0-.866.406c-.298.325-1.137 1.111-1.137 2.71 0 1.597 1.164 3.142 1.326 3.358.163.217 2.29 3.497 5.548 4.904.775.335 1.38.535 1.852.685.778.247 1.486.212 2.046.129.624-.093 1.922-.786 2.193-1.545.271-.759.271-1.41.19-1.545-.081-.136-.298-.217-.623-.38Z" />
      </svg>
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-extrabold transition-all group-hover:max-w-[140px] sm:inline">
        Chat with us
      </span>
    </a>
  );
}
