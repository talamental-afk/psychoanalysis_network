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
    <div className="min-h-screen bg-background flex flex-col">
      {/* 紧凑头部 */}
      <header className="bg-card/50 border-b border-border backdrop-blur-sm py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">精神分析概念网络图</h1>
            <p className="text-xs text-muted-foreground mt-1">
              探索弗洛伊德和拉康精神分析理论的核心概念及其相互关联
            </p>
          </div>
        </div>
      </header>

      {/* 主要内容 - 最大化网络图空间 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 bg-gradient-to-br from-background via-background to-card/20 overflow-hidden">
          <PsychoanalysisNetwork />
        </div>
      </main>

      {/* 最小化底部版权 */}
      <footer className="bg-card/50 border-t border-border backdrop-blur-sm py-2 px-4 text-xs text-muted-foreground text-right">
        <p>© 2026 精神分析概念网络图</p>
      </footer>
    </div>
  );
}
