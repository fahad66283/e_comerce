"use client";

import { useSettings } from "@/context/SettingsContext";
import InfoPageLayout, { PolicySection } from "./InfoPageLayout";
import RichText from "./RichText";

// Privacy Policy, Terms & Conditions and Return Policy, all editable by the super admin.
export default function PolicyPage({ section }) {
  const page = useSettings().settings[section];

  return (
    <InfoPageLayout eyebrow="Policies" title={page.title} intro={page.intro} updated={page.updated}>
      {page.highlights.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {page.highlights.map((c, i) => (
            <div key={i} className="rounded-card border border-grey-200 bg-grey-50 p-5 text-center">
              <div className="text-2xl">{c.icon}</div>
              <p className="mt-2 font-extrabold">{c.title}</p>
              <p className="text-sm text-grey-500">{c.text}</p>
            </div>
          ))}
        </div>
      )}
      {page.sections.map((s, i) => (
        <PolicySection key={i} title={s.title}>
          <RichText text={s.body} />
        </PolicySection>
      ))}
    </InfoPageLayout>
  );
}
