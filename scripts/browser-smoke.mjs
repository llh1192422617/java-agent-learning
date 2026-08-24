#!/usr/bin/env node
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:4321";
const browserCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].filter(Boolean);

let executablePath;
for (const candidate of browserCandidates) {
  try {
    await access(candidate);
    executablePath = candidate;
    break;
  } catch {
    // 尝试下一个浏览器位置。
  }
}
if (!executablePath) throw new Error("找不到 Chrome/Chromium；可通过 CHROME_PATH 指定浏览器路径");

const browser = await chromium.launch({ executablePath, headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  let response = await desktop.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200);
  await assert.doesNotReject(() => desktop.getByRole("heading", { name: /Java 全栈与 Agent 应用/ }).waitFor());
  await assert.doesNotReject(() => desktop.getByRole("link", { name: /阅读 Day 1/ }).waitFor());

  response = await desktop.goto(`${baseUrl}/days/day-01/`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200);
  assert.equal(await desktop.locator(".lesson-sidebar").isVisible(), true);
  assert.ok(await desktop.locator(".lesson-sidebar .toc a").count() > 20, "Day1 桌面目录应包含完整章节");
  assert.equal(await desktop.locator('script[src*="cdn.jsdelivr.net"]').count(), 0, "生产页面不应依赖运行时 CDN");

  const searchResult = await desktop.evaluate(async () => {
    const pagefind = await import("/pagefind/pagefind.js");
    const terms = ["JVM", "hashCode"];
    return Object.fromEntries(await Promise.all(terms.map(async (term) => {
      const response = await pagefind.search(term);
      const first = response.results[0] ? await response.results[0].data() : null;
      return [term, { count: response.results.length, url: first?.url }];
    })));
  });
  assert.ok(searchResult.JVM.count > 0 && searchResult.JVM.url.includes("/days/day-01/"));
  assert.ok(searchResult.hashCode.count > 0 && searchResult.hashCode.url.includes("/days/day-01/"));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(`${baseUrl}/days/day-01/`, { waitUntil: "networkidle" });
  assert.equal(await mobile.locator(".lesson-sidebar").isVisible(), false);
  assert.equal(await mobile.locator(".mobile-toc").isVisible(), true);
  const dimensions = await mobile.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }));
  assert.ok(dimensions.page <= dimensions.viewport, `移动页面出现横向溢出：${dimensions.page}px > ${dimensions.viewport}px`);

  response = await desktop.goto(`${baseUrl}/missing-page/`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 404);
  await assert.doesNotReject(() => desktop.getByRole("heading", { name: "这篇学习笔记还不存在" }).waitFor());

  console.log(JSON.stringify({
    status: "passed",
    routes: ["/", "/days/day-01/", "/search/", "/missing-page/"],
    search: searchResult,
    mobile: dimensions,
  }, null, 2));
} finally {
  await browser.close();
}
