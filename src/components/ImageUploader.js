"use client";

import { useId, useState } from "react";
import { ACCEPTED_TYPES, saveUploadedImage } from "@/lib/imageStore";
import StoredImage from "./StoredImage";

// Upload, reorder and remove images. The first image is the main one.
// `onUploaded(ids)` lets the parent clean up images that were uploaded but never saved.
export default function ImageUploader({ value, onChange, onUploaded, max = 5, logo = false, label = "Images" }) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const images = value ?? [];
  const room = max - images.length;

  async function addFiles(fileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setError(files.length > room ? `You can add ${room} more (maximum ${max}).` : "");
    setBusy(true);
    const added = [];
    for (const file of files.slice(0, room)) {
      try {
        added.push(await saveUploadedImage(file, logo ? { maxSize: 600, keepTransparency: true } : undefined));
      } catch (err) {
        setError(err.message);
      }
    }
    setBusy(false);
    if (added.length) {
      onUploaded?.(added);
      onChange([...images, ...added]);
    }
  }

  function move(index, step) {
    const next = [...images];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="field-label">{label}</span>
        {max > 1 && (
          <span className="text-xs text-grey-500">
            {images.length}/{max} · first image is the main one
          </span>
        )}
      </div>

      <div className="mt-1.5 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {images.map((id, i) => (
          <div key={id} className="group relative aspect-square overflow-hidden rounded-field border border-grey-200 bg-grey-50">
            <StoredImage id={id} alt={`Image ${i + 1}`} className={`h-full w-full ${logo ? "object-contain p-2" : "object-cover"}`} />
            {i === 0 && max > 1 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[0.65rem] font-extrabold text-white">
                Main
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/70 p-1 text-white">
              {max > 1 ? (
                <span className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move image left" className="rounded px-1.5 hover:bg-white/20 disabled:opacity-30">
                    ←
                  </button>
                  <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="Move image right" className="rounded px-1.5 hover:bg-white/20 disabled:opacity-30">
                    →
                  </button>
                </span>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => onChange(images.filter((x) => x !== id))} aria-label={`Remove image ${i + 1}`} className="rounded px-1.5 hover:bg-red-500">
                ✕
              </button>
            </div>
          </div>
        ))}

        {room > 0 && (
          <label
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-field border-2 border-dashed text-center text-xs font-bold transition ${
              dragging ? "border-brand-500 bg-brand-50" : "border-grey-200 text-grey-500 hover:border-ink hover:text-ink"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {busy ? "⏳" : "＋"}
            </span>
            {busy ? "Uploading..." : max > 1 ? "Add images" : "Upload"}
            <input
              id={inputId}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              multiple={max > 1}
              disabled={busy}
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-bold text-red-600">{error}</p>}
      <p className="mt-1.5 text-xs text-grey-500">JPG, PNG, WebP or GIF. Large photos are resized automatically.</p>
    </div>
  );
}
