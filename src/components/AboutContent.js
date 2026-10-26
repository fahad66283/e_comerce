"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { mapDirectionsUrl, mapEmbedUrl } from "@/lib/maps";
import RichText from "./RichText";

export default function AboutContent() {
  const { about } = useSettings().settings;
  const mapSrc = about.showMap ? mapEmbedUrl(about.mapLocation, about.mapAddress) : null;
  const directions = mapDirectionsUrl(about.mapLocation, about.mapAddress);

  return (
    <div className="container-page py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="eyebrow">{about.eyebrow}</span>
          <h1 className="section-title">{about.title}</h1>
          <RichText text={about.story} className="mt-3.5 grid gap-3 text-grey-700" />
          {about.values.length > 0 && (
            <div className="mt-6 grid gap-4">
              {about.values.map((v, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-brand-100 text-[1.3rem]">
                    {v.icon}
                  </span>
                  <div>
                    <h4>{v.title}</h4>
                    <p className="text-[0.88rem] text-grey-500">{v.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn btn-primary">
              Browse Products
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Contact Us
            </Link>
          </div>
        </div>

        {about.stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            {about.stats.map((s, i) => (
              <div key={i} className="rounded-card border-[1.5px] border-grey-200 bg-white px-3.5 py-6 text-center">
                <div className="text-[1.7rem] font-black text-brand-600">{s.value}</div>
                <div className="mt-1 text-[0.76rem] font-semibold text-grey-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mapSrc && (
        <section className="mt-16">
          <h2 className="section-title">{about.mapTitle}</h2>
          <div className="mt-5 overflow-hidden rounded-panel border-[1.5px] border-grey-200 bg-grey-100">
            <iframe
              key={mapSrc}
              src={mapSrc}
              title={`Map: ${about.mapAddress || about.mapTitle}`}
              className="block h-[300px] w-full sm:h-[400px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {about.mapAddress && <p className="font-bold">📍 {about.mapAddress}</p>}
            {directions && (
              <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                Get directions ↗
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
