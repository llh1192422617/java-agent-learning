#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { normalizeDayDocument, writeDayDocument } from "./lib/import-day.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const replaceExisting = args.includes("--replace");
const sourceArg = args.find((arg) => !arg.startsWith("--"));

if (!sourceArg) {
  console.error('用法：npm run publish:day -- "/绝对路径/Day2.md" [--replace]');
  process.exit(1);
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, { cwd: projectRoot, stdio: "inherit", ...options });
  if (result.status !== 0) throw new Error(`${command} ${commandArgs.join(" ")} 执行失败`);
}

function git(...gitArgs) {
  return execFileSync("git", gitArgs, { cwd: projectRoot, encoding: "utf8" }).trim();
}

async function pathExists(path) {
  return stat(path).then(() => true, () => false);
}

async function main() {
  try {
    if (git("rev-parse", "--show-toplevel") !== projectRoot) throw new Error("当前目录不是独立的 learning-portal Git 仓库");
    if (git("status", "--porcelain")) throw new Error("Git 工作区存在未提交修改，请先处理后再发布，避免混入无关内容");

    const result = await normalizeDayDocument(sourceArg);
    const targetContent = join(projectRoot, "src/content/days", `${result.slug}.md`);
    const targetAssets = join(projectRoot, "public/content-assets", result.slug);
    const backupRoot = await mkdtemp(join(tmpdir(), `${result.slug}-backup-`));
    const hadContent = await pathExists(targetContent);
    const hadAssets = await pathExists(targetAssets);
    if (hadContent) await writeFile(join(backupRoot, "content.md"), await readFile(targetContent));
    if (hadAssets) await cp(targetAssets, join(backupRoot, "assets"), { recursive: true });

    const restore = async () => {
      await rm(targetContent, { force: true });
      await rm(targetAssets, { recursive: true, force: true });
      if (hadContent) await cp(join(backupRoot, "content.md"), targetContent);
      if (hadAssets) await cp(join(backupRoot, "assets"), targetAssets, { recursive: true });
    };

    try {
      await writeDayDocument(projectRoot, result, { replaceExisting });
      run("npm", ["test"]);
      run("npm", ["run", "build"]);
    } catch (error) {
      await restore();
      throw error;
    } finally {
      await rm(backupRoot, { recursive: true, force: true });
    }

    const relativeContent = `src/content/days/${result.slug}.md`;
    const relativeAssets = `public/content-assets/${result.slug}`;
    run("git", ["add", "-A", "--", relativeContent, relativeAssets]);
    run("git", ["commit", "-m", `content: publish Day ${result.day}`]);

    try {
      run("git", ["push", "origin", "main"]);
      console.log(`\n✅ Day ${result.day} 已发布：${result.metadata.title}`);
    } catch {
      console.error("\n⚠️ 内容已在本地提交，但推送失败。网络恢复后运行：git push origin main");
      process.exitCode = 2;
    }
  } catch (error) {
    console.error(`\n❌ 发布失败：${error.message}`);
    process.exitCode = 1;
  }
}

await main();
