#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
系统分析所有概念节点，识别潜在的循环论证
使用更可靠的方法来解析TypeScript数据
"""

import re
import ast
from typing import List, Dict, Tuple

# 读取数据文件
with open('psychoanalysis_data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取概念数组部分
concepts_match = re.search(r'export const conceptNodes: ConceptNode\[\] = \[(.*?)\];', content, re.DOTALL)
if not concepts_match:
    print("无法找到概念数组")
    exit(1)

concepts_text = concepts_match.group(1)

# 按照 { id: 'xxx', ... } 的模式分割
# 使用更简单的方法：按照 id: 'xxx' 来分割
concept_blocks = re.split(r'(?=\s*{\s*id:)', concepts_text)

concepts = []

for block in concept_blocks:
    if not block.strip():
        continue
    
    # 提取 id
    id_match = re.search(r"id:\s*'([^']+)'", block)
    if not id_match:
        continue
    
    concept_id = id_match.group(1)
    
    # 提取 name
    name_match = re.search(r"name:\s*'([^']*(?:\\'[^']*)*)'", block)
    name = name_match.group(1).replace("\\'", "'") if name_match else ""
    
    # 提取 definition
    def_match = re.search(r"definition:\s*'([^']*(?:\\'[^']*)*)'", block)
    definition = def_match.group(1).replace("\\'", "'") if def_match else ""
    
    # 提取 coreAssumption
    core_match = re.search(r"coreAssumption:\s*'([^']*(?:\\'[^']*)*)'", block)
    core_assumption = core_match.group(1).replace("\\'", "'") if core_match else ""
    
    # 提取 hasCircularLogic
    circular_match = re.search(r"hasCircularLogic:\s*(true|false)", block)
    has_circular = circular_match.group(1) == 'true' if circular_match else False
    
    # 提取 circularLogicExplanation
    circular_exp_match = re.search(r"circularLogicExplanation:\s*'([^']*(?:\\'[^']*)*)'", block)
    circular_explanation = circular_exp_match.group(1).replace("\\'", "'") if circular_exp_match else ""
    
    concepts.append({
        'id': concept_id,
        'name': name,
        'definition': definition,
        'coreAssumption': core_assumption,
        'hasCircularLogic': has_circular,
        'circularLogicExplanation': circular_explanation
    })

print(f"✅ 总共找到 {len(concepts)} 个概念\n")

# 统计已标记的循环论证
circular_marked = [c for c in concepts if c['hasCircularLogic']]
print(f"已标记为循环论证的概念：{len(circular_marked)} 个")
for c in circular_marked:
    print(f"  - {c['id']} ({c['name']})")

print("\n" + "="*80)
print("分析未标记的概念，寻找潜在的循环论证")
print("="*80)

not_circular = [c for c in concepts if not c['hasCircularLogic']]

# 循环论证的特征：
# 1. 定义中使用了要定义的概念本身（自我定义）
# 2. 核心假设与结论相同或相似（同义反复）
# 3. 用现象来证明理论，用理论来解释现象（循环验证）
# 4. 缺乏独立的验证标准（无法证伪）

circular_candidates = []

for concept in not_circular:
    concept_id = concept['id']
    name = concept['name'].lower()
    definition = concept['definition'].lower()
    core_assumption = concept['coreAssumption'].lower()
    
    reasons = []
    
    # 检查1：自我定义 - 定义中包含概念名称
    name_words = [w for w in name.split() if len(w) > 2]
    for word in name_words:
        if word in definition:
            reasons.append(f"自我定义：定义中包含'{word}'")
            break
    
    # 检查2：同义反复 - 定义和假设相似
    def_words = set(definition.split())
    core_words = set(core_assumption.split())
    overlap = len(def_words & core_words)
    if overlap > len(def_words) * 0.5 and len(def_words) > 5:
        reasons.append(f"同义反复：定义和假设有{overlap}个相同词汇")
    
    # 检查3：无法证伪 - 使用过于宽泛的量词
    unfalsifiable_terms = ['存在', '可能', '所有', '任何', '总是', '必然', '本质', '本来', '内在', '固有', '倾向', '趋势']
    unfalsifiable_count = sum(1 for term in unfalsifiable_terms if term in core_assumption)
    if unfalsifiable_count >= 2:
        reasons.append(f"无法证伪：使用了{unfalsifiable_count}个模糊量词")
    
    # 检查4：不可观察的过程
    unobservable_terms = ['无意识', '潜意识', '内在', '心理', '投射', '移情', '防御', '幻想', '象征', '原型']
    unobservable_count = sum(1 for term in unobservable_terms if term in definition)
    if unobservable_count >= 2:
        reasons.append(f"不可观察：涉及{unobservable_count}个不可观察的过程")
    
    # 检查5：循环验证 - 用现象来证明理论
    verification_terms = ['证明', '表现', '体现', '反映', '显示', '表现为', '表现出']
    if any(term in definition for term in verification_terms):
        reasons.append("循环验证：用现象来证明理论")
    
    if reasons:
        circular_candidates.append((concept_id, concept['name'], reasons))

print(f"\n找到 {len(circular_candidates)} 个潜在的循环论证概念\n")

# 按照原因数量排序（原因越多，越可能是循环论证）
circular_candidates.sort(key=lambda x: len(x[2]), reverse=True)

for i, (concept_id, name, reasons) in enumerate(circular_candidates, 1):
    concept = next((c for c in not_circular if c['id'] == concept_id), None)
    if concept:
        print(f"{i}. {concept_id} ({name})")
        for reason in reasons:
            print(f"   ⚠️  {reason}")
        print(f"   定义: {concept['definition'][:100]}...")
        print(f"   假设: {concept['coreAssumption'][:100]}...")
        print()

print("\n" + "="*80)
print(f"建议：将以下 {min(10, len(circular_candidates))} 个概念标记为循环论证")
print("="*80)
for i, (concept_id, name, reasons) in enumerate(circular_candidates[:10], 1):
    print(f"{i}. {concept_id}")
