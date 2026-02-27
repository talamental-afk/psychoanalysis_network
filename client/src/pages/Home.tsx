import PsychoanalysisNetwork from '@/components/PsychoanalysisNetwork';

/**
 * 精神分析概念网络图主页面
 * 设计风格：深邃学术风格
 * - 深蓝黑色背景象征潜意识的深度
 * - 金色和紫色节点营造优雅的学术氛围
 * - 交互式网络图展现精神分析理论的复杂关系
 * - 最大化网络图显示空间
 */
export default function Home() {
  return (
    <div className="w-screen h-screen bg-background flex flex-col">
      {/* 最小化头部 */}
      <header className="bg-card/30 border-b border-border backdrop-blur-sm py-1 px-3 shrink-0">
        <h1 className="text-lg font-bold text-foreground">批判式概览学习精神分析</h1>
      </header>

      {/* 主要内容 - 最大化网络图空间 */}
      <main className="flex-1 overflow-hidden">
        <PsychoanalysisNetwork />
      </main>

      {/* 最小化底部版权 */}
      <footer className="bg-card/30 border-t border-border backdrop-blur-sm py-1 px-3 text-xs text-muted-foreground text-right shrink-0">
        <p>© 2026</p>
      </footer>
    </div>
  );
}
