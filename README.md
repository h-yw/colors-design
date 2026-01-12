# Colors Design System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![OKLCH](https://img.shields.io/badge/Color_Space-OKLCH-green.svg)](https://oklch.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Colors** 是一个基于 **OKLCH** 感知均匀色彩空间的现代设计系统工具。它通过 **3 层 Token 架构**（Primitives -> Semantic -> Component）实现科学、严谨且优雅的色彩管理，内置 WCAG 2.1 对比度检查与高级色域映射算法。

## ✨ 核心特性

- **🎨 感知均匀 (Perceptual Uniformity)**
  基于 OKLCH 色彩空间，解决 HSL/RGB 中亮度感知不一致的问题。无论色相如何变化，L50 永远是同样的感知亮度。

- **🏗️ 3 层 Token 架构**
  解耦的基础层 (Primitives)、语义层 (Semantic) 和组件层 (Component)，支持多品牌（Brand）和多模式（Light/Dark）的无缝切换。

- **♿️ 智能无障碍 (Accessibility)**
  内置 APCA 和 WCAG 2.1 对比度算法，自动计算最佳文本颜色 (On-Color)，确保所有配色符合 AA/AAA 标准。

- **🌈 高级色域映射 (Gamut Mapping)**
  采用 Chroma Reduction 算法，确保高饱和度 P3 广色域颜色在 sRGB 屏幕上准确降级，避免色相偏移。

- **🎼 色彩和声 (Color Harmony)**
  支持互补色、邻近色、三色等和声生成，并可一键应用为系统的辅助色或强调色。

## 📦 项目结构

本项目采用 Monorepo 架构：

- **`packages/core`**: 核心算法库。包含 OKLCH 转换、Token 生成、Gamut Mapping、Figma/HarmonyOS 映射逻辑。零依赖（除 math/color 库），适用于 Node.js 和 Browser。
- **`apps/web`**: 可视化工作台。基于 Astro + React + Zustand 构建，提供主题编辑器、对比度验证器、和声探索器和多格式导出功能。

## 🚀 快速开始

### 安装依赖

本项目使用 [pnpm](https://pnpm.io/) 管理依赖。

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
# 访问 http://localhost:9527
```

### 构建项目

```bash
pnpm build
```

### 运行测试

```bash
# 运行 Core 单元测试
pnpm --filter @moonhou/colors-core test

# 运行 Web 端对端测试
pnpm --filter @moonhou/colors-web test:e2e
```

## 🛠️ 技术栈

- **Core**: TypeScript, Culori, APCA-W3
- **Web**: Astro, React 19, Zustand, Playwright
- **Tools**: Vite, Vitest, Husky, Lint-Staged

## 📄 导出支持

目前支持导出 Token 为以下格式：
- CSS Variables
- JSON (Design Tokens format)
- Figma (Plugin compatible JSON)
- HarmonyOS (resources/base/element/color.json)
- Tailwind CSS Config

---
Designed with ❤️ by [Your Name/Team]
