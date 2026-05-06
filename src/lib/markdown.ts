/**
 * Tiny self-contained markdown → safe HTML renderer.
 *
 * No upstream dependency (markdown-it / remark / etc) because the blog
 * is a small surface and the parser only needs to support what the
 * admin actually writes:
 *
 *   # Heading 1 → h2 (h1 is reserved for the post title)
 *   ## Heading 2
 *   ### Heading 3
 *   *italic*  **bold**  `code`
 *   [text](https://url)
 *   - bullet
 *   1. ordered
 *   > blockquote
 *   ```code fence```
 *   ---  horizontal rule
 *   blank line  → paragraph break
 *
 * Output is HTML-escaped before any markdown is interpreted, so a
 * pasted `<script>` in the source is rendered as text. Links are forced
 * to noopener noreferrer; only http/https/mailto schemes pass through.
 */

const ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPE[c]);
}

function safeHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (/^\/[^/]/.test(trimmed)) return trimmed;
  return null;
}

function inline(src: string): string {
  let s = escape(src);
  // code spans first (so subsequent rules don't touch their content)
  s = s.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);
  // bold then italic (** before *)
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // links
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
    const href = safeHref(url);
    if (!href) return text;
    return `<a href="${href}" rel="noopener noreferrer" target="_blank">${text}</a>`;
  });
  return s;
}

/**
 * Render markdown to HTML. Block-level parser is line-based and
 * intentionally simple — good enough for the blog, not a general
 * markdown engine.
 */
export function renderMarkdown(input: string): string {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Code fence
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing fence
      out.push(`<pre><code>${escape(code.join("\n"))}</code></pre>`);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      out.push("<hr />");
      i++;
      continue;
    }

    // Heading: # → h2, ## → h3, ### → h4 (we never emit h1 — page header owns it)
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length + 1;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote (single-paragraph)
    if (line.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].slice(2));
        i++;
      }
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^[-*]\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Blank line — flush
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph: collect consecutive non-blank, non-block lines
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3}\s|>\s|[-*]\s|\d+\.\s|---+$|```)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return out.join("\n");
}
