export interface Node {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  definition?: string;
  example?: string;
  category: ConceptCategory;
  level: number;
  color: string;
  x: number;
  y: number;
  hasCircularLogic?: boolean;
  circularLogicExplanation?: string;
  alternativeNames?: string[];
  translationNotes?: string;
  school?: PsychoanalysisSchool;
  falsifiability?: number;
  logical_coherence?: number;
  userRatings?: {
    falsifiability?: number;
    logical_coherence?: number;
  };
  argumentProcess?: string;
  logicalProblem?: string;
  circularChain?: string[];
  academicSignificance?: string;
}

export interface Link {
  source: string;
  target: string;
  type: LinkType;
  strength: number;
  description?: string;
}

export type ConceptCategory =
  | 'core'
  | 'personality'
  | 'defense'
  | 'therapy'
  | 'phenomena'
  | 'theorist'
  | 'lacan'
  | 'self_psychology'
  | 'object_relations';

export type LinkType = 'relates' | 'influences' | 'contains' | 'treats' | 'manifests';

export type PsychoanalysisSchool =
  | 'freud'
  | 'lacan'
  | 'jung'
  | 'klein'
  | 'kohut'
  | 'winnicott'
  | 'bion'
  | 'fairbairn';

export interface CanvasInteractionState {
  scale: number;
  pan: { x: number; y: number };
  selectedNode: string | null;
  hoveredNode: string | null;
  isDragging: boolean;
}

export interface LearningProgress {
  completedNodes: string[];
  completedPaths: string[];
  userLevel: number;
  userAchievements: string[];
}
