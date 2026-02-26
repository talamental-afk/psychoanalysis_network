#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为新概念添加circularLogicExplanation字段
"""

import re

# 新概念的circularLogicExplanation
explanations = {
    'mirroring': '镜像反映是科胡特理论中的关键概念，但其论证存在循环性：定义为他人的认可和反映，然后用个体的健康发展来证明镜像反映的存在。这个过程中，我们无法独立验证镜像反映的存在，只能通过其假设的结果来推断。',
    'object_relations': '客体关系理论强调内部客体的作用，但这些客体是不可观察的。任何人格特征都可以被解释为内部客体的结果，这使得理论无法被证伪。',
    'projective_identification': '投射认同是克莱因提出的防御机制，但其过程是无法直接观察的。我们只能通过他人的行为改变来推断投射认同的存在，这形成了一个循环论证。',
    'paranoid_schizoid': '偏执-分裂位置是克莱因的发展阶段理论，但我们无法直接观察婴儿的心理位置。任何婴儿的行为都可以被解释为这个位置的表现，使得理论难以被证伪。',
    'container_contained': '比昂的容器-被容纳物理论描述了分析师与患者之间的关系，但心理容纳的过程是无法直接观察的。患者的改变可能有多种原因，不一定是心理容纳的结果。',
    'archetype': '原型是荣格理论中的核心概念，但其存在无法直接证明。文化中的相似主题可能来自多种原因，不一定是原型。任何文化现象都可以被解释为原型的表现。',
    'individuation': '自性化是荣格提出的心理发展目标，但其定义过于宽泛。任何心理变化都可以被解释为自性化过程的一部分，使得理论无法被证伪。',
    'dream_analysis': '梦的分析是精神分析的重要技术，但梦的含义是由分析师解释的。不同的分析师可能给出不同的解释，都声称反映了患者的无意识。',
    'reality_principle': '现实原则是自我遵循的原则，但其定义过于宽泛。任何理性行为都可以被解释为遵循现实原则，使得理论难以被证伪。',
    'moral_principle': '道德原则是超我遵循的原则，但超我的存在本身是无法直接观察的。任何道德行为都可以被解释为超我的作用。'
}

# 读取数据文件
with open('psychoanalysis_data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 为每个概念添加circularLogicExplanation
for concept_id, explanation in explanations.items():
    # 查找该概念的位置
    pattern = rf"(id:\s*'{concept_id}'[^}}]*?hasCircularLogic:\s*true,)"
    
    # 检查是否已有circularLogicExplanation
    if f"id: '{concept_id}'" in content:
        # 查找该概念的完整块
        concept_start = content.find(f"id: '{concept_id}'")
        if concept_start == -1:
            continue
        
        # 找到该概念块的结束（下一个 },）
        concept_end = content.find("},", concept_start)
        if concept_end == -1:
            continue
        
        concept_block = content[concept_start:concept_end]
        
        # 检查是否已有circularLogicExplanation
        if 'circularLogicExplanation:' not in concept_block:
            # 在hasCircularLogic: true后添加circularLogicExplanation
            old_block = concept_block
            new_block = old_block.replace(
                'hasCircularLogic: true,',
                f"hasCircularLogic: true,\n    circularLogicExplanation: '{explanation}',"
            )
            content = content.replace(old_block, new_block)

# 写回文件
with open('psychoanalysis_data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ 已为 {len(explanations)} 个新概念添加 circularLogicExplanation 字段")
for concept_id in explanations.keys():
    print(f"  - {concept_id}")
