import Link from "next/link";

// Renders simple formatted text from the editable content:
// **bold**, [text](/page) links, "- " bullet lines and blank lines between paragraphs.
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

function safeHref(url) {
  if (url.startsWith("/") && !url.startsWith("//")) return { internal: true, href: url };
  if (/^(https?:|mailto:|tel:)/i.test(url)) return { internal: false, href: url };
  return null;
}

export function Inline({ text, strongClassName = "font-extrabold", linkClassName = "font-bold text-brand-700 underline" }) {
  if (!text) return null;
  return String(text)
    .split(TOKEN)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={i} className={strongClassName}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (link) {
        const target = safeHref(link[2]);
        if (!target) return link[1];
        return target.internal ? (
          <Link key={i} href={target.href} className={linkClassName}>
            {link[1]}
          </Link>
        ) : (
          <a key={i} href={target.href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            {link[1]}
          </a>
        );
      }
      return part;
    });
}

export default function RichText({ text, className = "grid gap-3" }) {
  if (!text) return null;
  const blocks = String(text).trim().split(/\n\s*\n/);
  return (
    <div className={className}>
      {blocks.map((block, b) => {
        // Split a block into runs of normal lines and bullet lines.
        const runs = [];
        for (const line of block.split("\n")) {
          const bullet = /^\s*-\s+/.test(line);
          const last = runs[runs.length - 1];
          const content = bullet ? line.replace(/^\s*-\s+/, "") : line;
          if (last && last.bullet === bullet) last.lines.push(content);
          else runs.push({ bullet, lines: [content] });
        }
        return runs.map((run, r) =>
          run.bullet ? (
            <ul key={`${b}-${r}`} className="ml-5 grid list-disc gap-1.5">
              {run.lines.map((line, i) => (
                <li key={i}>
                  <Inline text={line} />
                </li>
              ))}
            </ul>
          ) : (
            <p key={`${b}-${r}`}>
              {run.lines.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  <Inline text={line} />
                </span>
              ))}
            </p>
          )
        );
      })}
    </div>
  );
}
