import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import matter from "gray-matter";
import {
  assertNoDuplicateDay,
  inferDay,
  normalizeDayDocument,
  writeDayDocument,
} from "../scripts/lib/import-day.mjs";

async function fixture(name, content) {
  const directory = await mkdtemp(join(tmpdir(), "learning-portal-test-"));
  const path = join(directory, name);
  await writeFile(path, content, "utf8");
  return { directory, path };
}

test("可以从文件名和一级标题推断元数据", async () => {
  const { path } = await fixture("Day2.md", "# Day 2：集合入门\n\n这一段足够长，可以自动成为页面摘要。\n");
  const result = await normalizeDayDocument(path, { date: "2026-08-25" });
  assert.equal(result.day, 2);
  assert.equal(result.slug, "day-02");
  assert.equal(result.metadata.title, "集合入门");
  assert.equal(result.metadata.status, "completed");
  assert.equal(result.metadata.date, "2026-08-25");
  assert.doesNotMatch(result.body, /^# Day 2/m);
});

test("优先采用合法 frontmatter", async () => {
  const { path } = await fixture("note.md", `---
day: 3
title: 方法与参数
date: 2026-08-26
summary: 理解 Java 方法设计和按值传递。
tags: [Java, 方法]
status: in-progress
duration: 90 分钟
---

正文内容。
`);
  const result = await normalizeDayDocument(path);
  assert.deepEqual(result.metadata.tags, ["Java", "方法"]);
  assert.equal(result.metadata.status, "in-progress");
  assert.equal(result.metadata.duration, "90 分钟");
});

test("非法状态会给出明确错误", async () => {
  const { path } = await fixture("Day4.md", `---
status: done
---
# Day 4：异常处理

这一段足够长，可以作为自动生成的摘要内容。
`);
  await assert.rejects(() => normalizeDayDocument(path), /status 只能是/);
});

test("缺少标题时拒绝导入", async () => {
  const { path } = await fixture("Day5.md", "只有普通正文，没有一级标题。\n");
  await assert.rejects(() => normalizeDayDocument(path), /缺少标题/);
});

test("处理标准图片和 Obsidian 图片嵌入", async () => {
  const { directory, path } = await fixture("Day6.md", "# Day 6：图片\n\n这一段足够长，可以自动成为摘要内容。\n\n![结构](diagram.png)\n\n![[screen.jpg|运行截图]]\n");
  await writeFile(join(directory, "diagram.png"), "png");
  await writeFile(join(directory, "screen.jpg"), "jpg");
  const result = await normalizeDayDocument(path);
  assert.equal(result.assets.length, 2);
  assert.match(result.body, /\/content-assets\/day-06\/diagram\.png/);
  assert.match(result.body, /!\[运行截图\]\(\/content-assets\/day-06\/screen\.jpg\)/);
});

test("丢失图片时拒绝发布", async () => {
  const { path } = await fixture("Day7.md", "# Day 7：图片错误\n\n这一段足够长，可以成为自动摘要。\n\n![](missing.png)\n");
  await assert.rejects(() => normalizeDayDocument(path), /图片不存在/);
});

test("转换指向 Day 的 Obsidian 链接并拒绝未知链接", async () => {
  const valid = await fixture("Day8.md", "# Day 8：链接\n\n这一段足够长，可以作为自动摘要。\n\n请回顾 [[Day 1|第一天]]。\n");
  const result = await normalizeDayDocument(valid.path);
  assert.match(result.body, /\[第一天\]\(\/days\/day-01\/\)/);

  const invalid = await fixture("Day9.md", "# Day 9：链接\n\n这一段足够长，可以作为自动摘要。\n\n请查看 [[临时草稿]]。\n");
  await assert.rejects(() => normalizeDayDocument(invalid.path), /未解析的 Obsidian 内部链接/);
});

test("转换当前页与其他 Day 的 Obsidian 标题锚点", async () => {
  const { path } = await fixture("Day8.md", `# Day 8：章节链接

这一段足够长，可以作为自动摘要。

- [[#2. 泛型分页模型 \`Page<T>\`]]
- [[Day 3#Q01. 泛型解决什么问题？|查看泛型面试题]]
`);
  const result = await normalizeDayDocument(path);
  assert.match(result.body, /\[2\. 泛型分页模型 \`Page<T>\`\]\(#2-泛型分页模型-paget\)/);
  assert.match(result.body, /\[查看泛型面试题\]\(\/days\/day-03\/#q01-泛型解决什么问题\)/);
});

test("发布日讲义时移除只存在于 Obsidian 的配套逐字稿链接", async () => {
  const { path } = await fixture("Day2.md", `# Day 2：分层

> **配套讲稿**：[[Day2-逐字演讲稿]]

这一段足够长，可以作为自动摘要。
`);
  const result = await normalizeDayDocument(path);
  assert.doesNotMatch(result.body, /逐字演讲稿/);
  assert.match(result.body, /这一段足够长/);
});

test("写入时保护已有 Day，--replace 才允许更新", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "learning-portal-project-"));
  await mkdir(join(projectRoot, "src/content/days"), { recursive: true });
  const source = await fixture("Day10.md", "# Day 10：泛型\n\n这一段足够长，可以成为自动生成的摘要。\n");
  const result = await normalizeDayDocument(source.path, { date: "2026-08-30" });
  await writeDayDocument(projectRoot, result);
  await assert.rejects(() => assertNoDuplicateDay(projectRoot, result), /--replace/);
  await writeDayDocument(projectRoot, { ...result, markdown: result.markdown.replace("泛型", "泛型进阶") }, { replaceExisting: true });
  const parsed = matter(await readFile(join(projectRoot, "src/content/days/day-10.md"), "utf8"));
  assert.equal(parsed.data.day, 10);
});

test("同一个 Day 不能被不同文件占用", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "learning-portal-duplicate-"));
  const directory = join(projectRoot, "src/content/days");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "custom.md"), "---\nday: 11\n---\n正文\n", "utf8");
  const source = await fixture("Day11.md", "# Day 11：重复\n\n这一段足够长，可以成为自动生成的摘要。\n");
  const result = await normalizeDayDocument(source.path);
  await assert.rejects(() => assertNoDuplicateDay(projectRoot, result), /已由 custom\.md 占用/);
});

test("Day 识别不误匹配普通数字", () => {
  assert.equal(inferDay("Day-12.md"), 12);
  assert.equal(inferDay("2026-08-24.md"), undefined);
});
