#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
系统分析所有概念节点，识别潜在的循环论证
"""

import re
import json
from typing import List, Dict, Set, Tuple

# 读取数据文件
with open('psychoanalysis_data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取所有概念节点
pattern = r"{\s*id:\s*'([^']+)'[^}]*?(?:definition|description):\s*'([^']*)'[^}]*?(?:coreAssumption):\s*'([^']*)'[^}]*?(?:hasCircularLogic):\s*(true|false)[^}]*?}"
matches = re.finditer(pattern, content, re.DOTALL)

concepts = []
for match in matches:
    concept_id = match.group(1)
    definition = match.group(2)[:200] if match.group(2) else ""
    core_assumption = match.group(3)[:200] if match.group(3) else ""
    has_circular = match.group(4) == 'true'
    
    concepts.append({
        'id': concept_id,
        'definition': definition,
        'coreAssumption': core_assumption,
        'hasCircularLogic': has_circular
    })

print(f"总共找到 {len(concepts)} 个概念")
print("\n" + "="*80)
print("已标记为循环论证的概念：")
print("="*80)

circular_marked = [c for c in concepts if c['hasCircularLogic']]
for i, c in enumerate(circular_marked, 1):
    print(f"\n{i}. {c['id']}")
    print(f"   定义: {c['definition'][:100]}...")
    print(f"   核心假设: {c['coreAssumption'][:100]}...")

print("\n" + "="*80)
print("未标记为循环论证的概念（需要进一步分析）：")
print("="*80)

not_circular = [c for c in concepts if not c['hasCircularLogic']]

# 循环论证的特征：
# 1. 定义中使用了要定义的概念本身
# 2. 核心假设与结论相同或相似
# 3. 用现象来证明理论，用理论来解释现象
# 4. 缺乏独立的验证标准

circular_candidates = []

for concept in not_circular:
    concept_id = concept['id']
    definition = concept['definition'].lower()
    core_assumption = concept['coreAssumption'].lower()
    
    # 检查1：定义中是否包含概念名称本身（可能是自我定义）
    if concept_id.replace('_', ' ') in definition or concept_id.replace('_', '') in definition:
        circular_candidates.append((concept_id, "自我定义：定义中包含概念名称本身"))
        continue
    
    # 检查2：核心假设是否过于宽泛，导致无法证伪
    vague_terms = ['存在', '可能', '所有', '任何', '总是', '必然', '本质', '本来', '内在', '固有']
    if any(term in core_assumption for term in vague_terms):
        # 进一步检查是否有明确的否定条件
        if '不' not in core_assumption and '无' not in core_assumption:
            circular_candidates.append((concept_id, "过于宽泛的假设：使用模糊的量词"))
            continue
    
    # 检查3：是否涉及无意识或不可观察的过程
    unobservable_terms = ['无意识', '潜意识', '内在', '心理', '投射', '移情', '防御', '幻想']
    if any(term in definition for term in unobservable_terms):
        circular_candidates.append((concept_id, "不可观察的过程：难以独立验证"))
        continue

print(f"\n找到 {len(circular_candidates)} 个潜在的循环论证概念：\n")

for i, (concept_id, reason) in enumerate(circular_candidates, 1):
    concept = next((c for c in not_circular if c['id'] == concept_id), None)
    if concept:
        print(f"{i}. {concept_id}")
        print(f"   原因: {reason}")
        print(f"   定义: {concept['definition'][:80]}...")
        print(f"   核心假设: {concept['coreAssumption'][:80]}...")
        print()

print("\n" + "="*80)
print("建议标记为循环论证的概念（按优先级）：")
print("="*80)

# 优先级排序：自我定义 > 不可观察 > 过于宽泛
priority_candidates = []
for concept_id, reason in circular_candidates:
    if "自我定义" in reason:
        priority = 1
    elif "不可观察" in reason:
        priority = 2
    else:
        priority = 3
    priority_candidates.append((priority, concept_id, reason))

priority_candidates.sort()

for priority, concept_id, reason in priority_candidates[:20]:  # 显示前20个
    concept = next((c for c in not_circular if c['id'] == concept_id), None)
    if concept:
        print(f"\n优先级 {priority}: {concept_id}")
        print(f"  原因: {reason}")
        print(f"  定义: {concept['definition'][:100]}...")
