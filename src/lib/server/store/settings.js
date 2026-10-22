import "server-only";
import { defaultSettings, mergeSettings } from "@/data/siteContent";
import { ApiError } from "../api";
import { query, transaction } from "../db";

// Website content lives in three tables (see database/migrations/001_initial_schema.sql):
//   settings – one JSON document per section
//   pages    – Privacy Policy, Terms & Conditions, Return Policy
//   faqs     – FAQ questions (the FAQ page heading is in settings under "faqs")
const PAGE_SLUGS = { privacy: "privacy-policy", terms: "terms", returns: "return-policy" };
const SECTION_KEYS = Object.keys(defaultSettings);
const IMAGE_FIELDS = ["logo", "logoLight"];

const parse = (json) => {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
};

// Only what has been saved in the database (sections that were never saved use the defaults).
export async function getSavedSettings() {
  const [rows, pages, faqs] = await Promise.all([
    query("SELECT setting_key, setting_value FROM settings"),
    query("SELECT slug, title, intro, updated_label, content FROM pages"),
    query("SELECT group_name, question, answer FROM faqs ORDER BY sort_order, id"),
  ]);
  const saved = {};
  for (const row of rows) {
    const value = parse(row.setting_value);
    if (value !== undefined && SECTION_KEYS.includes(row.setting_key)) saved[row.setting_key] = value;
  }
  for (const page of pages) {
    const key = Object.keys(PAGE_SLUGS).find((k) => PAGE_SLUGS[k] === page.slug);
    if (!key) continue;
    const content = parse(page.content) ?? {};
    saved[key] = {
      title: page.title,
      intro: page.intro ?? "",
      updated: page.updated_label ?? "",
      highlights: content.highlights ?? [],
      sections: content.sections ?? [],
    };
  }
  if (saved.faqs) {
    const { items: _ignored, ...heading } = saved.faqs;
    saved.faqs = { ...heading, items: faqs.map((f) => ({ group: f.group_name, question: f.question, answer: f.answer })) };
  }
  return saved;
}

// Defaults + saved values (with "{storeName}" placeholders still in place).
export async function getSiteSettings() {
  return mergeSettings(defaultSettings, await getSavedSettings());
}

function checkSection(key, value) {
  if (!SECTION_KEYS.includes(key)) throw new ApiError(404, "Unknown section.");
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(400, "Invalid content.");
  if (JSON.stringify(value).length > 300_000) throw new ApiError(413, "This section is too large.");
  if (key === "general") {
    for (const field of IMAGE_FIELDS) {
      const v = value[field];
      if (v !== null && v !== undefined && !/^\/api\/images\/[a-f0-9]{24}$/.test(v)) {
        throw new ApiError(400, "Please upload the logo again.");
      }
    }
    for (const field of ["brandColor", "darkColor"]) {
      if (value[field] && !/^#[0-9a-f]{6}$/i.test(value[field])) throw new ApiError(400, "Colours must look like #61C149.");
    }
  }
}

export async function saveSection(key, value) {
  checkSection(key, value);
  await transaction(async (tx) => {
    if (PAGE_SLUGS[key]) {
      const content = JSON.stringify({ highlights: value.highlights ?? [], sections: value.sections ?? [] });
      await tx.query(
        `INSERT INTO pages (slug, title, intro, updated_label, content) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), intro = VALUES(intro), updated_label = VALUES(updated_label), content = VALUES(content)`,
        [PAGE_SLUGS[key], String(value.title ?? "").slice(0, 200), value.intro ?? "", String(value.updated ?? "").slice(0, 60), content]
      );
    } else if (key === "faqs") {
      const { items = [], ...heading } = value;
      await tx.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES ('faqs', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        [JSON.stringify(heading)]
      );
      await tx.query("DELETE FROM faqs");
      for (const [i, item] of items.entries()) {
        await tx.query("INSERT INTO faqs (group_name, question, answer, sort_order) VALUES (?, ?, ?, ?)", [
          String(item.group || "General").slice(0, 100),
          String(item.question ?? "").slice(0, 255),
          String(item.answer ?? ""),
          i,
        ]);
      }
    } else {
      await tx.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        [key, JSON.stringify(value)]
      );
    }
  });
}

export async function resetSection(key) {
  if (!SECTION_KEYS.includes(key)) throw new ApiError(404, "Unknown section.");
  await transaction(async (tx) => {
    if (PAGE_SLUGS[key]) await tx.query("DELETE FROM pages WHERE slug = ?", [PAGE_SLUGS[key]]);
    else {
      await tx.query("DELETE FROM settings WHERE setting_key = ?", [key]);
      if (key === "faqs") await tx.query("DELETE FROM faqs");
    }
  });
}
