export interface Reference {
  id: string;
  title: string;
  author?: string;
  year?: number;
  url?: string;
  type: 'book' | 'paper' | 'website' | 'article';
  doubanUrl?: string; // 豆瓣读书链接
  scholarUrl?: string; // 谷歌学术链接
}

export interface ConceptNode {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  definition?: string; // 详细定义
  example?: string; // 案例说明
  references?: string[]; // 参考文献 ID列表
  category: 'core' | 'personality' | 'defense' | 'therapy' | 'phenomena' | 'theorist' | 'lacan' | 'self_psychology' | 'object_relations';
  level: number; // 0: 中心, 1: 第一层, 2: 第二层, 3: 第三层
  color: string;
  icon?: string;
  avatar?: string; // 头像 URL
  hasCircularLogic?: boolean; // 是否涉及循环论证
  circularLogicExplanation?: string; // 循环论证的解释
  alternativeNames?: string[]; // 替代翻译或别名
  translationNotes?: string; // 翻译注记
  school?: 'freud' | 'lacan' | 'jung' | 'klein' | 'kohut' | 'winnicott' | 'bion' | 'fairbairn'; // 所属学派
  falsifiability?: number; // 可证伪性评分（1-5，5表示最容易被证伪）
  logical_coherence?: number; // 逻辑自洽性评分（1-5，5表示最自洽）
  userRatings?: {
    falsifiability?: number; // 用户对可证伪性的评分
    logical_coherence?: number; // 用户对逻辑自洽性的评分
  };
  coreAssumption?: string; // 核心假设
  schoolPerspectives?: {
    [school: string]: string; // 学派对该概念的见解
  };
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
    nameEn: 'The Unconscious',
    description: '精神分析的基础。包含被压抑的思想、欲望和记忆，对行为有强大影响。',
    definition: '无意识是指个体不能直接认识到的心理过程和内容，包括被压抑的欲望、冲突和创伤记忆。它对个体的行为、情感和思维方式产生深远影响，但个体通常无法意识到这些影响的来源。',
    example: '一个人可能无法解释自己对某种特定情况的强烈恐惧反应，这种恐惧可能源于童年的创伤记忆，已被压入无意识中。',
    category: 'core',
    level: 1,
    color: '#D97706',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：无意识通过压抱来隐藏不可接受的内容，而压抱本身又是由无意识执行的。我们知道无意识存在是因为有压抱现象，但压抱现象的存在本身又被用来证明无意识的存在，形成循环论证。',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '心理生活的大部分发生在意识之外，无意识内容通过各种方式影响行为和思维。',
    school: 'freud',
    schoolPerspectives: {
      'freud': '弗洛伊德认为无意识是心理生活的基础，包含被压抑的欲望和冲动，通过梦、言语错误等方式表现。',
      'lacan': '拉康强调无意识是语言结构化的，"无意识如同语言一样被结构化"，强调符号秩序的作用。',
      'jung': '荣格认为无意识包含个人无意识和集体无意识两个层面，集体无意识包含人类共同的原型。',
      'klein': '克莱因强调无意识的早期幻想生活，特别是婴幼儿期的内部客体关系。',
      'winnicott': '温尼科特强调无意识与真实自体的关系，无意识中包含创意和生活力。',
      'bion': '比昂认为无意识包含无法思考的β元素，需要通过α功能转化为可思考的内容。'
    }
  },

  // 第一层：人格结构
  {
    id: 'id',
    name: '本我',
    nameEn: 'Id',
    description: '最原始、最基本的人格部分。遵循享乐原则，追求即时满足。',
    definition: '本我是人格中最原始的部分，完全无意识，遵循享乐原则。它追求即时的满足，不考虑现实或道德约束，是所有本能冲动和欲望的源头。',
    example: '婴儿饿了就哭闹要求喂食，这就是本我的直接表现——无条件地追求满足生理需求。',
    category: 'personality',
    level: 1,
    color: '#F59E0B',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '人类最原始的部分由本能冲动组成，这些冲动不受理性或道德约束。',
    school: 'freud',
  },
  {
    id: 'ego',
    name: '自我',
    nameEn: 'Ego',
    description: '人格的理性部分。处理现实世界，平衡本我和超我的冲突。',
    definition: '自我是人格中的理性部分，部分意识，部分无意识。它遵循现实原则，与现实世界互动，并调解本我的冲动与超我的道德要求之间的冲突。',
    example: '一个人感到饥饿（本我），但意识到现在不是吃饭的时间，所以等待午餐时间再吃（自我的理性决定）。',
    category: 'personality',
    level: 1,
    color: '#A78BFA',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '理性的自我能够调解本我的冲动与超我的道德要求，实现适应性行为。',
    school: 'freud',
  },
  {
    id: 'superego',
    name: '超我',
    nameEn: 'Superego',
    description: '道德和良知的代表。内化社会规范和父母的期望。',
    definition: '超我代表道德和理想，是个体内化的社会规范、父母的价值观和道德标准。它通过内疚感和羞愧感来约束本我的冲动，追求完美和道德的行为。',
    example: '一个人想要说谎来逃避责任，但超我产生的内疚感使其最终选择诚实面对。',
    category: 'personality',
    level: 1,
    color: '#60A5FA',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '道德良知是通过内化父母和社会价值观而形成的，驱动我们追求理想和道德。',
    school: 'freud',
  },

  // 第二层：防御机制
  {
    id: 'repression',
    schoolPerspectives: {
          "freud": "弗洛伊德认为压抑是最重要的防御机制，将不可接受的欲望和思想推入无意识。",
          "lacan": "拉康认为压抑涉及符号秩序中的排斥，与象征性阉割相关。",
          "jung": "荣格强调压抑会导致心理能量的积累，最终可能引发神经症症状。",
          "klein": "克莱因认为压抑是对抗焦虑的防御方式，与偏执-分裂位置相关。",
          "winnicott": "温尼科特强调压抑与虚假自体的形成相关，压抑真实自体的表达。"
    },
    name: '压抑',
    nameEn: 'Repression',
    description: '将不可接受的想法、欲望或记忆推入无意识。',
    definition: '压抑是最基本的防御机制，指将不可接受的思想、欲望、记忆或冲动从意识中排除，推入无意识。压抑是无意识的过程，个体通常不知道自己在压抑什么。',
    example: '一个人在童年遭受过虐待，但成年后完全不记得这些事件，因为这些记忆被压抑了。',
    category: 'defense',
    level: 2,
    color: '#EF4444',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：压抑是将不可接受的内容推入无意识，但我们知道某些内容被压抑是因为它们在无意识中。我们通过症状、梦或言语错误来推断压抑的存在，但这些症状本身又被解释为压抑的证据，形成循环。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '不可接受的思想和欲望被无意识地排除出意识，但仍然对行为产生影响。',
    school: 'freud',
  },
  {
    id: 'denial',
    name: '否认',
    nameEn: 'Denial',
    description: '拒绝承认现实中令人不快的事实或现象。',
    definition: '否认是一种防御机制，指个体拒绝承认或接受现实中令人不快、令人焦虑或威胁的事实。个体可能会说"这不是真的"或"这不会发生在我身上"。',
    example: '一个被诊断出患有严重疾病的人坚持说医生弄错了，拒绝接受诊断结果。',
    category: 'defense',
    level: 2,
    color: '#EF4444',
    
    falsifiability: 3,
    logical_coherence: 4,
    
    coreAssumption: '个体拒绝承认令人不安的现实或事实，以保护自己免受焦虑。',
    school: 'freud',
  },
  {
    id: 'projection',
    name: '投射',
    nameEn: 'Projection',
    description: '将自己的不可接受的想法或特质归因于他人。',
    definition: '投射是一种防御机制，指个体将自己的不可接受的想法、欲望、特质或冲动归因于他人。通过投射，个体可以避免承认这些特质属于自己。',
    example: '一个有隐性同性恋倾向但无法接受这一点的人，可能会过度指责他人的同性恋行为。',
    category: 'defense',
    level: 2,
    color: '#EF4444',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '个体将自己的不可接受的冲动或特征归因于他人。',
    school: 'freud',
  },
  {
    id: 'displacement',
    name: '移位',
    nameEn: 'Displacement',
    description: '将情感或冲动从原始对象转移到替代对象。',
    definition: '移位是一种防御机制，指个体将原本针对某个对象的情感、冲动或行为转移到另一个更安全或更可接受的对象。',
    example: '一个人对老板感到愤怒但不敢表达，回家后对家人发脾气。',
    category: 'defense',
    level: 2,
    color: '#EF4444',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '对一个对象的情感被转移到另一个更安全的对象上。',
    school: 'freud',
  },
  {
    id: 'sublimation',
    name: '升华',
    nameEn: 'Sublimation',
    description: '将不可接受的冲动转化为社会可接受的活动。',
    definition: '升华是一种防御机制，指个体将不可接受的冲动、欲望或能量转化为社会可接受的、通常是创意性或生产性的活动。',
    example: '一个人将攻击性冲动转化为体育竞争或艺术创作。',
    category: 'defense',
    level: 2,
    color: '#EF4444',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '本能冲动被转化为社会上可接受的活动，如艺术或学术追求。',
    school: 'freud',
  },
  {
    id: 'rationalization',
    name: '合理化',
    nameEn: 'Rationalization',
    description: '为不可接受的行为或想法提供理性的解释。',
    definition: '合理化是一种防御机制，指个体为自己不可接受的行为、想法或动机提供虚假的、看似理性的解释，以此来保护自尊。',
    example: '一个学生考试失败后说"这次考试太难了"或"老师讲课不好"，而不是承认自己没有充分准备。',
    category: 'defense',
    level: 2,
    color: '#EF4444',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '个体为自己的行为或信念提供看似合理的解释，而不是真实原因。',
    school: 'freud',
  },
  {
    id: 'defense_mechanisms',
    name: '防御机制',
    nameEn: 'Defense Mechanisms',
    description: '无意识的心理过程，保护自我免受焦虑和不适。',
    definition: '防御机制是无意识的心理过程，个体用来保护自我免受焦虑、冲突和不适的影响。防御机制通过扭曲、否认或压抑现实来实现这一目的。',
    example: '当面对令人不安的现实时，人们可能会使用各种防御机制，如否认、投射或升华。',
    category: 'defense',
    level: 2,
    color: '#EF4444',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：防御机制被定义为保护自我免受焦虑的无意识过程。但任何行为都可以被解释为防御机制的表现。如果一个人表现出某种行为，这可能是防御机制；如果一个人不表现出这种行为，这可能是压抑或否认，也是防御机制。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '自我采用各种无意识策略来保护自己免受焦虑和不适的想法。',
    school: 'freud',
  },

  // 第二层：治疗方法
  {
    id: 'free_association',
    name: '自由联想',
    nameEn: 'Free Association',
    description: '患者不加审查地说出脑海中出现的任何想法。',
    definition: '自由联想是精神分析的基本技术，患者躺在沙发上，不加审查地说出脑海中出现的任何想法、感受或记忆，无论多么荒谬或令人尴尬。',
    example: '患者可能开始谈论早上的天气，然后突然跳到童年的一个记忆，然后又跳到对某个人的恐惧。',
    category: 'therapy',
    level: 2,
    color: '#10B981',
    
    falsifiability: 3,
    logical_coherence: 4,
    
    coreAssumption: '通过自由表达思想而不加审查，可以访问无意识内容。',
    school: 'freud',
  },
  {
    id: 'dream_analysis',
    name: '梦的分析',
    nameEn: 'Dream Analysis',
    description: '分析梦的内容以理解无意识的欲望和冲突。',
    definition: '梦的分析是精神分析的重要技术。弗洛伊德认为梦是通往无意识的皇家之路。通过分析梦的显性内容（表面意义）和潜在内容（隐藏意义），分析师可以理解患者的无意识欲望、冲突和创伤。',
    example: '患者梦到被追赶，分析师可能会帮助患者探索这个梦代表什么——可能是对某种情况的恐惧或对权威的抵抗。',
    category: 'therapy',
    level: 2,
    color: '#10B981',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '梦是通往无意识的皇家之路，梦的内容代表了被压抑的欲望和冲突。',
    school: 'freud',
  },
  {
    id: 'transference',
    schoolPerspectives: {
          "freud": "弗洛伊德认为移情是患者将对重要人物的感情转移到分析师身上的过程，是治疗的关键。",
          "lacan": "拉康强调移情涉及主体对象的关系，分析师作为大他者的代表。",
          "klein": "克莱因认为移情包含对分析师的投射性认同，反映患者的内部客体关系。",
          "winnicott": "温尼科特强调移情中的真实关系成分，分析师需要提供\"足够好的\"环境。",
          "kohut": "科胡特认为自体心理学中的移情是自体客体移情，患者寻求缺失的自体客体功能。"
    },
    name: '移情',
    nameEn: 'Transference',
    description: '患者将对过去重要人物的感受投射到分析师身上。',
    definition: '移情是指患者将对过去重要人物（通常是父母）的感受、态度和期望投射到分析师身上。患者可能会对分析师产生爱、恨、恐惧或其他强烈的情感，这些情感实际上源于过去的关系。',
    example: '一个患者可能会对分析师产生强烈的依赖感，就像他对母亲的依赖一样，或者可能会对分析师产生不信任，就像他对父亲的不信任一样。',
    category: 'therapy',
    level: 2,
    color: '#10B981',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：移情被定义为患者将过去的感受投射到分析师身上，但分析师如何知道这是移情而不是对分析师的真实反应？分析师通常将患者的所有反应解释为移情，这使得理论无法被证伪。',
    alternativeNames: ['转移', '转移现象'],
    translationNotes: '移情是最常用的中文翻译，转移是较旧的翻译。移情更准确地反映了情感的转移特性。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '患者在治疗中将对重要他人的感情投射到分析师身上。',
    school: 'freud',
  },
  {
    id: 'countertransference',
    name: '反移情',
    nameEn: 'Countertransference',
    description: '分析师对患者产生的无意识反应和情感。',
    definition: '反移情是指分析师对患者产生的无意识反应、情感和态度。分析师可能会对患者产生爱、恨、保护欲或其他情感，这些情感可能源于分析师自己的无意识冲突。',
    example: '分析师可能会发现自己对某个患者特别有耐心或特别不耐烦，这可能反映了分析师自己的心理问题。',
    category: 'therapy',
    level: 2,
    color: '#10B981',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：反移情被定义为分析师对患者的无意识反应。但分析师如何知道他的反应是反移情而不是对患者的真实反应？任何分析师的反应都可以被解释为反移情。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '分析师对患者的无意识反应反映了分析师自己的心理冲突。',
    school: 'freud',
  },
  {
    id: 'interpretation',
    name: '诠释',
    nameEn: 'Interpretation',
    description: '分析师解释患者的无意识动机和冲突。',
    definition: '诠释是分析师的主要工作，分析师根据患者的言语、行为、梦和移情反应，解释患者的无意识动机、冲突和防御机制。',
    example: '当患者说"我不知道为什么我总是选择对我不好的伴侣"时，分析师可能会诠释这反映了患者对父母关系的无意识重复。',
    category: 'therapy',
    level: 2,
    color: '#10B981',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：诠释的有效性由患者的反应来判断。如果患者同意诠释，这被视为正确的诠释；如果患者不同意，这被解释为阻抗或压抑，仍然被视为诠释是正确的。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '通过解释患者的言语、行为和梦，可以揭示无意识的含义。',
    school: 'freud',
  },
  {
    id: 'psychoanalytic_therapy',
    name: '精神分析治疗',
    nameEn: 'Psychoanalytic Therapy',
    description: '通过分析无意识来治疗心理问题的方法。',
    definition: '精神分析治疗是一种深层的心理治疗方法，通过帮助患者认识和处理无意识的冲突、创伤和防御机制来治疗心理问题。',
    example: '一个患有焦虑症的患者通过精神分析治疗，逐渐认识到他的焦虑源于童年的创伤，最终获得治愈。',
    category: 'therapy',
    level: 2,
    color: '#10B981',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '通过使无意识内容进入意识，可以解决心理问题。',
    school: 'freud',
  },

  // 第二层：心理现象
  {
    id: 'psychic_determinism',
    name: '心理决定论',
    nameEn: 'Psychic Determinism',
    description: '所有心理现象都有原因，没有随意的思想或行为。',
    definition: '心理决定论是弗洛伊德的基本假设，认为所有心理现象都有原因，没有真正的随意或偶然。每个想法、梦、言语错误或行为都有无意识的原因。',
    example: '一个人说错了一个词，这不是随意的，而是反映了他的无意识想法。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：心理决定论认为所有心理现象都有原因。但这个理论本身是不可证伪的——任何看似随意的现象都可以被解释为有无意识的原因。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '所有心理事件都有原因，没有随机或偶然的心理现象。',
    school: 'freud',
  },
  {
    id: 'oedipus_complex',
    schoolPerspectives: {
          "freud": "弗洛伊德认为俄狄浦斯情结是心理发展的关键，涉及对异性父母的欲望和对同性父母的竞争。",
          "lacan": "拉康认为俄狄浦斯情结涉及象征性阉割和父亲名字的作用，是进入象征秩序的关键。",
          "klein": "克莱因强调俄狄浦斯情结的早期根源，与内部父母意象和性差异的认识相关。",
          "jung": "荣格认为俄狄浦斯情结反映了原型的作用，强调心理分化和个性化的过程。",
          "winnicott": "温尼科特强调俄狄浦斯情结的健康发展需要足够好的抱持环境。"
    },
    name: '俄狄浦斯情结',
    nameEn: 'Oedipus Complex',
    description: '儿童对异性父母的无意识欲望和对同性父母的敌意。',
    definition: '俄狄浦斯情结是弗洛伊德提出的概念，指男孩对母亲的无意识性欲望和对父亲的敌意，或女孩对父亲的无意识性欲望和对母亲的敌意。这个情结在3-6岁之间形成，是人格发展的关键阶段。',
    example: '一个4岁的男孩可能会说"我长大后要和妈妈结婚"，这反映了俄狄浦斯情结。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：俄狄浦斯情结被定义为儿童对异性父母的无意识欲望。但如果儿童表现出这种欲望，这被视为情结的证据；如果儿童不表现出这种欲望，这被解释为压抑或否认，仍然被视为情结存在的证据。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '儿童对异性父母的无意识性欲望和对同性父母的敌意是人格发展的关键。',
    school: 'freud',
  },
  {
    id: 'resistance',
    name: '阻抗',
    nameEn: 'Resistance',
    description: '患者在治疗中无意识地抵抗接近无意识内容。',
    definition: '阻抗是指患者在精神分析治疗中无意识地抵抗、回避或阻止接近无意识内容的过程。患者可能会迟到、忘记约定、改变话题或否认分析师的诠释。',
    example: '一个患者每次接近谈论他的童年创伤时，就会开始谈论其他话题或说他累了。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：阻抗被定义为患者无意识地抵抗接近无意识内容。但如果患者同意分析师的诠释，这被视为治疗进展；如果患者不同意，这被视为阻抗。任何反应都可以被解释为阻抗的证据。',
    alternativeNames: ['抵抗', '抵抗现象'],
    translationNotes: '阻抗是最常用的中文翻译，抵抗是较旧的翻译。阻抗更准确地反映了心理阻力的特性。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '患者无意识地抵抗治疗过程，以保护自己免受不适的真相。',
    school: 'freud',
  },
  {
    id: 'repetition_compulsion',
    name: '重复强迫',
    nameEn: 'Repetition Compulsion',
    description: '个体无意识地重复痛苦的经历或关系模式。',
    definition: '重复强迫是指个体无意识地重复痛苦的经历、创伤或关系模式。这不是理性的选择，而是无意识的冲动。',
    example: '一个在童年被父亲虐待的人，成年后可能会一次又一次地选择虐待他的伴侣。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：重复强迫被定义为无意识地重复痛苦的经历。但如果一个人重复痛苦的经历，这被视为重复强迫；如果一个人避免痛苦的经历，这也可能被解释为压抑或否认。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '个体被迫重复创伤经历，试图获得对其的控制。',
    school: 'freud',
  },
  {
    id: 'screen_memory',
    name: '屏记忆',
    nameEn: 'Screen Memory',
    description: '一个看似无关紧要的记忆，实际上隐藏了更重要的记忆。',
    definition: '屏记忆是一个看似无关紧要、平凡的记忆，实际上隐藏或代替了更重要的、通常是令人不快的记忆。屏记忆通过压抑和象征来工作。',
    example: '一个人清晰地记得童年时在公园里看到一只狗，但这个记忆实际上隐藏了同一天发生的创伤事件。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：屏记忆被定义为隐藏更重要记忆的无关记忆。但我们如何知道一个记忆是屏记忆而不是真实的记忆？任何记忆都可能被解释为屏记忆。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '表面上无害的记忆实际上掩盖了更深层的、通常是创伤性的记忆。',
    school: 'freud',
  },

  // 第二层：梦的工作机制
  {
    id: 'condensation',
    name: '凝聚',
    nameEn: 'Condensation',
    description: '多个想法或人物在梦中融合成一个。',
    definition: '凝聚是梦的工作机制之一，指多个想法、人物或情景在梦中融合或压缩成一个。',
    example: '在梦中，一个人可能同时具有父亲和老师的特征，这是凝聚的结果。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '多个想法或图像被压缩成一个梦的元素。',
    school: 'freud',
  },

  // 第二层：关键概念
  {
    id: 'libido',
    schoolPerspectives: {
          "freud": "弗洛伊德认为力比多是心理能量的来源，驱动所有心理活动，具有性的本质。",
          "jung": "荣格将力比多重新定义为一般的心理能量，不仅限于性欲，包括精神追求。",
          "klein": "克莱因强调力比多与攻击性本能的相互作用，特别是在内部客体关系中。",
          "winnicott": "温尼科特强调力比多与生活力和创意的关系，与真实自体的表达相关。"
    },
    name: '力比多',
    nameEn: 'Libido',
    description: '心理能量或性能量，驱动人类行为。',
    definition: '力比多是弗洛伊德提出的概念，指心理能量或性能量。力比多不仅仅是性欲，而是一种广泛的心理能量，驱动人类的各种行为和动机。',
    example: '一个人的创意活动、工作热情或社交互动都可能受到力比多的驱动。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：力比多被定义为驱动人类行为的心理能量。但任何行为都可以被解释为力比多的表现。如果一个人表现出某种行为，这是力比多的证据；如果一个人不表现出这种行为，这可能是压抑，仍然是力比多的证据。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '心理能量驱动所有人类行为，既包括性的也包括非性的活动。',
    school: 'freud',
  },
  {
    id: 'pleasure_principle',
    name: '享乐原则',
    nameEn: 'Pleasure Principle',
    description: '追求快乐和避免痛苦的基本驱动力。',
    definition: '享乐原则是弗洛伊德提出的基本心理原则，指个体的基本驱动力是追求快乐和避免痛苦。本我完全遵循享乐原则。',
    example: '婴儿哭闹要求喂食或尿布更换，这是享乐原则的直接表现。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：享乐原则被定义为追求快乐和避免痛苦。但任何行为都可以被解释为追求快乐或避免痛苦。这个原则太宽泛，无法被证伪。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '人类被驱动去追求快乐并避免痛苦。',
    school: 'freud',
  },
  {
    id: 'reality_principle',
    name: '现实原则',
    nameEn: 'Reality Principle',
    description: '考虑现实约束和社会规范的行为指导。',
    definition: '现实原则是自我遵循的原则，指个体在考虑现实约束、社会规范和长期后果的基础上行动。',
    example: '一个饥饿的人不会立即抢劫面包店，而是等待午餐时间或寻找合法的方式获得食物。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    
    falsifiability: 3,
    logical_coherence: 4,
    
    coreAssumption: '自我学会延迟满足和考虑现实约束。',
    school: 'freud',
  },
  {
    id: 'moral_principle',
    name: '道德原则',
    nameEn: 'Moral Principle',
    description: '超我遵循的道德和理想标准。',
    definition: '道德原则是超我遵循的原则，指个体内化的道德标准、社会规范和理想。',
    example: '一个人可能想要说谎来获得利益，但道德原则阻止他这样做。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    
    falsifiability: 3,
    logical_coherence: 4,
    
    coreAssumption: '超我强制遵守道德标准，即使这意味着放弃快乐。',
    school: 'freud',
  },
  {
    id: 'infantile_sexuality',
    schoolPerspectives: {
          "freud": "弗洛伊德认为幼儿性欲是心理发展的基础，经历口腔期、肛门期和性器期。",
          "klein": "克莱因强调幼儿性欲与内部客体关系的复杂性，包含攻击性和性欲的混合。",
          "jung": "荣格认为幼儿性欲反映了心理能量的流动，与个性化过程相关。",
          "winnicott": "温尼科特强调幼儿性欲需要在足够好的抱持环境中发展。"
    },
    name: '幼儿性欲',
    nameEn: 'Infantile Sexuality',
    description: '儿童的性心理发展，包括口欲期、肛欲期等。',
    definition: '幼儿性欲是弗洛伊德提出的概念，指儿童从出生开始就具有性心理，经历不同的发展阶段（口欲期、肛欲期、性器期等）。',
    example: '婴儿通过吸吮获得快乐，这是口欲期的表现。',
    category: 'phenomena',
    level: 2,
    color: '#F59E0B',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '儿童从出生起就具有性的本质，这种幼儿性欲通过不同的阶段发展。',
    school: 'freud',
  },

  // 拉康理论
  {
    id: 'symbolic_order',
    name: '象征界',
    nameEn: 'Symbolic Order',
    description: '拉康理论，语言和文化的领域，由符号和规则组成。',
    definition: '象征界是拉康提出的三个现实领域之一，指语言、文化和社会规则的领域。象征界通过语言和符号来组织现实。',
    example: '语言、法律、道德规范都属于象征界。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '语言和符号系统构成了现实，并塑造了我们的主体性。',
    school: 'lacan',
  },
  {
    id: 'imaginary_order',
    name: '想象界',
    nameEn: 'Imaginary Order',
    description: '拉康理论，由想象和镜像组成的领域。',
    definition: '想象界是拉康提出的三个现实领域之一，指由想象、镜像和自我形象组成的领域。在想象界中，主体通过与他人的镜像关系来构建自我。',
    example: '一个婴儿在镜子中看到自己的形象，开始形成自我意识。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '想象的关系和认同是自我形成的基础。',
    school: 'lacan',
  },
  {
    id: 'real_order',
    name: '实在界',
    nameEn: 'Real Order',
    description: '拉康理论，超越象征和想象的原始现实。',
    definition: '实在界是拉康提出的三个现实领域之一，指超越象征和想象的原始、无法言说的现实。实在界是创伤性的，无法被完全象征化。',
    example: '死亡、暴力或极端痛苦可能代表实在界——无法被语言完全捕捉的现实。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '存在一个超越符号和想象的实在，无法被完全表示。',
    school: 'lacan',
  },
  {
    id: 'mirror_stage',
    name: '镜像阶段',
    nameEn: 'Mirror Stage',
    description: '拉康理论，婴儿通过镜像形成自我意识的阶段。',
    definition: '镜像阶段是拉康提出的发展阶段，指6-18个月的婴儿通过在镜子中看到自己的形象，或通过他人的镜像反应，开始形成自我意识和自我形象。',
    example: '一个婴儿看到镜子中的形象，起初认为那是另一个婴儿，后来意识到那是自己。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '婴儿通过镜像中的形象认同而形成初步的自我。',
    school: 'lacan',
  },
  {
    id: 'desire',
    name: '欲望',
    nameEn: 'Desire',
    description: '拉康理论，由缺乏驱动的永恒追求。',
    definition: '欲望是拉康理论的中心概念，指由缺乏驱动的永恒追求。欲望不是需要（可以被满足的），而是永远无法被完全满足的。',
    example: '一个人可能渴望爱情或认可，但即使获得这些，欲望仍然存在，因为欲望源于缺乏。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '欲望是由缺失驱动的，永远无法通过满足来解决。',
    school: 'lacan',
  },
  {
    id: 'lack',
    name: '缺乏',
    nameEn: 'Lack',
    description: '拉康理论，主体中心的缺乏，驱动欲望。',
    definition: '缺乏是拉康理论的基本概念，指主体中心的缺乏。这个缺乏不是可以被填补的，而是主体存在的基本条件。',
    example: '人类永远无法完全满足，因为我们总是被缺乏所驱动。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '主体因语言进入而产生的基本缺失或不完整感。',
    school: 'lacan',
  },
  {
    id: 'jouissance',
    name: '享乐',
    nameEn: 'Jouissance',
    description: '拉康理论，超越快乐的极端快感或痛苦。',
    definition: '享乐是拉康提出的概念，指超越快乐的极端快感或痛苦。享乐既是快乐的，又是令人不适的，是一种超越理性的体验。',
    example: '极端的痛苦或快乐体验可能代表享乐——一种超越理性快乐原则的体验。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    school: 'lacan',
  },
  {
    id: 'objet_petit_a',
    name: '客体小a',
    nameEn: 'Objet Petit a',
    description: '拉康理论，永远无法获得的欲望对象。',
    definition: '客体小a是拉康理论中的中心概念，指永远无法获得的欲望对象。它是欲望的焦点，但永远无法被完全获得或占有。',
    example: '一个人可能追求某个人或某个目标，但一旦获得，欲望就转向别的地方。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '想象中的对象，承载了我们的欲望和幻想。',
    school: 'lacan',
  },
  {
    id: 'big_other',
    name: '大他者',
    nameEn: 'Big Other',
    description: '拉康理论，象征秩序和社会规范的代表。',
    definition: '大他者是拉康理论中的概念，指象征秩序、社会规范和文化的代表。大他者是超越个人的、普遍的、权威的。',
    example: '法律、道德、社会期望都代表大他者。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    school: 'lacan',
  },
  {
    id: 'small_other',
    name: '小他者',
    nameEn: 'Small Other',
    description: '拉康理论，具体的他人或对象。',
    definition: '小他者是拉康理论中的概念，指具体的他人或对象，与大他者的普遍性相对。',
    example: '你的朋友、伴侣或任何具体的他人都是小他者。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '他人作为一个具体的、想象的个体，与大他者相对。',
    school: 'lacan',
  },
  {
    id: 'signifier',
    name: '能指',
    nameEn: 'Signifier',
    description: '拉康理论，代表意义的符号或声音。',
    definition: '能指是拉康理论中的概念，指代表意义的符号或声音。能指与所指（意义）之间的关系是任意的。',
    example: '单词"树"是能指，而实际的树是所指。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '代表意义的符号或标记，其含义由其与其他能指的关系决定。',
    school: 'lacan',
  },
  {
    id: 'signified',
    name: '所指',
    nameEn: 'Signified',
    description: '拉康理论，能指所代表的意义。',
    definition: '所指是拉康理论中的概念，指能指所代表的意义或概念。',
    example: '单词"树"的所指是树的概念。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '能指所代表的概念或含义。',
    school: 'lacan',
  },
  {
    id: 'symbolic_chain',
    name: '象征链',
    nameEn: 'Symbolic Chain',
    description: '拉康理论，能指之间的关系链。',
    definition: '象征链是拉康理论中的概念，指能指之间的关系链。意义通过象征链中能指之间的差异和关系产生。',
    example: '语言中的单词通过与其他单词的关系来获得意义。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '能指通过其相互关系形成的网络，产生意义。',
    school: 'lacan',
  },
  {
    id: 'subjectivity',
    name: '主体性',
    nameEn: 'Subjectivity',
    description: '拉康理论，主体通过象征秩序构建的身份。',
    definition: '主体性是拉康理论中的概念，指主体通过象征秩序（语言、文化、社会规范）构建的身份。主体不是先天的，而是通过象征秩序产生的。',
    example: '一个人的身份由他所说的语言、他所属的文化和他所遵循的社会规范构建。',
    category: 'lacan',
    level: 2,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '主体性通过进入象征秩序而形成，并由语言构成。',
    school: 'lacan',
  },

  // 自体心理学
  {
    id: 'self',
    name: '自体',
    nameEn: 'Self',
    description: '科胡特理论，个体的中心、凝聚的心理结构。',
    definition: '自体是科胡特提出的概念，指个体的中心、凝聚的心理结构。自体是通过自体客体的镜像反映、理想化和孪生关系发展而来的。',
    example: '一个人的自体感取决于他在他人眼中的形象和他人对他的认可。',
    category: 'self_psychology',
    level: 2,
    color: '#10B981',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '自体心理学中的自体是人格的中心，由自体客体的照镜功能维持。',
    school: 'kohut',
  },
  {
    id: 'selfobject',
    name: '自体客体',
    nameEn: 'Selfobject',
    description: '科胡特理论，他人作为自体的延伸而被体验。',
    definition: '自体客体是科胡特提出的概念，指他人作为自体的延伸而被体验。自体客体不是真正的对象，而是自体的功能部分。',
    example: '一个母亲对婴儿来说是自体客体，婴儿通过母亲的镜像反映来发展自体。',
    category: 'self_psychology',
    level: 2,
    color: '#10B981',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '他人作为自体的延伸，提供必要的心理功能。',
    school: 'kohut',
  },
  {
    id: 'mirroring',
    name: '镜像反映',
    nameEn: 'Mirroring',
    description: '科胡特理论，他人对自体的认可和反映。',
    definition: '镜像反映是科胡特提出的自体客体功能，指他人对自体的认可、理解和反映。通过镜像反映，个体发展出健康的自体感。',
    example: '一个父亲对孩子的成就表示认可和自豪，这是镜像反映的例子。',
    category: 'self_psychology',
    level: 2,
    color: '#10B981',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '自体客体通过反映和验证个体的经历来促进健康发展。',
    school: 'kohut',
    schoolPerspectives: {
      'kohut': '科胡特认为镜像反映是自体客体功能的核心，通过他人的认可和反映，个体发展出健康的自体感和自尊。',
      'winnicott': '温尼科特强调母亲对婴儿的镜像反映作用，母亲通过反映婴儿的经历来帮助其发展真实自体。',
      'stern': '斯特恩认为镜像反映涉及情感调谐，照顾者需要准确地反映婴儿的情感状态。',
      'lacan': '拉康将镜像反映与镜像阶段联系起来，强调镜像反映在形成自体认同中的作用。'
    },
  },
  {
    id: 'idealization',
    name: '理想化',
    nameEn: 'Idealization',
    description: '科胡特理论，将他人理想化以获得安全感和方向。',
    definition: '理想化是科胡特提出的自体客体功能，指个体将他人理想化，以获得安全感、方向和自我调节的能力。',
    example: '一个孩子可能会理想化他的父亲，将他视为全能和完美的。',
    category: 'self_psychology',
    level: 2,
    color: '#10B981',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '个体将自体客体理想化，以获得稳定感和安全感。',
    school: 'kohut',
  },
  {
    id: 'twinship',
    name: '孪生关系',
    nameEn: 'Twinship',
    description: '科胡特理论，与他人的相似性和共同感。',
    definition: '孪生关系是科胡特提出的自体客体功能，指个体与他人的相似性和共同感。通过孪生关系，个体感到被理解和接受。',
    example: '两个有相似经历或兴趣的人可能会形成孪生关系，互相理解和支持。',
    category: 'self_psychology',
    level: 2,
    color: '#10B981',
    school: 'kohut',
  },
  {
    id: 'empathy',
    name: '共情',
    nameEn: 'Empathy',
    description: '科胡特理论，理解他人内心体验的能力。',
    definition: '共情是科胡特理论的中心，指理解他人内心体验和情感的能力。科胡特认为共情是精神分析的基本工具。',
    example: '一个分析师通过共情来理解患者的内心世界，从而提供有效的治疗。',
    category: 'self_psychology',
    level: 2,
    color: '#10B981',
    school: 'kohut',
  },

  // 客体关系理论 - 克莱因
  {
    id: 'object_relations',
    name: '客体关系',
    nameEn: 'Object Relations',
    description: '心理发展中与他人（客体）的关系。',
    definition: '客体关系理论强调个体与他人（客体）的关系对心理发展的重要性。客体不是真正的他人，而是个体对他人的内在表征。',
    example: '一个人对母亲的内在表征（好母亲或坏母亲）会影响他与其他女性的关系。',
    category: 'object_relations',
    level: 2,
    color: '#F59E0B',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '人格由早期与照顾者的关系塑造，这些关系被内化为内部对象。',
    school: 'klein',
  },
  {
    id: 'internal_object',
    name: '内部客体',
    nameEn: 'Internal Object',
    description: '克莱因理论，个体内化的他人形象。',
    definition: '内部客体是克莱因提出的概念，指个体内化的他人形象。这些内部客体不是真实的他人，而是个体对他人的心理表征。',
    example: '一个人可能在心中保持对已故父亲的形象，这个形象会影响他的行为和决定。',
    category: 'object_relations',
    level: 2,
    color: '#F59E0B',
    school: 'klein',
  },
  {
    id: 'good_bad_object',
    name: '好客体与坏客体',
    nameEn: 'Good and Bad Object',
    description: '克莱因理论，客体被分裂为全好或全坏。',
    definition: '好客体与坏客体是克莱因提出的概念，指婴儿将客体（通常是母亲）分裂为全好或全坏。这种分裂是防御机制，保护婴儿免受焦虑。',
    example: '一个婴儿可能将母亲视为全好（当她满足需求时）或全坏（当她不满足需求时）。',
    category: 'object_relations',
    level: 2,
    color: '#F59E0B',
    school: 'klein',
  },
  {
    id: 'projective_identification',
    name: '投射认同',
    nameEn: 'Projective Identification',
    description: '克莱因理论，将自己的部分投射到他人身上并认同。',
    definition: '投射认同是克莱因提出的防御机制，指个体将自己的部分（通常是不可接受的部分）投射到他人身上，然后通过他人来体验这些部分。',
    example: '一个人可能将自己的攻击性投射到他人身上，然后害怕这个人。',
    category: 'object_relations',
    level: 2,
    color: '#F59E0B',
    school: 'klein',
  },
  {
    id: 'introjection',
    name: '内摄',
    nameEn: 'Introjection',
    description: '克莱因理论，将外部客体内化为内部客体。',
    definition: '内摄是克莱因提出的心理过程，指个体将外部客体（他人）内化为内部客体。这与认同不同，内摄是更原始的过程。',
    example: '一个孩子可能会内摄他的父亲的价值观和行为方式。',
    category: 'object_relations',
    level: 2,
    color: '#F59E0B',
    school: 'klein',
  },
  {
    id: 'paranoid_schizoid',
    name: '偏执-分裂位置',
    nameEn: 'Paranoid-Schizoid Position',
    description: '克莱因理论，婴儿早期的心理位置，特征是分裂和投射。',
    definition: '偏执-分裂位置是克莱因提出的发展阶段，指婴儿早期（0-3个月）的心理位置。在这个阶段，婴儿将客体分裂为好和坏，并使用投射认同。',
    example: '一个婴儿将母亲分裂为好母亲（满足需求时）和坏母亲（不满足需求时）。',
    category: 'object_relations',
    level: 2,
    color: '#F59E0B',
    school: 'klein',
  },
  {
    id: 'depressive_position',
    name: '抑郁位置',
    nameEn: 'Depressive Position',
    description: '克莱因理论，婴儿后期的心理位置，特征是整合和内疚。',
    definition: '抑郁位置是克莱因提出的发展阶段，指婴儿后期（3-6个月）的心理位置。在这个阶段，婴儿开始整合好客体和坏客体，产生内疚感和修复冲动。',
    example: '一个婴儿意识到他既爱又恨同一个人（母亲），这导致内疚感和修复的欲望。',
    category: 'object_relations',
    level: 2,
    color: '#F59E0B',
    school: 'klein',
  },

  // 温尼科特理论
  {
    id: 'transitional_object',
    name: '过渡客体',
    nameEn: 'Transitional Object',
    description: '温尼科特理论，儿童用来过渡的物体（如毛绒玩具）。',
    definition: '过渡客体是温尼科特提出的概念，指儿童用来从完全依赖母亲过渡到独立的物体，如毛绒玩具或毯子。这个物体既代表母亲，又是独立的，帮助儿童发展创造性和独立性。',
    example: '一个幼儿依恋的泰迪熊是过渡客体，它帮助孩子在母亲不在时感到安慰，逐渐学会独立。',
    category: 'object_relations',
    level: 3,
    color: '#A855F7',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '儿童用来过渡到独立的对象，代表了内部和外部现实之间的桥梁。',
    school: 'winnicott',
  },
  {
    id: 'holding_environment',
    schoolPerspectives: {
          "winnicott": "温尼科特认为抱持环境是婴幼儿心理发展的基础，母亲通过身体和心理的抱持提供安全感。",
          "klein": "克莱因强调容纳环境与母亲的容纳功能的关系。",
          "bion": "比昂强调容器与被容纳物的关系，母亲作为容器容纳婴儿的投射。",
          "freud": "弗洛伊德虽未明确提出，但他的原始依赖关系理论为抱持环境奠定了基础。"
    },
    name: '抱持环境',
    nameEn: 'Holding Environment',
    description: '温尼科特概念，母亲提供的安全、支持的环境。',
    definition: '抱持环境是温尼科特提出的概念，指母亲为婴儿提供的安全、支持和照顾的环境。在这个环境中，婴儿的需求被理解和满足，婴儿发展出对世界的基本信任和安全感。',
    example: '一个母亲通过温柔的触摸、回应性的照顾和情感支持，为婴儿创造了一个抱持环境，帮助婴儿发展出安全感。',
    category: 'object_relations',
    level: 3,
    color: '#A855F7',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：抱持环境被定义为导致安全感的环境，而安全感的存在又被用来证明抱持环境的存在。缺乏安全感被解释为缺乏抱持环境，但缺乏抱持环境的证据本身就是缺乏安全感。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '环境提供安全、支持和照顾，使心理发展成为可能。',
    school: 'winnicott',
  },
  {
    id: 'true_self',
    schoolPerspectives: {
          "winnicott": "温尼科特认为真实自体是个体的核心，包含生活力和创意，需要在足够好的环境中发展。",
          "jung": "荣格的自性化过程与真实自体的实现相似，强调个性化和整合。",
          "kohut": "科胡特的核心自体与温尼科特的真实自体有相似之处，都强调自体的完整性。",
          "lacan": "拉康强调主体的分裂性，反对单一的真实自体的观念。"
    },
    name: '真实自体',
    nameEn: 'True Self',
    description: '温尼科特理论，个体的真实、原始的自我。',
    definition: '真实自体是温尼科特提出的概念，指个体的真实、原始的自我，包括他的真实感受、欲望和创意。真实自体通过在抱持环境中得到满足而发展。',
    example: '一个孩子在安全的环境中能够表达他的真实想法和感受，而不是为了取悦他人而压抑自己。',
    category: 'object_relations',
    level: 3,
    color: '#A855F7',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '真实自体代表个体的真实本质和潜力。',
    school: 'winnicott',
  },
  {
    id: 'false_self',
    schoolPerspectives: {
          "winnicott": "温尼科特认为虚假自体是对环境的适应，过度发展会导致心理病理。",
          "klein": "克莱因强调防御性的自体组织与虚假自体的形成。",
          "lacan": "拉康强调想象秩序中的虚假认同与镜像阶段的关系。"
    },
    name: '虚假自体',
    nameEn: 'False Self',
    description: '温尼科特理论，为适应环境而形成的防御性自我。',
    definition: '虚假自体是温尼科特提出的概念，指个体为了适应环境、满足他人期望而形成的防御性自我。虚假自体压抑了真实自体，导致个体感到不真实和空虚。',
    example: '一个孩子在父母的过度控制下，发展出虚假自体来满足父母的期望，而压抑了自己的真实想法和感受。',
    category: 'object_relations',
    level: 3,
    color: '#A855F7',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '虚假自体是为了适应环境期望而发展的防御性人格。',
    school: 'winnicott',
  },

  // 比昂理论
  {
    id: 'container_contained',
    name: '容器与被容纳物',
    nameEn: 'Container-Contained',
    description: '比昂理论，分析师接纳患者投射的过程。',
    definition: '容器与被容纳物是比昂提出的概念，指分析师（容器）接纳患者（被容纳物）的投射和情感。分析师通过心理消化这些投射，帮助患者获得理解。',
    example: '一个患者向分析师倾诉他的恐惧和焦虑，分析师接纳这些情感，通过理解来帮助患者。',
    category: 'object_relations',
    level: 3,
    color: '#F87171',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '心理容纳涉及一个人能够容纳另一个人的情感和经历。',
    school: 'bion',
  },
  {
    id: 'alpha_function',
    name: 'α功能',
    nameEn: 'Alpha Function',
    description: '比昂理论，将原始感受转化为可思考的心理内容。',
    definition: 'α功能是比昂提出的概念，指心理将原始、未经消化的感受（β元素）转化为可思考的心理内容（α元素）。α功能是心理健康的基础。',
    example: '一个人经历创伤后，通过α功能将创伤体验转化为可以思考和理解的内容。',
    category: 'object_relations',
    level: 3,
    color: '#F87171',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '心理功能将原始感觉经历转化为可思考的内容。',
    school: 'bion',
  },
  {
    id: 'beta_elements',
    name: 'β元素',
    nameEn: 'Beta Elements',
    description: '比昂理论，未经消化的原始感受。',
    definition: 'β元素是比昂提出的概念，指未经消化的、原始的、无法思考的感受。β元素是创伤性的，无法被象征化或言说。',
    example: '一个创伤幸存者可能会经历β元素——突然的、无法言说的恐惧或痛苦。',
    category: 'object_relations',
    level: 3,
    color: '#F87171',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '无法被心理化的原始感觉经历，导致心理困扰。',
    school: 'bion',
  },
  {
    id: 'reverie',
    name: '遐想',
    nameEn: 'Reverie',
    description: '比昂理论，分析师的无意识共情状态。',
    definition: '遐想是比昂提出的概念，指分析师的无意识共情状态。在遐想中，分析师暂时放弃理性思维，进入与患者的无意识共鸣。',
    example: '一个分析师在与患者的对话中进入遐想状态，能够直观地理解患者的无意识内容。',
    category: 'object_relations',
    level: 3,
    color: '#F87171',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '分析师进入一种开放、接受的心理状态，以理解患者的无意识。',
    school: 'bion',
  },

  // 费尔贝恩理论
  {
    id: 'internal_objects_fairbairn',
    name: '内部客体',
    nameEn: 'Internal Objects',
    description: '费尔贝恩理论，个体内化的他人形象。',
    definition: '内部客体是费尔贝恩提出的概念，指个体内化的他人形象，特别是与需要和满足相关的他人。费尔贝恩强调内部客体的动态性和冲突性。',
    example: '一个人可能在心中保持对母亲的多个内部客体表征——满足的母亲、拒绝的母亲、诱惑的母亲。',
    category: 'object_relations',
    level: 3,
    color: '#EC4899',
    school: 'fairbairn',
  },
  {
    id: 'libidinal_object',
    name: '力比多客体',
    nameEn: 'Libidinal Object',
    description: '费尔贝恩理论，引发渴望和追求的客体。',
    definition: '力比多客体是费尔贝恩提出的概念，指引发个体渴望和追求的客体。力比多客体代表满足和关系的承诺。',
    example: '一个人可能会追求一个他认为能满足他需要的伴侣，这个伴侣就是他的力比多客体。',
    category: 'object_relations',
    level: 3,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '被投入力比多或爱的对象，通常是满足需求的人。',
    school: 'fairbairn',
  },
  {
    id: 'exciting_object',
    name: '激发客体',
    nameEn: 'Exciting Object',
    description: '费尔贝恩理论，引发欲望和期待的客体。',
    definition: '激发客体是费尔贝恩提出的概念，指引发个体欲望和期待的客体。激发客体承诺满足，但实际上无法完全满足。',
    example: '一个人可能会被一个看似能满足他所有需要的伴侣所吸引，但这个伴侣实际上无法满足他。',
    category: 'object_relations',
    level: 3,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '引起欲望和兴奋的对象，与拒绝对象相对。',
    school: 'fairbairn',
  },
  {
    id: 'rejecting_object',
    name: '拒绝客体',
    nameEn: 'Rejecting Object',
    description: '费尔贝恩理论，拒绝和排斥的客体。',
    definition: '拒绝客体是费尔贝恩提出的概念，指拒绝和排斥个体的客体。拒绝客体代表冷漠、批评和拒绝。',
    example: '一个人可能会内化他的批评性父亲作为拒绝客体，导致他对自己的批评。',
    category: 'object_relations',
    level: 3,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '引起愤怒和拒绝的对象，与激发对象相对。',
    school: 'fairbairn',
  },

  // 荣格理论
  {
    id: 'collective_unconscious',
    schoolPerspectives: {
          "jung": "荣格认为集体无意识是人类共同的心理遗产，包含原型和共同的象征。",
          "freud": "弗洛伊德虽未接受集体无意识的概念，但他的泛性论思想有相似之处。",
          "lacan": "拉康强调象征秩序的普遍性，但不同意荣格的集体无意识概念。",
          "klein": "克莱因强调原始幻想的普遍性，与集体无意识有相关性。"
    },
    name: '集体无意识',
    nameEn: 'Collective Unconscious',
    description: '荣格概念。人类共同的无意识层次，包含普遍的原型。',
    definition: '集体无意识是荣格提出的概念，指整个人类物种共同的无意识层次，它不是个人的，而是人类整体的。集体无意识中包含了原型、神话主题和普遍的人类经验。',
    example: '各个文化中都有类似的神话故事，比如洪水消毁世界的故事，这可能反映了人类集体无意识中的普遍主题。',
    category: 'phenomena',
    level: 4,
    color: '#EC4899',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：集体无意识是不可观察的，但我们通过各种文化中的相似性来推断其存在。然而，任何相似性都可以被解释为集体无意识的证据，但不相似的地方也可以被解释为文化差异或下意识的压抑，使理论无法被证伪。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '除了个人无意识外，还存在一个由所有人类共享的普遍无意识。',
    school: 'jung',
  },
  {
    id: 'archetype',
    schoolPerspectives: {
          "jung": "荣格认为原型是集体无意识中的普遍象征和行为模式，如阴影、阿尼玛等。",
          "lacan": "拉康强调象征秩序中的结构性元素，但不同意荣格的原型概念。",
          "klein": "克莱因强调原始幻想的普遍性，与原型的概念有相关性。"
    },
    name: '原型',
    nameEn: 'Archetype',
    description: '集体无意识中的普遍的人物或水准。',
    definition: '原型是荣格提出的概念，指集体无意识中的普遍水准、原始的人物形象或事件模式。原型是不个人的，是人类共同的。它们在神话、宗教、文学和艺术中重复出现。',
    example: '英雄、老一辈、魔鬼、圣人等原型在世界各地的神话和故事中重复出现。',
    category: 'phenomena',
    level: 4,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '普遍的原型人物或主题存在于所有人类文化的集体无意识中。',
    school: 'jung',
  },
  {
    id: 'shadow',
    schoolPerspectives: {
          "jung": "荣格认为阴影是被拒绝的自体部分，包含个人和集体的阴暗面，整合阴影是个性化的关键。",
          "winnicott": "温尼科特强调被压抑的真实自体与阴影的关系。",
          "klein": "克莱因强调投射性认同与阴影的形成。"
    },
    name: '阴影',
    nameEn: 'Shadow',
    description: '荣格概念，个人无意识中被压抑的、不被接受的部分。',
    definition: '阴影是荣格提出的概念，指个人中被压抑的、不被接受的、黑暗的、被不接受的部分。阴影包括被压抑的本能、欲望、情感和人格特质。它是个性化过程中必须面对的部分。',
    example: '一个以温和、善良为主的人可能将自己的攻击性、自私性和欲望压抑到无意识中，但这些被压抑的部分会在其他人身上投射出来。',
    category: 'phenomena',
    level: 4,
    color: '#EC4899',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '人格中被压抑或否认的方面，包含我们不愿承认的品质。',
    school: 'jung',
  },
  {
    id: 'anima_animus',
    schoolPerspectives: {
          "jung": "荣格认为阿尼玛（女性心理）和阿尼姆斯（男性心理）是对性别特征的心理补偿，整合它们是个性化的重要步骤。",
          "lacan": "拉康强调性差异与象征秩序的关系，但不同意荣格的阿尼玛/阿尼姆斯概念。",
          "klein": "克莱因强调性差异与内部客体关系的复杂性。"
    },
    name: '阿尼玛与阿尼姆斯',
    nameEn: 'Anima and Animus',
    description: '荣格概念，男性的女性一面和女性的男性一面。',
    definition: '阿尼玛是男性无意识中的女性一面，阿尼姆斯是女性无意识中的男性一面。它们是荣格原型的一部分，代表了每个人都具有的对立性别特质。与阿尼玛或阿尼姆斯的整合是个性化的重要部分。',
    example: '一个男性可能对一个女性的关注是由于他无意识中的阿尼玛原型被激活了，他在这个女性身上投射了自己的女性特质。',
    category: 'phenomena',
    level: 4,
    color: '#EC4899',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '男性包含女性的无意识方面（阿尼玛），女性包含男性的方面（阿尼姆斯）。',
    school: 'jung',
  },
  {
    id: 'individuation',
    name: '自性化',
    nameEn: 'Individuation',
    description: '荣格概念，个人实现自我、成为真正自己的过程。',
    definition: '自性化是荣格提出的所有心理发展的最终目标。它是个人实现自我、整合个人的各个方面、成为真正自己的过程。这个过程涉及与阴影、阿尼玛、阿尼姆斯等原型的整合。',
    example: '一个人通过分析、沙疗或精神修行逐渐了解自己的不同方面，整合了自己的矛盾，最终成为一个更完整、更真实的自我。',
    category: 'phenomena',
    level: 4,
    color: '#EC4899',
    alternativeNames: ['个性化', '个体化'],
    translationNotes: '自性化是最常用的中文翻译，个性化是较旧的翻译。自性化更体现了对真实自我的追求。',
    
    falsifiability: 1,
    logical_coherence: 2,
    
    coreAssumption: '心理健康涉及整合人格的所有方面，包括无意识的方面。',
    school: 'jung',
  },
  {
    id: 'synchronicity',
    schoolPerspectives: {
          "jung": "荣格认为共时性是有意义的巧合，反映了心理与物理世界的深层联系，超越因果关系。",
          "freud": "弗洛伊德虽未接受共时性，但他的心理决定论与荣格的共时性有对话空间。",
          "lacan": "拉康强调偶然性与必然性的关系，与共时性有相关讨论。"
    },
    name: '共时性',
    nameEn: 'Synchronicity',
    description: '荣格概念，不是由因果关系联系的有意义的巧合。',
    definition: '共时性是荣格提出的概念，指两个或多个事件的有意义的巧合，但不是由因果关系联系的。共时性表明心理事件与物理事件之间可能存在一种深层的联系。',
    example: '一个人正想起一个久违的朋友，然后突然接到了这个朋友的电话，这是共时性的一个例子。',
    category: 'phenomena',
    level: 4,
    color: '#EC4899',
    hasCircularLogic: true,
    circularLogicExplanation: '循环论证：共时性是不可验证的，但任何巧合都可以被解释为共时性的证据，而不是巧合。不存在明确的标准来区分有意义的巧合和纯粹的巧合。',
    
    falsifiability: 1,
    logical_coherence: 1,
    
    coreAssumption: '有意义的巧合反映了心理和物理现实之间的深层联系。',
    school: 'jung',
  },
  {
    id: 'complex',
    schoolPerspectives: {
          "jung": "荣格认为情结是由原型激活的心理组织，具有自主性和情感能量，是心理病理的基础。",
          "freud": "弗洛伊德虽未使用\"情结\"一词，但他的无意识冲突概念与情结有相似性。",
          "klein": "克莱因强调内部客体情结与心理病理的关系。"
    },
    name: '情结',
    nameEn: 'Complex',
    description: '荣格概念，由相似的情感、思想和记忆组成的无意识结构。',
    definition: '情结是荣格提出的概念，指一组由相似的情感、思想、记忆和感受组成的无意识结构。情结具有自主性，影响个人的不同方面，可以引起不同的情感和行为。',
    example: '一个人的"母亲情结"可能会影响他与其他女性的关系，例如他可能对不像母亲的女性不感兴趣。',
    category: 'phenomena',
    level: 4,
    color: '#EC4899',
    
    falsifiability: 2,
    logical_coherence: 2,
    
    coreAssumption: '相关的想法、感情和记忆的集合，通常围绕一个中心主题。',
    school: 'jung',
  },
  {
    id: 'psychological_types',
    name: '心理类型',
    nameEn: 'Psychological Types',
    description: '荣格概念，不同的人格特质类型，如内向干海型、外向干海型等。',
    definition: '心理类型是荣格提出的概念，用于描述不同的人格特质。荣格提出了内向、外向、思维、感受、直觉、感觉等维度，组成了不同的心理类型。',
    example: '内向的人借内部世界获得能量，外向的人借外部世界获得能量。',
    category: 'phenomena',
    level: 4,
    color: '#EC4899',
    
    falsifiability: 2,
    logical_coherence: 3,
    
    coreAssumption: '人类可以根据他们的心理倾向（内向/外向、思维/感觉等）进行分类。',
    school: 'jung',
  },
  {
    id: 'persona',
    name: '人格面具',
    nameEn: 'Persona',
    description: '荣格概念，个人呈现给世界的社会面具。',
    definition: '人格面具是荣格提出的概念，指个人呈现给世界的社会面具。人格面具是为了适应社会而形成的，但过度认同人格面具会导致真实自我的丧失。',
    example: '一个专业人士在工作中呈现的形象（人格面具）可能与他在家中的真实自我完全不同。',
    category: 'phenomena',
    level: 4,
    color: '#EC4899',
    
    falsifiability: 3,
    logical_coherence: 3,
    
    coreAssumption: '我们向世界展现的公众形象，是社会期望和个人选择的混合。',
    school: 'jung',
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
  { source: 'unconscious', target: 'repetition_compulsion', type: 'manifests', strength: 0.9 },
  { source: 'repetition_compulsion', target: 'transference', type: 'relates', strength: 0.8 },

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

  // 拉康理论与无意识
  { source: 'unconscious', target: 'symbolic_order', type: 'relates', strength: 0.9 },
  { source: 'unconscious', target: 'imaginary_order', type: 'relates', strength: 0.8 },
  { source: 'unconscious', target: 'real_order', type: 'relates', strength: 0.8 },
  { source: 'symbolic_order', target: 'desire', type: 'relates', strength: 0.9 },
  { source: 'imaginary_order', target: 'mirror_stage', type: 'relates', strength: 1 },
  { source: 'real_order', target: 'jouissance', type: 'relates', strength: 0.9 },
  { source: 'symbolic_order', target: 'lack', type: 'relates', strength: 0.9 },

  // 拉康象征界内部结构
  { source: 'symbolic_order', target: 'signifier', type: 'contains', strength: 0.9 },
  { source: 'symbolic_order', target: 'signified', type: 'contains', strength: 0.9 },
  { source: 'symbolic_order', target: 'symbolic_chain', type: 'contains', strength: 0.9 },
  { source: 'symbolic_order', target: 'subjectivity', type: 'manifests', strength: 0.9 },
  { source: 'signifier', target: 'signified', type: 'relates', strength: 0.9 },
  { source: 'signifier', target: 'symbolic_chain', type: 'contains', strength: 0.9 },
  { source: 'symbolic_chain', target: 'subjectivity', type: 'relates', strength: 0.8 },
  { source: 'symbolic_order', target: 'big_other', type: 'manifests', strength: 0.9 },
  { source: 'big_other', target: 'subjectivity', type: 'influences', strength: 0.9 },
  { source: 'desire', target: 'objet_petit_a', type: 'relates', strength: 0.9 },
  { source: 'lack', target: 'objet_petit_a', type: 'relates', strength: 0.9 },
  { source: 'objet_petit_a', target: 'jouissance', type: 'relates', strength: 0.8 },

  // 拉康想象界与镜像关系
  { source: 'imaginary_order', target: 'small_other', type: 'manifests', strength: 0.9 },
  { source: 'mirror_stage', target: 'small_other', type: 'relates', strength: 0.9 },
  { source: 'small_other', target: 'big_other', type: 'relates', strength: 0.7 },
  { source: 'imaginary_order', target: 'desire', type: 'relates', strength: 0.7 },

  // 自体心理学与无意识
  { source: 'unconscious', target: 'self', type: 'relates', strength: 0.8 },
  { source: 'self', target: 'selfobject', type: 'contains', strength: 1 },
  { source: 'selfobject', target: 'mirroring', type: 'manifests', strength: 0.9 },
  { source: 'selfobject', target: 'idealization', type: 'manifests', strength: 0.9 },
  { source: 'selfobject', target: 'twinship', type: 'manifests', strength: 0.8 },
  { source: 'empathy', target: 'mirroring', type: 'relates', strength: 0.9 },

  // 客体关系与无意识
  { source: 'unconscious', target: 'object_relations', type: 'relates', strength: 0.9 },
  { source: 'object_relations', target: 'internal_object', type: 'contains', strength: 1 },
  { source: 'internal_object', target: 'projective_identification', type: 'manifests', strength: 0.9 },
  { source: 'internal_object', target: 'introjection', type: 'manifests', strength: 0.9 },
  { source: 'internal_object', target: 'good_bad_object', type: 'manifests', strength: 0.8 },
  { source: 'object_relations', target: 'transitional_object', type: 'relates', strength: 0.8 },
  { source: 'object_relations', target: 'holding_environment', type: 'relates', strength: 0.8 },

  // 幼儿性欲与性心理发展
  { source: 'unconscious', target: 'infantile_sexuality', type: 'relates', strength: 0.9 },
  { source: 'infantile_sexuality', target: 'libido', type: 'manifests', strength: 0.9 },
  { source: 'infantile_sexuality', target: 'oedipus_complex', type: 'relates', strength: 0.9 },
  { source: 'infantile_sexuality', target: 'pleasure_principle', type: 'relates', strength: 0.8 },
  { source: 'id', target: 'infantile_sexuality', type: 'manifests', strength: 0.9 },
  { source: 'infantile_sexuality', target: 'defense_mechanisms', type: 'relates', strength: 0.8 },
  { source: 'infantile_sexuality', target: 'psychic_determinism', type: 'relates', strength: 0.7 },

  // 防御机制与客体关系
  { source: 'defense_mechanisms', target: 'projective_identification', type: 'relates', strength: 0.8 },
  { source: 'defense_mechanisms', target: 'introjection', type: 'relates', strength: 0.8 },

  // 克莱因的位置
  { source: 'object_relations', target: 'paranoid_schizoid', type: 'relates', strength: 0.9 },
  { source: 'object_relations', target: 'depressive_position', type: 'relates', strength: 0.9 },
  { source: 'paranoid_schizoid', target: 'depressive_position', type: 'relates', strength: 0.8 },

  // 温尼科特与客体关系
  { source: 'holding_environment', target: 'true_self', type: 'relates', strength: 0.9 },
  { source: 'holding_environment', target: 'false_self', type: 'relates', strength: 0.8 },
  { source: 'true_self', target: 'false_self', type: 'relates', strength: 0.9 },
  { source: 'transitional_object', target: 'individuation', type: 'relates', strength: 0.7 },

  // 比昂与客体关系
  { source: 'object_relations', target: 'container_contained', type: 'relates', strength: 0.8 },
  { source: 'container_contained', target: 'alpha_function', type: 'relates', strength: 0.9 },
  { source: 'alpha_function', target: 'beta_elements', type: 'relates', strength: 0.9 },
  { source: 'container_contained', target: 'reverie', type: 'relates', strength: 0.8 },
  { source: 'reverie', target: 'empathy', type: 'relates', strength: 0.8 },

  // 费尔贝恩与客体关系
  { source: 'object_relations', target: 'internal_objects_fairbairn', type: 'relates', strength: 0.8 },
  { source: 'internal_objects_fairbairn', target: 'libidinal_object', type: 'manifests', strength: 0.8 },
  { source: 'internal_objects_fairbairn', target: 'exciting_object', type: 'manifests', strength: 0.8 },
  { source: 'internal_objects_fairbairn', target: 'rejecting_object', type: 'manifests', strength: 0.8 },
  { source: 'libidinal_object', target: 'exciting_object', type: 'relates', strength: 0.7 },

  // 荣格理论
  { source: 'unconscious', target: 'collective_unconscious', type: 'relates', strength: 0.8 },
  { source: 'collective_unconscious', target: 'archetype', type: 'contains', strength: 1 },
  { source: 'archetype', target: 'shadow', type: 'relates', strength: 0.9 },
  { source: 'archetype', target: 'anima_animus', type: 'relates', strength: 0.9 },
  { source: 'shadow', target: 'individuation', type: 'relates', strength: 0.9 },
  { source: 'anima_animus', target: 'individuation', type: 'relates', strength: 0.9 },
  { source: 'individuation', target: 'self', type: 'relates', strength: 0.8 },
  { source: 'collective_unconscious', target: 'synchronicity', type: 'relates', strength: 0.7 },
  { source: 'collective_unconscious', target: 'complex', type: 'relates', strength: 0.8 },
  { source: 'psychological_types', target: 'persona', type: 'relates', strength: 0.8 },
  { source: 'persona', target: 'shadow', type: 'relates', strength: 0.9 },

  // 跨学派连接
  { source: 'repression', target: 'shadow', type: 'relates', strength: 0.8 },
  { source: 'defense_mechanisms', target: 'persona', type: 'relates', strength: 0.7 },
  { source: 'transference', target: 'container_contained', type: 'relates', strength: 0.7 },
  { source: 'symbolic_order', target: 'subjectivity', type: 'relates', strength: 0.8 },
  { source: 'infantile_sexuality', target: 'true_self', type: 'relates', strength: 0.7 },
];

export const references: Reference[] = [
  {
    id: 'freud-unconscious',
    title: '《梦的解析》',
    author: '西格蒙德·弗洛伊德',
    year: 1900,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=梦的解析+弗洛伊德',
    scholarUrl: 'https://scholar.google.com/scholar?q=The+Interpretation+of+Dreams+Freud'
  },
  {
    id: 'freud-ego-defense',
    title: '《自我与防御机制》',
    author: '安娜·弗洛伊德',
    year: 1936,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=自我与防御机制+安娜弗洛伊德',
    scholarUrl: 'https://scholar.google.com/scholar?q=The+Ego+and+the+Mechanisms+of+Defence+Anna+Freud'
  },
  {
    id: 'freud-interpretation-dreams',
    title: '《精神分析引论》',
    author: '西格蒙德·弗洛伊德',
    year: 1917,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=精神分析引论+弗洛伊德',
    scholarUrl: 'https://scholar.google.com/scholar?q=Introductory+Lectures+on+Psychoanalysis+Freud'
  },
  {
    id: 'anna-freud-defense',
    title: '《防御机制与人格发展》',
    author: '安娜·弗洛伊德',
    year: 1965,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=防御机制+安娜弗洛伊德',
    scholarUrl: 'https://scholar.google.com/scholar?q=Defense+mechanisms+Anna+Freud'
  },
  {
    id: 'jung-archetypes',
    title: '《原型与集体无意识》',
    author: '卡尔·荣格',
    year: 1959,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=原型与集体无意识+荣格',
    scholarUrl: 'https://scholar.google.com/scholar?q=The+Archetypes+and+the+Collective+Unconscious+Jung'
  },
  {
    id: 'jung-collective-unconscious',
    title: '《心理学与宗教》',
    author: '卡尔·荣格',
    year: 1940,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=心理学与宗教+荣格',
    scholarUrl: 'https://scholar.google.com/scholar?q=Psychology+and+Religion+Jung'
  },
  {
    id: 'lacan-mirror-stage',
    title: '《镜像阶段论文集》',
    author: '雅克·拉康',
    year: 1949,
    type: 'paper',
    doubanUrl: 'https://book.douban.com/search?q=镜像阶段+拉康',
    scholarUrl: 'https://scholar.google.com/scholar?q=Mirror+Stage+Lacan'
  },
  {
    id: 'lacan-symbolic-order',
    title: '《象征、想象、实在》',
    author: '雅克·拉康',
    year: 1953,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=象征想象实在+拉康',
    scholarUrl: 'https://scholar.google.com/scholar?q=Symbolic+Imaginary+Real+Lacan'
  },
  {
    id: 'klein-object-relations',
    title: '《客体关系理论与精神分析实践》',
    author: '梅兰妮·克莱因',
    year: 1946,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=客体关系+克莱因',
    scholarUrl: 'https://scholar.google.com/scholar?q=Object+Relations+Klein'
  },
  {
    id: 'klein-paranoid-depressive',
    title: '《偏执-分裂位置与抑郁位置》',
    author: '梅兰妮·克莱因',
    year: 1935,
    type: 'paper',
    doubanUrl: 'https://book.douban.com/search?q=偏执分裂位置+克莱因',
    scholarUrl: 'https://scholar.google.com/scholar?q=Paranoid-Schizoid+Depressive+Position+Klein'
  },
  {
    id: 'kohut-selfobject',
    title: '《自体的分析》',
    author: '海因茨·科胡特',
    year: 1977,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=自体的分析+科胡特',
    scholarUrl: 'https://scholar.google.com/scholar?q=The+Analysis+of+the+Self+Kohut'
  },
  {
    id: 'kohut-self-psychology',
    title: '《自体心理学与人文精神》',
    author: '海因茨·科胡特',
    year: 1985,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=自体心理学+科胡特',
    scholarUrl: 'https://scholar.google.com/scholar?q=Self+Psychology+Kohut'
  },
  {
    id: 'winnicott-holding-environment',
    title: '《抱持环境与心理发展》',
    author: '唐纳德·温尼科特',
    year: 1960,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=抱持环境+温尼科特',
    scholarUrl: 'https://scholar.google.com/scholar?q=Holding+Environment+Winnicott'
  },
  {
    id: 'winnicott-transitional-objects',
    title: '《过渡现象与过渡客体》',
    author: '唐纳德·温尼科特',
    year: 1953,
    type: 'paper',
    doubanUrl: 'https://book.douban.com/search?q=过渡客体+温尼科特',
    scholarUrl: 'https://scholar.google.com/scholar?q=Transitional+Objects+Winnicott'
  },
  {
    id: 'winnicott-true-false-self',
    title: '《真实自体与虚假自体》',
    author: '唐纳德·温尼科特',
    year: 1960,
    type: 'paper',
    doubanUrl: 'https://book.douban.com/search?q=真实自体+温尼科特',
    scholarUrl: 'https://scholar.google.com/scholar?q=True+Self+False+Self+Winnicott'
  },
  {
    id: 'bion-container-contained',
    title: '《容器与被容纳物》',
    author: '威尔弗雷德·比昂',
    year: 1962,
    type: 'paper',
    doubanUrl: 'https://book.douban.com/search?q=容器与被容纳物+比昂',
    scholarUrl: 'https://scholar.google.com/scholar?q=Container-Contained+Bion'
  },
  {
    id: 'bion-alpha-function',
    title: '《α功能与心理消化》',
    author: '威尔弗雷德·比昂',
    year: 1963,
    type: 'paper',
    doubanUrl: 'https://book.douban.com/search?q=α功能+比昂',
    scholarUrl: 'https://scholar.google.com/scholar?q=Alpha+Function+Bion'
  },
  {
    id: 'transference-countertransference',
    title: '《移情与反移情》',
    author: '多位作者',
    year: 1956,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=移情与反移情',
    scholarUrl: 'https://scholar.google.com/scholar?q=Transference+Countertransference'
  },
  {
    id: 'psychoanalytic-therapy',
    title: '《现代精神分析治疗》',
    author: '多位作者',
    year: 2000,
    type: 'book',
    doubanUrl: 'https://book.douban.com/search?q=精神分析治疗',
    scholarUrl: 'https://scholar.google.com/scholar?q=Psychoanalytic+Therapy'
  },
];

// 为节点添加参考文献关联
export const nodeReferences: Record<string, string[]> = {
  unconscious: ['freud-unconscious', 'freud-interpretation-dreams', 'freud-ego-defense'],
  id: ['freud-ego-defense', 'freud-interpretation-dreams'],
  ego: ['freud-ego-defense'],
  superego: ['freud-ego-defense'],
  repression: ['freud-interpretation-dreams', 'anna-freud-defense'],
  denial: ['anna-freud-defense'],
  projection: ['anna-freud-defense'],
  displacement: ['anna-freud-defense'],
  sublimation: ['anna-freud-defense'],
  rationalization: ['anna-freud-defense'],
  archetype: ['jung-archetypes', 'jung-collective-unconscious'],
  shadow: ['jung-archetypes'],
  anima_animus: ['jung-archetypes'],
  synchronicity: ['jung-collective-unconscious'],
  mirror_stage: ['lacan-mirror-stage'],
  imaginary_order: ['lacan-symbolic-order'],
  symbolic_order: ['lacan-symbolic-order'],
  real_order: ['lacan-symbolic-order'],
  lack: ['lacan-symbolic-order'],
  desire: ['lacan-symbolic-order'],
  jouissance: ['lacan-symbolic-order'],
  object_relations: ['klein-object-relations'],
  internal_object: ['klein-object-relations'],
  good_bad_object: ['klein-paranoid-depressive'],
  paranoid_schizoid: ['klein-paranoid-depressive'],
  depressive_position: ['klein-paranoid-depressive'],
  projective_identification: ['klein-object-relations'],
  introjection: ['klein-object-relations'],
  holding_environment: ['winnicott-holding-environment', 'klein-object-relations'],
  transitional_object: ['winnicott-transitional-objects', 'klein-object-relations'],
  true_self: ['winnicott-true-false-self', 'freud-ego-defense'],
  false_self: ['winnicott-true-false-self', 'freud-ego-defense'],
  selfobject: ['kohut-selfobject', 'kohut-self-psychology'],
  mirroring: ['kohut-self-psychology'],
  idealization: ['kohut-self-psychology'],
  twinship: ['kohut-self-psychology'],
  empathy: ['kohut-self-psychology'],
  transference: ['transference-countertransference'],
  countertransference: ['transference-countertransference'],
  free_association: ['freud-interpretation-dreams'],
  dream_analysis: ['freud-interpretation-dreams'],
  psychoanalytic_therapy: ['psychoanalytic-therapy'],
  defense_mechanisms: ['anna-freud-defense', 'freud-ego-defense'],
  oedipus_complex: ['freud-interpretation-dreams', 'freud-ego-defense'],
  libido: ['freud-interpretation-dreams', 'freud-ego-defense'],
  pleasure_principle: ['freud-ego-defense', 'freud-interpretation-dreams'],
  reality_principle: ['freud-ego-defense'],
  moral_principle: ['freud-ego-defense'],
  psychic_determinism: ['freud-interpretation-dreams', 'freud-ego-defense'],
  infantile_sexuality: ['freud-interpretation-dreams', 'freud-ego-defense'],
  resistance: ['transference-countertransference', 'freud-interpretation-dreams'],
  interpretation: ['freud-interpretation-dreams', 'freud-ego-defense'],
  signifier: ['lacan-symbolic-order'],
  signified: ['lacan-symbolic-order'],
  symbolic_chain: ['lacan-symbolic-order'],
  subjectivity: ['lacan-symbolic-order'],
  big_other: ['lacan-symbolic-order'],
  small_other: ['lacan-symbolic-order'],
  objet_petit_a: ['lacan-symbolic-order'],
  individuation: ['jung-archetypes'],
  collective_unconscious: ['jung-collective-unconscious'],
  persona: ['jung-archetypes'],
  self: ['jung-archetypes'],
  complex: ['jung-collective-unconscious'],
  container_contained: ['bion-container-contained'],
  alpha_function: ['bion-alpha-function'],
  beta_elements: ['bion-alpha-function'],
  reverie: ['bion-container-contained'],
  internal_objects_fairbairn: ['klein-object-relations'],
  libidinal_object: ['klein-object-relations'],
  exciting_object: ['klein-object-relations'],
  rejecting_object: ['klein-object-relations'],
};

// 学派标签定义
export const schoolLabels: Record<string, string> = {
  freud: '弗洛伊德',
  lacan: '拉康',
  jung: '荣格',
  klein: '克莱因',
  kohut: '科胡特',
  winnicott: '温尼科特',
  bion: '比昂',
  fairbairn: '费尔贝恩',
};

// 学派颜色定义
export const schoolColors: Record<string, string> = {
  freud: '#3B82F6',      // 蓝色
  lacan: '#EC4899',      // 粉色
  jung: '#8B5CF6',       // 紫色
  klein: '#F59E0B',      // 橙色
  kohut: '#10B981',      // 绿色
  winnicott: '#06B6D4',  // 青绿色
  bion: '#F87171',       // 红色
  fairbairn: '#EC4899',  // 粉色
};

// 分类标签定义
export const categoryLabels: Record<string, string> = {
  core: '核心概念',
  personality: '人格结构',
  defense: '防御机制',
  therapy: '治疗方法',
  phenomena: '心理现象',
  theorist: '理论家',
  lacan: '拉康理论',
  self_psychology: '自体心理学',
  object_relations: '客体关系',
};
