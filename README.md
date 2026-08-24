# Java 全栈与 Agent 学习站

一个由 Markdown 驱动的静态学习门户。每天的学习笔记会生成独立页面、目录、前后导航和中文全文搜索，并由 GitHub 推送自动部署到 Vercel。

## 本地开发

要求 Node.js 20.19.1 或更高版本。

```bash
npm install
npm run dev
```

完整验收：

```bash
npm test
npm run build
npm run preview
```

`npm run build` 会依次进行 Astro 类型检查、静态页面构建和 Pagefind 中文搜索索引生成。
本机启动预览后，还可以运行 `npm run test:browser` 检查真实页面、移动端布局和搜索结果。

## 每日发布

源 Markdown 可以位于 Obsidian 仓库或其他目录，不需要手工复制：

```bash
npm run publish:day -- "/绝对路径/Day2.md"
```

发布命令会校验并复制内容与图片、运行测试和构建、只提交本次文档，然后推送 `main`。Vercel 收到推送后自动部署。

更新已经发布的某一天必须显式确认：

```bash
npm run publish:day -- "/绝对路径/Day2.md" --replace
```

### 推荐的 Markdown 头信息

```yaml
---
day: 2
title: Java 类、接口与分层
date: 2026-08-25
summary: 使用接口和组合建立清晰的业务边界。
tags:
  - Java
  - 面向对象
status: completed
duration: 90 分钟
---
```

- `status` 只能是 `planned`、`in-progress`、`completed`。
- 没有 frontmatter 时，会从文件名和一级标题推断 Day、标题和摘要。
- 支持标准 Markdown 图片和 `![[image.png|说明]]` 形式的 Obsidian 图片。
- `[[Day 1|第一天]]` 会转换为站内链接；无法识别的 Obsidian 链接会阻止发布。
- 默认禁止覆盖已有 Day，避免误操作。
- 发布前必须保持 Git 工作区干净，避免把无关修改带入自动提交。

## 内容结构

```text
src/content/days/       已发布 Markdown
public/content-assets/  按 Day 隔离的图片
src/pages/              首页、学习页、搜索页
scripts/                导入和发布工具
tests/                  发布链路测试
```

内容源仍是原始 Obsidian 文档；网站目录只保存经过校验、适合公开分享的副本。
