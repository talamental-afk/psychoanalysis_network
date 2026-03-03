import { useNetworkStore } from '../../../store/networkStore';
import { useSidebarStore } from '../../../store/sidebarStore';
import { DerivationChainViewer } from '../../DerivationChain';
import { ChevronLeft } from 'lucide-react';
import './SidebarContainer.css';

export function SidebarContainer() {
  const { selectedNode } = useNetworkStore();
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen } = useSidebarStore();

  if (!selectedNode) {
    return (
      <div className="sidebar-empty">
        <p>选择一个概念来查看详情</p>
      </div>
    );
  }

  return (
    <div className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}>
      {/* 展开/收起按钮 */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? '收起' : '展开'}
      >
        <ChevronLeft className={`toggle-icon ${!sidebarOpen ? 'rotated' : ''}`} />
      </button>

      {sidebarOpen && (
        <div className="sidebar-content">
          {/* 标签页导航 */}
          <div className="sidebar-tabs">
            <button
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              详情
            </button>
            <button
              className={`tab-button ${activeTab === 'derivation' ? 'active' : ''}`}
              onClick={() => setActiveTab('derivation')}
            >
              推导链
            </button>
            <button
              className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              成就
            </button>
          </div>

          {/* 标签页内容 */}
          <div className="sidebar-tab-content">
            {activeTab === 'details' && (
              <div className="tab-pane details-pane">
                <div className="concept-detail-card">
                  <div className="concept-header">
                    <div className="concept-title-group">
                      <h2 className="concept-title">{conceptNodes.find(n => n.id === selectedNode)?.name}</h2>
                      <p className="concept-subtitle">{conceptNodes.find(n => n.id === selectedNode)?.nameEn}</p>
                    </div>
                    <div 
                      className="concept-badge" 
                      style={{ backgroundColor: conceptNodes.find(n => n.id === selectedNode)?.color }}
                    >
                      {conceptNodes.find(n => n.id === selectedNode)?.category}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3>描述</h3>
                    <p className="detail-text">{conceptNodes.find(n => n.id === selectedNode)?.description}</p>
                  </div>
                  
                  {conceptNodes.find(n => n.id === selectedNode)?.definition && (
                    <div className="detail-section">
                      <h3>定义</h3>
                      <p className="detail-text">{conceptNodes.find(n => n.id === selectedNode)?.definition}</p>
                    </div>
                  )}
                  
                  {conceptNodes.find(n => n.id === selectedNode)?.example && (
                    <div className="detail-section example-section">
                      <h3>示例</h3>
                      <p className="detail-text italic">{conceptNodes.find(n => n.id === selectedNode)?.example}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'derivation' && (
              <div className="tab-pane derivation-pane">
                <DerivationChainViewer conceptId={selectedNode} />
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="tab-pane achievements-pane">
                <p>成就内容将在这里显示</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SidebarContainer;
