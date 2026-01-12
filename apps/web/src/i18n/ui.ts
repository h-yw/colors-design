export const languages = {
    zh: '简体中文',
    en: 'English',
  };
  
  export const defaultLang = 'zh';
  
  export const ui = {
    zh: {
      'hero.badge': 'Designed for Engineering',
      'hero.title.l1': '科学的',
      'hero.title.highlight': '中国传统色',
      'hero.title.l2': '设计系统',
      'hero.subtitle.p1': '基于 OKLCH 感知均匀色彩空间，构建具有数学和谐美感的 3 层 Token 架构。',
      'hero.subtitle.p2': '让设计系统像代码一样逻辑严密，像艺术一样优雅动人。',
      'cta.verify': '开始验证 (Start Verifying) 🚀',
      'cta.principles': '📚 原理讲解 (Principles)',
      'feature.oklch.title': 'OKLCH 感知均匀',
      'feature.oklch.desc': '告别 HSL/RGB 的亮度跳变。无论色相如何变化，L50 永远是同样的感知亮度，确保视觉层级在更换主题色后依然稳固。',
      'feature.arch.title': '3层 Token 架构',
      'feature.arch.desc': 'Primitives (基础) -> Semantic (语义) -> Component (组件)。解耦的设计让系统具备极高的扩展性和维护性。',
      'feature.contrast.title': '智能对比度 (AA/AAA)',
      'feature.contrast.desc': '内置 WCAG 2.1 对比度算法。文字颜色 (On-Color) 根据背景深浅自动切换，永远确保可读性。',
      'feature.gamut.title': '高级色域映射',
      'feature.gamut.desc': 'Chroma Reduction 算法保证高饱和度颜色在 sRGB 屏幕上的准确呈现，拒绝色相偏移。',
    },
    en: {
      'hero.badge': 'Designed for Engineering',
      'hero.title.l1': 'Scientific',
      'hero.title.highlight': 'Traditional Colors',
      'hero.title.l2': 'Design System',
      'hero.subtitle.p1': 'Built on OKLCH perceptually uniform color space, constructing a 3-layer Token architecture with mathematical harmony.',
      'hero.subtitle.p2': 'Make the design system as logical as code and as elegant as art.',
      'cta.verify': 'Start Verifying 🚀',
      'cta.principles': '📚 Principles',
      'feature.oklch.title': 'OKLCH Uniformity',
      'feature.oklch.desc': 'Say goodbye to HSL/RGB lightness jumps. L50 is always L50, ensuring consistent visual hierarchy across themes.',
      'feature.arch.title': '3-Layer Architecture',
      'feature.arch.desc': 'Primitives -> Semantics -> Component. Decoupled design for maximum scalability.',
      'feature.contrast.title': 'Smart Contrast (AA/AAA)',
      'feature.contrast.desc': 'Built-in WCAG 2.1 algorithm. Text color adapts automatically to background lightness.',
      'feature.gamut.title': 'Advanced Gamut Mapping',
      'feature.gamut.desc': 'Chroma Reduction ensures accurate rendering of high-saturation colors on sRGB screens.',
    },
  } as const;
