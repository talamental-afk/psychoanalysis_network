// 精神分析概念网络数据结构
export interface ConceptNode {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: 'core' | 'personality' | 'defense' | 'therapy' | 'phenomena' | 'theorist';
  level: number; // 0: 中心, 1: 第一层, 2: 第二层, 3: 第三层
  color: string;
  icon?: string;
}

export interface ConceptLink {
  source: string;
  target: string;
  type: 'relates' | 'influences' | 'contains' | 'treats' | 'manifests';
  strength: number; // 0-1
}

export const conceptNodes: ConceptNode[] = [
  // 核心概念 - 中心
  {
    id: 'unconscious',
    name: '无意识',
    nameEn: 'Unconscious',
    description: '精神分析的基础。包含被压抑的思想、欲望和记忆，对行为有强大影响。',
    category: 'core',
    level: 0,
    color: '#D97706',
  },

  // 第一层：人格结构
  {
    id: 'id',
    name: '本我',
    nameEn: 'Id',
    description: '最原始、最基本的人格部分。遵循享乐原则，追求即时满足。',
    category: 'personality',
    level: 1,
    color: '#F59E0B',
  },
  {
    id: 'ego',
    name: '自我',
    nameEn: 'Ego',
    description: '人格的理性部分。处理现实世界，平衡本我和超我的冲突。',
    category: 'personality',
    level: 1,
    color: '#A78BFA',
  },
  {
    id: 'superego',
    name: '超我',
    nameEn: 'Superego',
    description: '道德和良知的代表。内化社会规范和父母的期望。',
    category: 'personality',
    level: 1,
    color: '#60A5FA',
  },

  // 第二层：防御机制
  {
    id: 'repression',
    name: '压抑',
    nameEn: 'Repression',
    description: '将不可接受的想法、欲望或记忆推入无意识。',
    category: 'defense',
    level: 2,
    color: '#A78BFA',
  },
  {
    id: 'denial',
    name: '否认',
    nameEn: 'Denial',
    description: '拒绝承认令人不安的现实或真相。',
    category: 'defense',
    level: 2,
    color: '#A78BFA',
  },
  {
    id: 'projection',
    name: '投射',
    nameEn: 'Projection',
    description: '将自己的不可接受特质归咎于他人。',
    category: 'defense',
    level: 2,
    color: '#A78BFA',
  },
  {
    id: 'sublimation',
    name: '升华',
    nameEn: 'Sublimation',
    description: '将本能冲动转化为社会可接受的活动。',
    category: 'defense',
    level: 2,
    color: '#A78BFA',
  },

  // 第二层：治疗方法
  {
    id: 'free_association',
    name: '自由联想',
    nameEn: 'Free Association',
    description: '分析者说出想到的任何事情，揭示无意识内容。',
    category: 'therapy',
    level: 2,
    color: '#34D399',
  },
  {
    id: 'dream_analysis',
    name: '梦的解析',
    nameEn: 'Dream Analysis',
    description: '通过解释梦来了解无意识的欲望和冲突。',
    category: 'therapy',
    level: 2,
    color: '#34D399',
  },
  {
    id: 'transference',
    name: '转移',
    nameEn: 'Transference',
    description: '分析者将对他人的感情投射到分析师身上。',
    category: 'therapy',
    level: 2,
    color: '#34D399',
  },
  {
    id: 'interpretation',
    name: '解释',
    nameEn: 'Interpretation',
    description: '分析师帮助分析者理解无意识的意义。',
    category: 'therapy',
    level: 2,
    color: '#34D399',
  },

  // 第二层：心理现象
  {
    id: 'psychic_determinism',
    name: '精神决定论',
    nameEn: 'Psychic Determinism',
    description: '所有心理过程都不是自发的，而是受无意识决定。',
    category: 'phenomena',
    level: 2,
    color: '#F472B6',
  },
  {
    id: 'oedipus_complex',
    name: '俄狄浦斯情结',
    nameEn: 'Oedipus Complex',
    description: '幼儿对异性父母的欲望和对同性父母的竞争。',
    category: 'phenomena',
    level: 2,
    color: '#F472B6',
  },
  {
    id: 'defense_mechanisms',
    name: '防御机制',
    nameEn: 'Defense Mechanisms',
    description: '自我用来应对焦虑和冲突的无意识策略。',
    category: 'phenomena',
    level: 2,
    color: '#F472B6',
  },
  {
    id: 'resistance',
    name: '抵抗',
    nameEn: 'Resistance',
    description: '分析者无意识地抵抗分析过程，保护无意识内容。',
    category: 'phenomena',
    level: 2,
    color: '#F472B6',
  },

  // 第三层：具体概念
  {
    id: 'libido',
    name: '力比多',
    nameEn: 'Libido',
    description: '心理能量或性欲驱力，驱动人类行为。',
    category: 'phenomena',
    level: 3,
    color: '#FCA5A5',
  },
  {
    id: 'infantile_sexuality',
    name: '幼儿性欲',
    nameEn: 'Infantile Sexuality',
    description: '弗洛伊德认为儿童具有性欲，经历不同的发展阶段。',
    category: 'phenomena',
    level: 3,
    color: '#FCA5A5',
  },
  {
    id: 'pleasure_principle',
    name: '享乐原则',
    nameEn: 'Pleasure Principle',
    description: '本我遵循的原则，追求快乐和避免痛苦。',
    category: 'phenomena',
    level: 3,
    color: '#FCA5A5',
  },
  {
    id: 'reality_principle',
    name: '现实原则',
    nameEn: 'Reality Principle',
    description: '自我遵循的原则，考虑现实的限制和后果。',
    category: 'phenomena',
    level: 3,
    color: '#FCA5A5',
  },
  {
    id: 'moral_principle',
    name: '道德原则',
    nameEn: 'Moral Principle',
    description: '超我遵循的原则，基于道德和社会规范。',
    category: 'phenomena',
    level: 3,
    color: '#FCA5A5',
  },
  {
    id: 'condensation',
    name: '凝缩',
    nameEn: 'Condensation',
    description: '梦的工作机制，多个观念融合为一个梦的元素。',
    category: 'phenomena',
    level: 3,
    color: '#FCA5A5',
  },
  {
    id: 'displacement',
    name: '移置',
    nameEn: 'Displacement',
    description: '梦的工作机制，情感从一个对象转移到另一个。',
    category: 'phenomena',
    level: 3,
    color: '#FCA5A5',
  },
  {
    id: 'screen_memory',
    name: '屏记忆',
    nameEn: 'Screen Memory',
    description: '既阻挡又扭曲呈现记忆的无意识防御机制。',
    category: 'phenomena',
    level: 3,
    color: '#FCA5A5',
  },

  // 理论家
  {
    id: 'freud',
    name: '西格蒙德·弗洛伊德',
    nameEn: 'Sigmund Freud',
    description: '精神分析的创始人，奠基人。',
    category: 'theorist',
    level: 2,
    color: '#FBBF24',
  },
  {
    id: 'jung',
    name: '卡尔·荣格',
    nameEn: 'Carl Jung',
    description: '弗洛伊德的弟子，发展了分析心理学。',
    category: 'theorist',
    level: 2,
    color: '#FBBF24',
  },
  {
    id: 'lacan',
    name: '雅各·拉康',
    nameEn: 'Jacques Lacan',
    description: '后继理论家，重新解释精神分析理论。',
    category: 'theorist',
    level: 2,
    color: '#FBBF24',
  },
];

export const conceptLinks: ConceptLink[] = [
  // 无意识与人格结构
  { source: 'unconscious', target: 'id', type: 'contains', strength: 1 },
  { source: 'unconscious', target: 'ego', type: 'influences', strength: 0.8 },
  { source: 'unconscious', target: 'superego', type: 'influences', strength: 0.7 },

  // 人格结构之间
  { source: 'id', target: 'ego', type: 'relates', strength: 0.9 },
  { source: 'ego', target: 'superego', type: 'relates', strength: 0.9 },
  { source: 'id', target: 'superego', type: 'relates', strength: 0.7 },

  // 无意识与防御机制
  { source: 'unconscious', target: 'repression', type: 'manifests', strength: 1 },
  { source: 'unconscious', target: 'denial', type: 'manifests', strength: 0.9 },
  { source: 'unconscious', target: 'projection', type: 'manifests', strength: 0.8 },
  { source: 'unconscious', target: 'sublimation', type: 'manifests', strength: 0.8 },

  // 自我与防御机制
  { source: 'ego', target: 'repression', type: 'relates', strength: 0.9 },
  { source: 'ego', target: 'defense_mechanisms', type: 'contains', strength: 1 },

  // 无意识与治疗方法
  { source: 'unconscious', target: 'free_association', type: 'treats', strength: 1 },
  { source: 'unconscious', target: 'dream_analysis', type: 'treats', strength: 1 },
  { source: 'unconscious', target: 'transference', type: 'treats', strength: 0.9 },

  // 治疗方法之间
  { source: 'free_association', target: 'interpretation', type: 'relates', strength: 0.9 },
  { source: 'dream_analysis', target: 'interpretation', type: 'relates', strength: 0.9 },
  { source: 'transference', target: 'interpretation', type: 'relates', strength: 0.8 },

  // 心理现象
  { source: 'unconscious', target: 'psychic_determinism', type: 'manifests', strength: 1 },
  { source: 'unconscious', target: 'oedipus_complex', type: 'manifests', strength: 0.9 },
  { source: 'unconscious', target: 'resistance', type: 'manifests', strength: 0.9 },

  // 具体概念与抽象概念
  { source: 'id', target: 'libido', type: 'relates', strength: 0.9 },
  { source: 'id', target: 'pleasure_principle', type: 'relates', strength: 1 },
  { source: 'ego', target: 'reality_principle', type: 'relates', strength: 1 },
  { source: 'superego', target: 'moral_principle', type: 'relates', strength: 1 },

  // 梦的工作机制
  { source: 'dream_analysis', target: 'condensation', type: 'relates', strength: 0.9 },
  { source: 'dream_analysis', target: 'displacement', type: 'relates', strength: 0.9 },

  // 屏记忆
  { source: 'unconscious', target: 'screen_memory', type: 'manifests', strength: 0.8 },

  // 理论家与概念
  { source: 'freud', target: 'unconscious', type: 'relates', strength: 1 },
  { source: 'freud', target: 'id', type: 'relates', strength: 1 },
  { source: 'freud', target: 'oedipus_complex', type: 'relates', strength: 0.9 },
  { source: 'jung', target: 'unconscious', type: 'relates', strength: 0.8 },
  { source: 'lacan', target: 'unconscious', type: 'relates', strength: 0.8 },
];

export const categoryColors = {
  core: '#D97706',
  personality: '#A78BFA',
  defense: '#A78BFA',
  therapy: '#34D399',
  phenomena: '#F472B6',
  theorist: '#FBBF24',
};

export const categoryLabels = {
  core: '核心概念',
  personality: '人格结构',
  defense: '防御机制',
  therapy: '治疗方法',
  phenomena: '心理现象',
  theorist: '理论家',
};
