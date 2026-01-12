---
"@moonhou/colors-core": major
---

# v1.0.0 正式发布

## 🚀 主要功能 (Major Features)

- **严格的 Token 架构**: 重构了 `TraditionalColorSystem`，实现了健壮的 3 层 Token 系统 (基础层 -> 语义层 -> 组件层)，确保了对多品牌和多主题的扩展支持。
- **原生 OKLCH 支持**: 全面采用 OKLCH 色彩空间，实现感知均匀的渐变和无障碍色板。
- **色彩和声引擎**: 新增和声生成能力，支持基于色相旋转的互补色、邻近色和三色和声方案。
- **自定义覆盖支持**: `generatePalette` 现在接受可选的 `secondary` 和 `tertiary` 参数，允许人工干预自动生成的色彩方案。

## 💥 破坏性变更 (Breaking Changes)

- **API 重设计**: `generateTokens` 方法的签名和返回类型现已使用 `SystemTokens` 进行严格类型定义。依赖宽松字符串索引的消费者需要更新到新接口。
- **内部可见性**: 内部辅助方法均已调整为私有或重构，以提供更好的封装性。

## 🛠 改进 (Improvements)

- **智能色域映射**: 集成高级色度缩减 (Chroma Reduction) 算法，确保高饱和度 P3 颜色在 sRGB 显示器上平滑降级。
- **APCA 集成**: 内置 APCA 对比度检查，确保文本的可读性符合标准。
- **TypeScript**: 全面支持严格模式 (Strict Mode)，并提供正确生成的类型定义文件。
