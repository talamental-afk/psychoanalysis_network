#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为新发现的循环论证概念添加标记和详细说明
"""

import re

# 新发现的循环论证概念及其详细说明
new_circular_concepts = {
    'mirroring': {
        'argumentProcess': '科胡特论证：(1)自体需要他人的镜像反映；(2)镜像反映导致健康的自体感；(3)健康的自体感证明了镜像反映的存在。',
        'logicalProblem': '但健康的自体感也可能来自其他因素（如遗传、环保境）。镜像反映的过程本身是无法直接观察的，我们只能通过结果来推断。',
        'circularChain': ['自体需要镜像', '定义为他人反映', '自体感发展', '发展成为镜像反映的证据'],
        'academicSignificance': '这个循环论证说明了科胡特理论中，镜像反映是一个难以独立验证的概念。'
    },
    'object_relations': {
        'argumentProcess': '客体关系论证：(1)人格由早期关系塑造；(2)这些关系被内化为内部客体；(3)内部客体的存在解释了人格特征。',
        'logicalProblem': '但内部客体是不可观察的。我们如何知道它们是否真的存在？任何人格特征都可以被解释为内部客体的结果。',
        'circularChain': ['早期关系', '内化为客体', '塑造人格', '人格特征证实客体'],
        'academicSignificance': '这个循环论证表明，客体关系理论中的内部客体是一个无法被证伪的假设。'
    },
    'projective_identification': {
        'argumentProcess': '克莱因论证：(1)个体将自己的部分投射到他人；(2)他人因此改变了行为；(3)他人的改变证明了投射认同的存在。',
        'logicalProblem': '但他人的行为改变也可能有其他原因。投射认同的过程本身是无法直接观察的，我们只能通过推断来确认。',
        'circularChain': ['个体投射', '他人接纳', '他人行为改变', '改变证实投射认同'],
        'academicSignificance': '这个循环论证说明了投射认同是一个难以独立验证的防御机制。'
    },
    'paranoid_schizoid': {
        'argumentProcess': '克莱因论证：(1)婴儿处于偏执-分裂位置；(2)婴儿使用分裂和投射认同；(3)婴儿的行为表现出这些防御机制。',
        'logicalProblem': '但婴儿的行为也可能有其他解释。我们无法直接观察婴儿的心理位置，只能通过推断来确认。',
        'circularChain': ['假设偏执-分裂位置', '观察到分裂行为', '用位置解释行为', '行为证实位置'],
        'academicSignificance': '这个循环论证表明，克莱因的发展阶段理论中，心理位置是一个难以独立验证的概念。'
    },
    'container_contained': {
        'argumentProcess': '比昂论证：(1)分析师是容器，患者是被容纳物；(2)分析师进行心理消化；(3)患者的改变证明了容纳过程的存在。',
        'logicalProblem': '但患者的改变也可能来自其他因素。心理消化的过程本身是无法直接观察的，我们只能通过结果来推断。',
        'circularChain': ['患者投射', '分析师容纳', '心理消化假设', '患者改变证实容纳'],
        'academicSignificance': '这个循环论证说明了比昂理论中，心理容纳是一个无法被证伪的过程。'
    },
    'archetype': {
        'argumentProcess': '荣格论证：(1)原型存在于集体无意识；(2)原型在神话和文化中表现；(3)这些表现证明了原型的存在。',
        'logicalProblem': '但文化中的相似主题也可能来自文化传播或人类的共同需求，而不是原型。任何文化现象都可以被解释为原型的表现。',
        'circularChain': ['假设原型存在', '观察到文化相似性', '用原型解释相似性', '相似性证实原型'],
        'academicSignificance': '这个循环论证表明，原型是一个无法被证伪的假设。'
    },
    'individuation': {
        'argumentProcess': '荣格论证：(1)自性化是心理发展的目标；(2)自性化涉及整合所有心理方面；(3)心理健康的人实现了自性化。',
        'logicalProblem': '但什么是"整合所有方面"？这个目标本身是模糊的。任何心理状态都可以被解释为自性化过程的一部分。',
        'circularChain': ['定义自性化目标', '整合心理方面', '观察到改变', '改变证实自性化'],
        'academicSignificance': '这个循环论证说明了自性化是一个难以明确定义和验证的概念。'
    },
    'dream_analysis': {
        'argumentProcess': '弗洛伊德论证：(1)梦是无意识的表现；(2)通过分析梦可以理解无意识；(3)分析师的解释证明了梦的含义。',
        'logicalProblem': '但梦的含义是由分析师解释的，而不是客观的。不同的分析师可能给出不同的解释，都声称反映了患者的无意识。',
        'circularChain': ['梦是无意识表现', '分析师解释梦', '患者接受解释', '接受证实解释'],
        'academicSignificance': '这个循环论证表明，梦的分析在很大程度上依赖于分析师的主观解释。'
    },
    'reality_principle': {
        'argumentProcess': '弗洛伊德论证：(1)自我遵循现实原则；(2)现实原则指考虑现实约束；(3)个体的理性行为证明了现实原则的存在。',
        'logicalProblem': '但理性行为也可能来自学习或本能，而不是遵循现实原则。现实原则本身是一个模糊的概念。',
        'circularChain': ['定义现实原则', '观察到理性行为', '用原则解释行为', '行为证实原则'],
        'academicSignificance': '这个循环论证说明了现实原则是一个难以独立验证的概念。'
    },
    'moral_principle': {
        'argumentProcess': '弗洛伊德论证：(1)超我遵循道德原则；(2)道德原则指内化的道德标准；(3)个体的道德行为证明了超我的存在。',
        'logicalProblem': '但道德行为也可能来自社会学习或理性思考，而不是超我。超我的存在本身是无法直接观察的。',
        'circularChain': ['定义道德原则', '观察到道德行为', '用超我解释行为', '行为证实超我'],
        'academicSignificance': '这个循环论证表明，超我和道德原则是难以独立验证的心理结构。'
    }
}

# 读取数据文件
with open('psychoanalysis_data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 为每个概念添加循环论证标记
for concept_id, data in new_circular_concepts.items():
    # 查找该概念的位置
    pattern = rf"(id:\s*'{concept_id}'[^}}]*?)(hasCircularLogic:\s*false|(?!hasCircularLogic))"
    
    # 构建新的循环论证信息
    new_circular_section = f"""hasCircularLogic: true,
    argumentProcess: '{data['argumentProcess']}',
    logicalProblem: '{data['logicalProblem']}',
    circularChain: {data['circularChain']},
    academicSignificance: '{data['academicSignificance']}',
    """
    
    # 替换或添加循环论证标记
    if f"id: '{concept_id}'" in content:
        # 检查是否已有hasCircularLogic标记
        concept_pattern = rf"(id:\s*'{concept_id}'[^}}]*?)(hasCircularLogic:\s*false)"
        
        if re.search(concept_pattern, content, re.DOTALL):
            # 替换已有的false标记
            content = re.sub(
                concept_pattern,
                rf"\1{new_circular_section}",
                content,
                flags=re.DOTALL
            )
        else:
            # 在color字段后添加
            pattern = rf"(id:\s*'{concept_id}'[^}}]*?color:\s*'[^']*',)"
            replacement = rf"\1\n    {new_circular_section}"
            content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# 写回文件
with open('psychoanalysis_data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ 已为 {len(new_circular_concepts)} 个新概念添加循环论证标记")
for concept_id in new_circular_concepts.keys():
    print(f"  - {concept_id}")
