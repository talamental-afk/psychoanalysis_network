import PsychoanalysisNetwork from '@/components/PsychoanalysisNetwork';

/**
 * 精神分析概念网络图主页面
 * 设计风格：深邃学术风格
 * - 深蓝黑色背景象征潜意识的深度
 * - 金色和紫色节点营造优雅的学术氛围
 * - 交互式网络图展现精神分析理论的复杂关系
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 头部 */}
      <header className="bg-card/50 border-b border-border backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">精神分析概念网络图</h1>
              <p className="text-muted-foreground">
                探索弗洛伊德和拉康精神分析理论的核心概念及其相互关联
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 bg-gradient-to-br from-background via-background to-card/20">
          <PsychoanalysisNetwork />
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="bg-card/50 border-t border-border backdrop-blur-sm">
        <div className="container py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">关于此网络图</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                这个交互式网络图展示了精神分析理论中的关键概念，包括弗洛伊德的人格结构理论、防御机制、治疗方法等。
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">如何使用</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                将鼠标悬停在节点上查看概念名称，点击节点查看详细描述。节点之间的连线表示理论上的关联关系。
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">色彩说明</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                不同颜色的节点代表不同类别的概念：金色表示核心概念，紫色表示人格结构，绿色表示治疗方法。
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>© 2026 精神分析概念网络图 | 基于弗洛伊德和拉康的理论</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
