"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import InfoPageLayout from "./InfoPageLayout";
import RichText from "./RichText";

export default function FaqContent() {
  const { faqs } = useSettings().settings;
  // Group questions by their group name, keeping the order they were entered in.
  const groups = [];
  for (const item of faqs.items) {
    const name = item.group?.trim() || "General";
    let group = groups.find((g) => g.name === name);
    if (!group) groups.push((group = { name, items: [] }));
    group.items.push(item);
  }

  return (
    <InfoPageLayout eyebrow={faqs.eyebrow} title={faqs.title} intro={faqs.intro}>
      <div className="grid gap-10">
        {groups.map((group) => (
          <section key={group.name}>
            <h2 className="mb-4 text-xl">{group.name}</h2>
            <div className="grid gap-3">
              {group.items.map((item, i) => (
                <details key={i} className="card group px-5 py-4 open:border-ink">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold">
                    {item.question}
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-grey-100 transition group-open:rotate-45 group-open:bg-brand-500"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <RichText text={item.answer} className="mt-3 grid gap-2 text-grey-700" />
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="flex flex-col items-start justify-between gap-4 rounded-panel bg-brand-50 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg">Still have a question?</h2>
            <p className="text-grey-500">Our team is happy to help.</p>
          </div>
          <Link href="/contact" className="btn btn-dark">
            Contact Us
          </Link>
        </div>
      </div>
    </InfoPageLayout>
  );
}
