#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复缺失的循环论证字段
"""

import re

# 需要修复的概念及其循环论证信息
fixes = {
    'archetype': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '原型是荣格理论中的核心概念，但其存在无法直接证明。文化中的相似主题可能来自多种原因，不一定是原型。任何文化现象都可以被解释为原型的表现。',
        'argumentProcess': '荣格论证：(1)世界各地文化中有相似的人物形象和主题；(2)这些相似性说明存在普遍的原型；(3)原型存在解释了这些相似性。',
        'logicalProblem': '但相似的文化主题也可能来自历史接触、相似的环境条件或人类共同的心理需求。我们无法直接观察原型，只能通过文化现象来推断。',
        'circularChain': ['文化相似性', '推断原型存在', '原型解释相似性', '回到第1步']
    },
    'object_relations': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '客体关系理论强调内部客体的作用，但这些客体是不可观察的。任何人格特征都可以被解释为内部客体的结果，这使得理论无法被证伪。',
        'argumentProcess': '克莱因论证：(1)个体内部有内部客体；(2)内部客体影响人格和行为；(3)人格特征证明了内部客体的存在。',
        'logicalProblem': '但人格特征也可能来自其他因素（遗传、环境、学习）。内部客体是不可观察的，我们只能通过其假设的结果来推断。',
        'circularChain': ['个体有内部客体', '定义为影响人格', '人格特征表现', '证明内部客体存在']
    },
    'projective_identification': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '投射认同是克莱因提出的防御机制，但其过程是无法直接观察的。我们只能通过他人的行为改变来推断投射认同的存在，这形成了一个循环论证。',
        'argumentProcess': '克莱因论证：(1)个体将内部冲突投射到他人身上；(2)他人受到投射的影响而改变行为；(3)他人的行为改变证明了投射认同的存在。',
        'logicalProblem': '但他人的行为改变也可能有其他原因。投射认同的过程本身是无法直接观察的，我们只能通过结果来推断。',
        'circularChain': ['内部冲突', '投射到他人', '他人行为改变', '证明投射认同']
    },
    'paranoid_schizoid': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '偏执-分裂位置是克莱因的发展阶段理论，但我们无法直接观察婴儿的心理位置。任何婴儿的行为都可以被解释为这个位置的表现，使得理论难以被证伪。',
        'argumentProcess': '克莱因论证：(1)婴儿处于偏执-分裂位置；(2)这个位置导致特定的心理防御和行为；(3)观察到的婴儿行为证明了这个位置的存在。',
        'logicalProblem': '但任何婴儿行为都可以被解释为偏执-分裂位置的表现。我们无法直接观察心理位置，只能通过行为来推断。',
        'circularChain': ['婴儿心理位置', '导致特定防御', '观察到特定行为', '证明心理位置']
    },
    'container_contained': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '比昂的容器-被容纳物理论描述了分析师与患者之间的关系，但心理容纳的过程是无法直接观察的。患者的改变可能有多种原因，不一定是心理容纳的结果。',
        'argumentProcess': '比昂论证：(1)分析师作为容器容纳患者的情感；(2)心理容纳导致患者的改变；(3)患者的改变证明了心理容纳的存在。',
        'logicalProblem': '但患者的改变也可能来自其他因素（自我反思、时间流逝、其他关系）。心理容纳的过程本身是无法直接观察的。',
        'circularChain': ['分析师容纳情感', '患者获得改变', '改变证明容纳', '循环验证']
    },
    'individuation': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '自性化是荣格提出的心理发展目标，但其定义过于宽泛。任何心理变化都可以被解释为自性化过程的一部分，使得理论无法被证伪。',
        'argumentProcess': '荣格论证：(1)个体有自性化的潜力；(2)自性化导致心理成长和整合；(3)任何心理成长都是自性化的表现。',
        'logicalProblem': '但自性化的定义过于宽泛，任何心理变化都可以被解释为自性化。这使得理论无法被证伪。',
        'circularChain': ['个体有自性化潜力', '定义为心理整合', '观察心理成长', '证明自性化']
    },
    'dream_analysis': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '梦的分析是精神分析的重要技术，但梦的含义是由分析师解释的。不同的分析师可能给出不同的解释，都声称反映了患者的无意识。',
        'argumentProcess': '弗洛伊德论证：(1)梦是无意识的表达；(2)分析师解释梦的含义；(3)患者的反应或改变证明了解释的正确性。',
        'logicalProblem': '但梦的含义是由分析师解释的，不同的解释都可能得到患者的认可。这形成了一个循环：解释→患者反应→验证解释。',
        'circularChain': ['梦是无意识表达', '分析师解释梦', '患者认可解释', '验证无意识内容']
    },
    'reality_principle': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '现实原则是自我遵循的原则，但其定义过于宽泛。任何理性行为都可以被解释为遵循现实原则，使得理论难以被证伪。',
        'argumentProcess': '弗洛伊德论证：(1)自我遵循现实原则；(2)现实原则指导理性决策；(3)任何理性行为都是现实原则的表现。',
        'logicalProblem': '但现实原则的定义过于宽泛，任何理性行为都可以被解释为遵循现实原则。这使得理论无法被证伪。',
        'circularChain': ['自我遵循现实原则', '定义为理性决策', '观察理性行为', '证明现实原则']
    },
    'moral_principle': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '道德原则是超我遵循的原则，但超我的存在本身是无法直接观察的。任何道德行为都可以被解释为超我的作用。',
        'argumentProcess': '弗洛伊德论证：(1)超我遵循道德原则；(2)道德原则导致道德行为；(3)任何道德行为都证明了超我的存在。',
        'logicalProblem': '但道德行为也可能来自其他因素（社会规范、理性思考、习惯）。超我的存在本身是无法直接观察的。',
        'circularChain': ['超我遵循道德原则', '导致道德行为', '道德行为表现', '证明超我存在']
    }
}

# 读取数据文件
with open('psychoanalysis_data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 为每个概念添加缺失的字段
for concept_id, fields in fixes.items():
    # 查找该概念的位置
    pattern = rf"id:\s*'{concept_id}'"
    
    if pattern not in content:
        # 使用正则表达式查找
        match = re.search(rf"id:\s*['\"]?{concept_id}['\"]?", content)
        if not match:
            print(f"⚠️ 未找到概念 {concept_id}")
            continue
    
    # 查找该概念块的开始位置
    concept_start = content.find(f"id: '{concept_id}'")
    if concept_start == -1:
        concept_start = content.find(f'id: "{concept_id}"')
    
    if concept_start == -1:
        print(f"⚠️ 未找到概念 {concept_id}")
        continue
    
    # 找到该概念块的结束（下一个 },）
    concept_end = content.find("},", concept_start)
    if concept_end == -1:
        print(f"⚠️ 未找到概念 {concept_id} 的结束")
        continue
    
    concept_block = content[concept_start:concept_end]
    
    # 检查是否已有hasCircularLogic
    if 'hasCircularLogic' not in concept_block:
        # 在school字段后添加循环论证字段
        new_fields = f"\n    hasCircularLogic: {str(fields['hasCircularLogic']).lower()},\n"
        new_fields += f"    circularLogicExplanation: '{fields['circularLogicExplanation']}',\n"
        new_fields += f"    argumentProcess: '{fields['argumentProcess']}',\n"
        new_fields += f"    logicalProblem: '{fields['logicalProblem']}',\n"
        new_fields += f"    circularChain: {fields['circularChain']},"
        
        # 在school字段后插入
        old_block = concept_block
        new_block = old_block.replace(
            'school:',
            new_fields + '\n    school:'
        )
        content = content.replace(old_block, new_block)
        print(f"✅ 已为 {concept_id} 添加循环论证字段")
    else:
        print(f"⚠️ {concept_id} 已有循环论证字段")

# 写回文件
with open('psychoanalysis_data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✅ 修复完成")
