import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, GitBranch, Zap } from 'lucide-react';
import { derivationService } from '../../services/derivationService';
import { conceptNodes } from '../../psychoanalysis_data';
import type { DerivationChain, DerivationSource } from '../../types/derivation';
import './DerivationChainViewer.css';

interface DerivationChainViewerProps {
  conceptId: string;
  onClose?: () => void;
}

export function DerivationChainViewer({ conceptId, onClose }: DerivationChainViewerProps) {
  const [chain, setChain] = useState<DerivationChain | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['directSources', 'indirectSources', 'derivationPaths'])
  );

  useEffect(() => {
    const loadChain = async () => {
      setLoading(true);
      const result = await derivationService.getDerivationChain(conceptId);
      setChain(result);
      setLoading(false);
    };
    loadChain();
  }, [conceptId]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isSectionExpanded = (section: string) => expandedSections.has(section);

  if (loading) {
    return (
      <div className="derivation-viewer loading">
        <div className="spinner" />
        <p>加载推导链...</p>
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="derivation-viewer error">
        <p>未找到该概念</p>
      </div>
    );
  }

  return (
    <div className="derivation-viewer">
      {/* 头部 */}
      <div className="derivation-header">
        <div className="concept-info">
          <div className="concept-color" style={{ backgroundColor: chain.color }} />
          <div className="concept-details">
            <h2 className="concept-name">{chain.conceptName}</h2>
            <p className="concept-name-en">{chain.conceptNameEn}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        )}
      </div>

      {/* 直接推导来源 - 移动到最显眼位置 */}
      <section className="derivation-section highlight">
        <button
          className="section-header"
          onClick={() => toggleSection('directSources')}
        >
          {isSectionExpanded('directSources') ? (
            <ChevronDown className="icon" />
          ) : (
            <ChevronRight className="icon" />
          )}
          <GitBranch className="section-icon" />
          <span>直接推导来源 ({chain.directSources.length})</span>
        </button>

        {isSectionExpanded('directSources') && (
          <div className="section-content">
            {chain.directSources.length > 0 ? (
              <div className="sources-list">
                {chain.directSources.map((source) => (
                  <SourceItem key={source.conceptId} source={source} />
                ))}
              </div>
            ) : (
              <p className="empty-message">无直接推导来源</p>
            )}
          </div>
        )}
      </section>

      {/* 间接推导来源 */}
      {chain.indirectSources.length > 0 && (
        <section className="derivation-section">
          <button
            className="section-header"
            onClick={() => toggleSection('indirectSources')}
          >
            {isSectionExpanded('indirectSources') ? (
              <ChevronDown className="icon" />
            ) : (
              <ChevronRight className="icon" />
            )}
            <GitBranch className="section-icon" />
            <span>间接推导来源 ({chain.indirectSources.length})</span>
          </button>

          {isSectionExpanded('indirectSources') && (
            <div className="section-content">
              <div className="sources-list indirect">
                {chain.indirectSources.map((source) => (
                  <SourceItem key={source.conceptId} source={source} indirect />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 推导路径 */}
      {chain.derivationPaths.length > 0 && (
        <section className="derivation-section">
          <button
            className="section-header"
            onClick={() => toggleSection('derivationPaths')}
          >
            {isSectionExpanded('derivationPaths') ? (
              <ChevronDown className="icon" />
            ) : (
              <ChevronRight className="icon" />
            )}
            <Zap className="section-icon" />
            <span>推导路径 ({chain.derivationPaths.length})</span>
          </button>

          {isSectionExpanded('derivationPaths') && (
            <div className="section-content">
              <div className="paths-list">
                {chain.derivationPaths.map((path, index) => (
                  <div key={index} className="path-item">
                    <div className="path-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${Math.round(path.strength * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="strength-value">{Math.round(path.strength * 100)}%</span>
                    </div>
                    <div className="path-description">{path.description}</div>
                    <div className="path-steps">
                      {path.pathNames.map((name, i) => (
                        <div key={i} className="step">
                          <span className="step-name">{name}</span>
                          {i < path.pathNames.length - 1 && <span className="arrow">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 核心假设 - 移动到下方 */}
      {chain.coreAssumption && (
        <div className="core-assumption">
          <h3>核心假设</h3>
          <p>{chain.coreAssumption}</p>
        </div>
      )}

      {/* 推导深度指示 */}
      <div className="derivation-depth">
        <span className="label">推导深度：</span>
        <span className="depth-value">{chain.derivationDepth}</span>
        <span className="depth-bar">
          {Array.from({ length: Math.min(chain.derivationDepth, 5) }).map((_, i) => (
            <div key={i} className="depth-segment" />
          ))}
        </span>
      </div>

      {/* 概念描述 */}
      <div className="concept-description">
        <p>{chain.description}</p>
        {chain.definition && (
          <details className="definition-details">
            <summary>详细定义</summary>
            <p>{chain.definition}</p>
          </details>
        )}
      </div>

      {/* 依赖关系 */}
      {chain.dependencies.length > 0 && (
        <section className="derivation-section">
          <button
            className="section-header"
            onClick={() => toggleSection('dependencies')}
          >
            {isSectionExpanded('dependencies') ? (
              <ChevronDown className="icon" />
            ) : (
              <ChevronRight className="icon" />
            )}
            <GitBranch className="section-icon" />
            <span>所有依赖概念 ({chain.dependencies.length})</span>
          </button>

          {isSectionExpanded('dependencies') && (
            <div className="section-content">
              <div className="dependencies-grid">
                {chain.dependencies.map((depId) => {
                  const depConcept = conceptNodes.find((c) => c.id === depId);
                  return (
                    <div key={depId} className="dependency-item">
                      <div
                        className="dep-color"
                        style={{ backgroundColor: depConcept?.color }}
                      />
                      <span className="dep-name">{depConcept?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

interface SourceItemProps {
  source: DerivationSource;
  indirect?: boolean;
}

function SourceItem({ source, indirect }: SourceItemProps) {
  const concept = conceptNodes.find((c) => c.id === source.conceptId);

  return (
    <div className={`source-item ${indirect ? 'indirect' : ''}`}>
      <div className="source-header">
        <div className="source-info">
          {concept && (
            <div className="source-color" style={{ backgroundColor: concept.color }} />
          )}
          <div className="source-details">
            <div className="source-name">{source.conceptName}</div>
            <div className="source-name-en">{source.conceptNameEn}</div>
          </div>
        </div>
        <div className="relationship-badge">
          <span className="relationship-type">{source.relationshipType}</span>
          <span className="relationship-strength">{Math.round(source.strength * 100)}%</span>
        </div>
      </div>
      <div className="source-description">{source.relationshipDescription}</div>
    </div>
  );
}

export default DerivationChainViewer;
