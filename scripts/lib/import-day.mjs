import { access, cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

export const VALID_STATUSES = new Set(["planned", "in-progress", "completed"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);

export function formatDaySlug(day) {
  return `day-${String(day).padStart(2, "0")}`;
}

export function inferDay(value) {
  const match = String(value ?? "").match(/(?:^|[^a-z])day\s*[-_：:]?\s*(\d+)/i);
  return match ? Number(match[1]) : undefined;
}

export function shanghaiDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function normalizeDate(value) {
  if (!value) return shanghaiDate();
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(new Date(`${text}T00:00:00Z`).valueOf())) {
    throw new Error(`date 必须使用 YYYY-MM-DD 格式，当前值：${text}`);
  }
  return text;
}

function normalizeTags(value) {
  if (value == null || value === "") return [];
  const tags = Array.isArray(value) ? value : String(value).split(/[,，]/);
  return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
}

function stripDayPrefix(title) {
  return title.replace(/^Day\s*\d+\s*[：:—–-]?\s*/i, "").trim();
}

function extractSummary(body) {
  const withoutCode = body.replace(/```[\s\S]*?```/g, "");
  const paragraphs = withoutCode.split(/\n\s*\n/);
  for (const paragraph of paragraphs) {
    const lines = paragraph.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    if (lines.every((line) => /^(?:#|>|[-*+]\s|\d+\.\s|\||---+$)/.test(line))) continue;
    const text = lines
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/!?(?:\[([^\]]*)\])\([^)]*\)/g, "$1")
      .replace(/[`*_~]/g, "")
      .trim();
    if (text.length >= 12) return text.slice(0, 160);
  }
  throw new Error("无法从正文推断 summary，请在 frontmatter 中补充 summary");
}

async function exists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function replaceAsync(input, regexp, replacer) {
  const matches = [...input.matchAll(regexp)];
  if (matches.length === 0) return input;
  const replacements = await Promise.all(matches.map((match) => replacer(...match)));
  let cursor = 0;
  let result = "";
  matches.forEach((match, index) => {
    result += input.slice(cursor, match.index) + replacements[index];
    cursor = match.index + match[0].length;
  });
  return result + input.slice(cursor);
}

function isRemoteReference(reference) {
  return /^(?:[a-z]+:|\/|#)/i.test(reference);
}

function safeDecode(reference) {
  try {
    return decodeURIComponent(reference);
  } catch {
    return reference;
  }
}

function headingHash(heading) {
  const slugger = new GithubSlugger();
  return `#${slugger.slug(String(heading).trim())}`;
}

export async function normalizeDayDocument(sourcePath, options = {}) {
  const absoluteSource = resolve(sourcePath);
  const sourceInfo = await stat(absoluteSource).catch(() => null);
  if (!sourceInfo?.isFile()) throw new Error(`找不到 Markdown 文件：${absoluteSource}`);
  if (extname(absoluteSource).toLowerCase() !== ".md") throw new Error("只支持 .md 文件");

  const raw = await readFile(absoluteSource, "utf8");
  const parsed = matter(raw);
  const headingMatch = parsed.content.match(/^#\s+(.+)$/m);
  const rawTitle = String(parsed.data.title ?? headingMatch?.[1] ?? "").trim();
  if (!rawTitle) throw new Error("缺少标题：请添加一级标题或 frontmatter.title");

  const day = Number(parsed.data.day ?? inferDay(basename(absoluteSource)) ?? inferDay(rawTitle));
  if (!Number.isInteger(day) || day <= 0) throw new Error("无法识别 Day 编号，请使用 Day2.md、一级标题“Day 2”或 frontmatter.day");

  const title = stripDayPrefix(rawTitle);
  if (!title) throw new Error("标题不能只有 Day 编号");
  const status = String(parsed.data.status ?? options.status ?? "completed");
  if (!VALID_STATUSES.has(status)) {
    throw new Error(`status 只能是 planned、in-progress 或 completed，当前值：${status}`);
  }

  let body = parsed.content;
  if (headingMatch) body = body.replace(/^#\s+.+(?:\r?\n)+/, "");
  body = body.trimStart();
  body = body.replace(
    /^>\s*\*\*配套讲稿\*\*：\s*\[\[[^\]]*逐字演讲稿[^\]]*\]\]\s*\n?/gm,
    "",
  );

  const slug = formatDaySlug(day);
  const assetSources = new Map();
  const registerAsset = async (reference) => {
    const cleaned = safeDecode(reference.replace(/^<|>$/g, "").split("#")[0]);
    const sourceAsset = resolve(dirname(absoluteSource), cleaned);
    const info = await stat(sourceAsset).catch(() => null);
    if (!info?.isFile()) throw new Error(`图片不存在：${reference}（从 ${absoluteSource} 解析）`);
    if (!IMAGE_EXTENSIONS.has(extname(sourceAsset).toLowerCase())) throw new Error(`Obsidian 嵌入不是受支持的图片：${reference}`);
    const filename = basename(sourceAsset);
    const collision = assetSources.get(filename);
    if (collision && collision !== sourceAsset) throw new Error(`存在同名图片冲突：${filename}`);
    assetSources.set(filename, sourceAsset);
    return `/content-assets/${slug}/${encodeURIComponent(filename)}`;
  };

  body = await replaceAsync(body, /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, async (_all, target, alt) => {
    const url = await registerAsset(target.trim());
    return `![${String(alt ?? basename(target, extname(target))).trim()}](${url})`;
  });

  body = await replaceAsync(body, /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, async (all, alt, reference) => {
    if (isRemoteReference(reference)) return all;
    const url = await registerAsset(reference);
    return `![${alt}](${url})`;
  });

  body = await replaceAsync(body, /(?<!!)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, async (_all, target, label) => {
    const normalizedTarget = String(target).trim();
    const hashIndex = normalizedTarget.indexOf("#");
    const documentReference = hashIndex >= 0 ? normalizedTarget.slice(0, hashIndex).trim() : normalizedTarget;
    const heading = hashIndex >= 0 ? normalizedTarget.slice(hashIndex + 1).trim() : "";
    const hash = heading ? headingHash(heading) : "";
    const linkLabel = String(label ?? heading ?? documentReference).trim();

    if (!documentReference && heading) return `[${linkLabel}](${hash})`;

    const linkedDay = inferDay(documentReference);
    if (!linkedDay) throw new Error(`无法发布未解析的 Obsidian 内部链接：[[${target}]]`);
    return `[${linkLabel}](/days/${formatDaySlug(linkedDay)}/${hash})`;
  });

  body = body.replace(/(?<!!)\[([^\]]+)\]\(([^)]+\.md(?:#[^)]*)?)\)/gi, (all, label, reference) => {
    if (isRemoteReference(reference)) return all;
    const linkedDay = inferDay(reference);
    if (!linkedDay) throw new Error(`无法将本地 Markdown 链接转换为站内路由：${reference}`);
    const hash = reference.includes("#") ? `#${reference.split("#").slice(1).join("#")}` : "";
    return `[${label}](/days/${formatDaySlug(linkedDay)}/${hash})`;
  });

  if (body.includes("[[") || body.includes("]]")) throw new Error("正文仍包含未解析的 Obsidian 链接，请先修正后再发布");

  const metadata = {
    day,
    title,
    date: normalizeDate(parsed.data.date ?? options.date),
    summary: String(parsed.data.summary ?? options.summary ?? extractSummary(body)).trim(),
    tags: normalizeTags(parsed.data.tags ?? options.tags),
    status,
    ...(parsed.data.duration || options.duration ? { duration: String(parsed.data.duration ?? options.duration).trim() } : {}),
  };
  if (!metadata.summary) throw new Error("summary 不能为空");

  return {
    sourcePath: absoluteSource,
    slug,
    day,
    metadata,
    body,
    assets: [...assetSources.entries()].map(([filename, path]) => ({ filename, path })),
    markdown: matter.stringify(body.endsWith("\n") ? body : `${body}\n`, metadata),
  };
}

export async function listDayMetadata(projectRoot) {
  const directory = join(projectRoot, "src/content/days");
  if (!(await exists(directory))) return [];
  const files = (await readdir(directory)).filter((file) => file.endsWith(".md"));
  return Promise.all(files.map(async (file) => {
    const parsed = matter(await readFile(join(directory, file), "utf8"));
    return { file, day: Number(parsed.data.day) };
  }));
}

export async function assertNoDuplicateDay(projectRoot, result, replaceExisting = false) {
  const entries = await listDayMetadata(projectRoot);
  const expectedFile = `${result.slug}.md`;
  const duplicate = entries.find((entry) => entry.day === result.day && entry.file !== expectedFile);
  if (duplicate) throw new Error(`Day ${result.day} 已由 ${duplicate.file} 占用`);
  const targetExists = entries.some((entry) => entry.file === expectedFile);
  if (targetExists && !replaceExisting) throw new Error(`${expectedFile} 已存在；确认更新时请增加 --replace`);
}

export async function writeDayDocument(projectRoot, result, { replaceExisting = false } = {}) {
  await assertNoDuplicateDay(projectRoot, result, replaceExisting);
  const contentPath = join(projectRoot, "src/content/days", `${result.slug}.md`);
  const assetPath = join(projectRoot, "public/content-assets", result.slug);
  const temporary = await import("node:fs/promises").then(({ mkdtemp }) => mkdtemp(join(tmpdir(), `${result.slug}-`)));
  const tempContent = join(temporary, `${result.slug}.md`);
  const tempAssets = join(temporary, "assets");

  await writeFile(tempContent, result.markdown, "utf8");
  if (result.assets.length > 0) {
    await mkdir(tempAssets, { recursive: true });
    await Promise.all(result.assets.map((asset) => cp(asset.path, join(tempAssets, asset.filename))));
  }

  await mkdir(dirname(contentPath), { recursive: true });
  await rm(contentPath, { force: true });
  await rename(tempContent, contentPath);
  await rm(assetPath, { recursive: true, force: true });
  if (result.assets.length > 0) {
    await mkdir(dirname(assetPath), { recursive: true });
    await rename(tempAssets, assetPath);
  }
  await rm(temporary, { recursive: true, force: true });
  return { contentPath, assetPath };
}
