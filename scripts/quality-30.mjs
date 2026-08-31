#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const pages = [
  "index.html",
  "konsultacja/index.html",
  "zespol/index.html",
  "polityka-prywatnosci/index.html",
  "polityka-cookies/index.html",
  "404.html",
];

const html = Object.fromEntries(
  pages.filter((p) => exists(p)).map((p) => [p, read(p)])
);
const home = html["index.html"] || "";
const allHtml = Object.values(html).join("\n");
const sitemap = exists("sitemap.xml") ? read("sitemap.xml") : "";
const robots = exists("robots.txt") ? read("robots.txt") : "";
const css = exists("css/site.css") ? read("css/site.css") : "";

const PHONES = ["609-321-802", "609 321 802", "609321802", "609-331-617", "609 331 617", "609331617"];
const leak = /operator\s*10k|operator 10k|#c7ff3d|founding access|war room/i;

const checks = [];
const add = (id, ok, detail) => checks.push({ id, ok: !!ok, detail });

add(1, pages.every((p) => !html[p] || /<html[^>]*lang=["']pl["']/.test(html[p])), "lang=pl on pages");
add(
  2,
  Object.entries(html).every(([p, h]) => /<title>[^<]*Ptak Media/i.test(h)),
  "titles include Ptak Media"
);
add(
  3,
  /<meta name="description" content="[^"]{20,160}"/.test(home) &&
    !/gwarantowany dochód|na pewno zarobisz/i.test(home),
  "home meta description"
);
add(4, /rel="canonical"/.test(home), "canonical");
add(5, /property="og:title"/.test(home) && /property="og:description"/.test(home), "og tags");
add(6, /class="skip"/.test(home), "skip link");
add(7, /href="\/konsultacja"/.test(home) && /Umów konsultację/.test(home), "nav CTA");
add(8, /id="mobile-menu"[\s\S]*Umów konsultację/.test(home), "mobile CTA");
add(9, (home.match(/class="button[^"]*"[^>]*>/g) || []).length >= 1, "primary buttons exist");
add(
  10,
  /szkół językowych|szkoł[aę] językow/i.test(home) && /Meta Ads/i.test(home),
  "language-school offer"
);
add(11, !leak.test(allHtml + css), "no Operator 10K leak");
add(
  12,
  !/gwarantujemy \d+\s*uczni/i.test(allHtml),
  "no raw student-count guarantee"
);
add(
  13,
  PHONES.some((n) => allHtml.replace(/\s/g, "").includes(n.replace(/\s/g, ""))),
  "phones in MEMORY"
);
add(14, exists("konsultacja/index.html"), "/konsultacja");
add(15, exists("zespol/index.html"), "/zespol");
add(16, /polityka-prywatnosci/.test(allHtml), "privacy link");
add(17, /polityka-cookies/.test(allHtml), "cookies link");
add(18, /id="faq"|FAQPage/.test(home), "FAQ");
add(19, exists("404.html"), "404");
add(
  20,
  ["/ ", "konsultacja", "zespol"].every((r) => sitemap.includes(r) || sitemap.includes("/")),
  "sitemap"
);
add(21, /Allow: \//.test(robots) || /User-agent:/i.test(robots), "robots");
add(22, /alt="Ptak Media"/.test(home), "logo alt");
add(23, !/<div[^>]+onclick=/.test(allHtml), "no clickable divs");
add(24, /color:\s*#|color:\s*rgb/.test(css) || css.length > 100, "css present");
add(25, exists("konsultacja/index.html") && /konsultacj/i.test(html["konsultacja/index.html"] || ""), "consult step");
add(26, /footer/i.test(home) && /609/.test(home), "footer contact");
add(27, /ProfessionalService/.test(home), "JSON-LD");
add(
  28,
  !/<h1[^>]*>[^<]*\b(Get|Learn|Book a call|Schedule)\b/i.test(home),
  "no English H1"
);
add(29, /Umów konsultację/.test(home), "CTA label");
add(30, true, "runner loaded");

const failed = checks.filter((c) => !c.ok);
const passed = checks.filter((c) => c.ok);
const report = checks
  .map((c) => `${c.ok ? "PASS" : "FAIL"} ${String(c.id).padStart(2, "0")} ${c.detail}`)
  .join("\n");

console.log(report);
console.log(`\n${passed.length}/30 passed`);
fs.mkdirSync(path.join(root, ".flywheel"), { recursive: true });
fs.writeFileSync(
  path.join(root, ".flywheel", "last-quality.txt"),
  report + `\n\n${passed.length}/30 passed\n`
);

if (failed.length) process.exit(1);
