"use client";

import Link from "next/link";
import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { defaultSettings } from "@/data/siteContent";
import { deleteUploads } from "@/lib/api";
import { collectImageUrls } from "@/lib/imageStore";
import ImageUploader from "./ImageUploader";
import { SECTIONS } from "./settingsSections";

const smallBtn = "rounded-full border border-grey-200 px-2.5 py-1 text-xs font-bold hover:border-ink disabled:opacity-30";

function moveItem(list, index, step) {
  const next = [...list];
  [next[index], next[index + step]] = [next[index + step], next[index]];
  return next;
}

// One form field; lists render their item fields recursively.
function Field({ field, value, onChange, onUploaded }) {
  const label = <span className="field-label">{field.label}</span>;
  const hint = field.hint && <span className="mt-1 block text-xs text-grey-500">{field.hint}</span>;

  switch (field.type) {
    case "textarea":
      return (
        <label className="block">
          {label}
          <textarea rows={field.rows ?? 3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="field-input" />
          {hint}
        </label>
      );
    case "number":
      return (
        <label className="block">
          {label}
          <input
            type="number"
            min="0"
            step="1"
            value={value ?? 0}
            onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
            className="field-input max-w-[220px]"
          />
          {hint}
        </label>
      );
    case "color":
      return (
        <label className="block">
          {label}
          <span className="mt-1.5 flex items-center gap-3">
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-field border border-grey-200" />
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              pattern="#[0-9a-fA-F]{6}"
              className="field-input !mt-0 max-w-[140px] font-mono uppercase"
            />
          </span>
          {hint}
        </label>
      );
    case "toggle":
      return (
        <label className="flex items-center gap-2.5">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-ink" />
          <span className="field-label">{field.label}</span>
        </label>
      );
    case "image":
      return (
        <div>
          <ImageUploader label={field.label} value={value ? [value] : []} onChange={(ids) => onChange(ids[0] ?? null)} onUploaded={onUploaded} max={1} logo />
          {hint}
        </div>
      );
    case "strings": {
      const list = value ?? [];
      return (
        <div>
          {label}
          <div className="mt-1.5 grid grid-cols-1 gap-2">
            {list.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input value={item} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} className="field-input !mt-0" />
                <button type="button" onClick={() => onChange(moveItem(list, i, -1))} disabled={i === 0} className={smallBtn} aria-label="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className={smallBtn} aria-label="Remove">
                  ✕
                </button>
              </div>
            ))}
          </div>
          {(!field.max || list.length < field.max) && (
            <button type="button" onClick={() => onChange([...list, ""])} className="mt-2 text-sm font-extrabold text-brand-700 hover:underline">
              + Add
            </button>
          )}
        </div>
      );
    }
    case "list":
      return <ListField field={field} value={value ?? []} onChange={onChange} onUploaded={onUploaded} />;
    default:
      return (
        <label className="block">
          {label}
          <input value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className="field-input" />
          {hint}
        </label>
      );
  }
}

function ListField({ field, value, onChange, onUploaded }) {
  const [open, setOpen] = useState(null);
  const canAdd = !field.fixed && (!field.max || value.length < field.max);

  return (
    <div>
      <span className="field-label">{field.label}</span>
      {field.hint && <span className="mt-1 block text-xs text-grey-500">{field.hint}</span>}
      <div className="mt-1.5 grid grid-cols-1 gap-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-field border border-grey-200 bg-grey-50">
            <div className="flex items-center gap-2 px-3 py-2">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="min-w-0 flex-1 truncate text-left text-sm font-bold">
                <span className="mr-2 text-grey-400" aria-hidden="true">
                  {open === i ? "▾" : "▸"}
                </span>
                {field.itemLabel ? field.itemLabel(item, i) : `Item ${i + 1}`}
              </button>
              {!field.fixed && (
                <>
                  <button type="button" onClick={() => onChange(moveItem(value, i, -1))} disabled={i === 0} className={smallBtn} aria-label="Move up">
                    ↑
                  </button>
                  <button type="button" onClick={() => onChange(moveItem(value, i, 1))} disabled={i === value.length - 1} className={smallBtn} aria-label="Move down">
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(value.filter((_, j) => j !== i));
                      setOpen(null);
                    }}
                    className={`${smallBtn} text-red-600`}
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
            {open === i && (
              <div className="grid grid-cols-1 gap-4 border-t border-grey-200 bg-white p-4">
                {field.fields.map((sub) => (
                  <Field
                    key={sub.name}
                    field={sub}
                    value={item[sub.name]}
                    onUploaded={onUploaded}
                    onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, [sub.name]: v } : x)))}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        {value.length === 0 && <p className="text-sm text-grey-500">Nothing here yet.</p>}
      </div>
      {canAdd && (
        <button
          type="button"
          onClick={() => {
            onChange([...value, { ...field.newItem }]);
            setOpen(value.length);
          }}
          className="mt-2 text-sm font-extrabold text-brand-700 hover:underline"
        >
          + Add {field.label.toLowerCase().replace(/\s*\(.*\)$/, "").replace(/s$/, "")}
        </button>
      )}
    </div>
  );
}

// Super admin editor for one group of sections ("website" content or store "settings").
export default function SettingsEditor({ group }) {
  const { rawSettings: settings, saveSection, resetSection } = useSettings();
  const sections = SECTIONS.filter((s) => s.group === group);
  const [active, setActive] = useState(sections[0].key);
  const [draft, setDraft] = useState(null); // null = no unsaved changes
  const [uploaded, setUploaded] = useState([]);
  const [message, setMessage] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  // After saving, keep showing the saved values until the refreshed data arrives from the server.
  const [savedBase, setSavedBase] = useState(null);
  if (savedBase && settings[active] !== savedBase) {
    setSavedBase(null);
    setDraft(null);
  }

  const section = sections.find((s) => s.key === active);
  const value = draft ?? settings[active];
  const dirty = draft !== null && !savedBase;
  const customized = (key) => JSON.stringify(settings[key]) !== JSON.stringify(defaultSettings[key]);

  function choose(key) {
    if (key === active) return;
    if (dirty && !confirm("You have unsaved changes. Discard them?")) return;
    deleteUploads(uploaded);
    setUploaded([]);
    setDraft(null);
    setSavedBase(null);
    setMessage({ text: "", error: false });
    setActive(key);
  }

  function change(name, v) {
    setDraft({ ...value, [name]: v });
    setSavedBase(null);
    setMessage({ text: "", error: false });
  }

  async function save() {
    setBusy(true);
    try {
      await saveSection(active, draft);
      const kept = collectImageUrls(draft);
      deleteUploads([...collectImageUrls(settings[active]), ...uploaded].filter((url) => !kept.has(url)));
      setUploaded([]);
      setSavedBase(settings[active]);
      setMessage({ text: `✓ ${section.title} saved. Changes are live on the site.`, error: false });
    } catch (err) {
      setMessage({ text: err.message, error: true });
    }
    setBusy(false);
  }

  function discard() {
    deleteUploads(uploaded);
    setUploaded([]);
    setDraft(null);
    setMessage({ text: "", error: false });
  }

  async function reset() {
    if (!confirm(`Reset "${section.title}" to the original content? Your changes in this section will be lost.`)) return;
    setBusy(true);
    try {
      await resetSection(active);
      deleteUploads([...collectImageUrls(settings[active]), ...uploaded]);
      setDraft(null);
      setUploaded([]);
      setMessage({ text: `${section.title} was reset to the original content.`, error: false });
    } catch (err) {
      setMessage({ text: err.message, error: true });
    }
    setBusy(false);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
      <nav aria-label="Sections" className="flex gap-2 overflow-x-auto pb-1.5 [scrollbar-width:none] lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => choose(s.key)}
            aria-current={s.key === active}
            className={`pill justify-between lg:w-full lg:rounded-field ${s.key === active ? "pill-active" : ""}`}
          >
            {s.title}
            {customized(s.key) && (
              <span className={`h-2 w-2 shrink-0 rounded-full ${s.key === active ? "bg-brand-500" : "bg-brand-600"}`} title="Customized" />
            )}
          </button>
        ))}
      </nav>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty) save();
        }}
        className="panel min-w-0"
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl">{section.title}</h2>
            {section.description && <p className="text-sm text-grey-500">{section.description}</p>}
            {group === "website" && (
              <p className="mt-1 text-xs text-grey-500">
                Tip: write <code className="rounded bg-grey-100 px-1">{"{storeName}"}</code> to insert your store name.
              </p>
            )}
          </div>
          {section.view && (
            <Link href={section.view} target="_blank" className="text-sm font-extrabold text-brand-700 hover:underline">
              View page ↗
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5">
          {section.fields.map((field) => (
            <Field
              key={field.name}
              field={field}
              value={value[field.name]}
              onChange={(v) => change(field.name, v)}
              onUploaded={(ids) => setUploaded((prev) => [...prev, ...ids])}
            />
          ))}
        </div>

        {message.text && (
          <p
            role="status"
            className={`mt-5 rounded-field px-4 py-3 text-sm font-bold ${message.error ? "bg-red-50 text-red-700" : "bg-brand-100 text-brand-700"}`}
          >
            {message.text}
          </p>
        )}

        <div className="sticky bottom-0 -mx-6 mt-6 flex flex-wrap items-center gap-3 border-t border-grey-200 bg-white px-6 py-4 sm:-mx-[30px] sm:px-[30px]">
          <button type="submit" disabled={!dirty || busy} className="btn btn-primary">
            {busy ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={discard} disabled={!dirty || busy} className="btn btn-outline">
            Discard
          </button>
          <span className="flex-1" />
          {dirty && <span className="text-sm font-bold text-amber-700">Unsaved changes</span>}
          <button type="button" onClick={reset} disabled={busy || (!customized(active) && !dirty)} className="text-sm font-bold text-grey-500 hover:text-red-600 disabled:opacity-40">
            Reset to default
          </button>
        </div>
      </form>
    </div>
  );
}
