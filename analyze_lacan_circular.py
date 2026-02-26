#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json

# 拉康概念的循环论证分析
lacan_circular_logic = {
    'imaginary_order': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '想象界是自我认同的基础，但自我本身是想象界的产物，形成循环定义。',
        'argumentProcess': '1. 想象界是自我形成的基础 → 2. 自我通过与他人的镜像关系形成 → 3. 镜像关系本身就是想象界的一部分 → 4. 因此自我是由想象界定义的 → 5. 但想象界又由自我的幻想构成 → 回到第1步',
        'logicalProblem': '想象界和自我形成循环定义：想象界产生自我，但自我的幻想又构成想象界。这使得两个概念都无法独立定义。',
        'circularChain': ['想象界', '自我形成', '镜像关系', '自我幻想', '回到想象界'],
        'academicSignificance': '这个循环反映了拉康理论的自反性特征，但也暴露了其在逻辑上的困境。'
    },
    'real_order': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '实在界被定义为超越语言和象征的东西，但我们只能通过语言来讨论它，形成悖论。',
        'argumentProcess': '1. 实在界是超越象征秩序的 → 2. 我们只能通过象征秩序来讨论实在界 → 3. 因此我们讨论的实在界实际上是象征化的 → 4. 这与"实在界超越象征"的定义矛盾 → 5. 所以实在界是不可言说的 → 6. 但这本身就是对实在界的言说',
        'logicalProblem': '实在界的定义本身就包含了一个悖论：它被定义为超越语言，但这个定义本身就是语言。',
        'circularChain': ['实在界定义', '超越象征秩序', '通过语言讨论', '象征化的实在', '回到定义'],
        'academicSignificance': '这个悖论是拉康理论的核心特征，反映了语言与现实之间的根本张力。'
    },
    'mirror_stage': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '镜像阶段解释了自我如何通过他人的认可形成，但这个解释本身依赖于已经存在的自我。',
        'argumentProcess': '1. 婴儿通过镜像识别自己 → 2. 这种识别需要一个观看者（母亲或他人） → 3. 观看者的认可使婴儿形成自我 → 4. 但婴儿必须已经有某种自我意识才能理解镜像 → 5. 所以自我既是镜像的结果，又是镜像的前提',
        'logicalProblem': '镜像阶段的解释存在因果循环：自我需要通过镜像形成，但理解镜像又需要已经存在的自我。',
        'circularChain': ['镜像识别', '他人认可', '自我形成', '自我意识前提', '回到镜像'],
        'academicSignificance': '这个循环反映了身份形成的复杂性，但也表明拉康的解释可能不够严谨。'
    },
    'desire': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '欲望被定义为对缺乏的追求，但缺乏本身是由欲望产生的，形成循环。',
        'argumentProcess': '1. 欲望是对缺乏的追求 → 2. 缺乏是由象征秩序产生的 → 3. 象征秩序通过禁止产生缺乏 → 4. 禁止本身产生欲望 → 5. 因此欲望产生缺乏，缺乏产生欲望',
        'logicalProblem': '欲望和缺乏形成因果循环：欲望追求缺乏，但缺乏又产生欲望。这使得两者都无法作为独立的原因。',
        'circularChain': ['欲望', '追求缺乏', '象征禁止', '缺乏产生', '回到欲望'],
        'academicSignificance': '这个循环体现了拉康对欲望本质的深刻洞察，但也暴露了其理论的自反性困境。'
    },
    'lack': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '缺乏被定义为主体性的基础，但主体性本身又是由缺乏产生的，形成循环定义。',
        'argumentProcess': '1. 缺乏是人类主体性的基础 → 2. 主体性通过认识到缺乏而形成 → 3. 但缺乏的存在需要一个主体来感知它 → 4. 因此主体和缺乏互相定义 → 5. 无法确定哪个是原因，哪个是结果',
        'logicalProblem': '缺乏和主体性形成循环定义：缺乏产生主体，主体感知缺乏。这使得两者都无法独立解释。',
        'circularChain': ['缺乏', '主体形成', '缺乏感知', '主体性确立', '回到缺乏'],
        'academicSignificance': '这个循环反映了主体性的复杂性，但也表明拉康的理论框架可能需要进一步的逻辑澄清。'
    },
    'jouissance': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '享乐被定义为超越快乐原则的东西，但这个定义本身就依赖于快乐原则的概念。',
        'argumentProcess': '1. 享乐是超越快乐原则的 → 2. 快乐原则是象征秩序的一部分 → 3. 享乐是对象征秩序的超越 → 4. 但享乐只能通过与快乐原则的对比来定义 → 5. 因此享乐依赖于它试图超越的东西',
        'logicalProblem': '享乐的定义包含了一个悖论：它被定义为超越快乐原则，但这个定义本身就依赖于快乐原则。',
        'circularChain': ['享乐定义', '超越快乐原则', '象征秩序对比', '依赖快乐原则', '回到定义'],
        'academicSignificance': '这个悖论体现了拉康对主体经验的复杂理解，但也表明某些概念可能无法完全逻辑化。'
    },
    'objet_petit_a': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '小客体a被定义为欲望的对象，但欲望本身是由小客体a产生的，形成循环。',
        'argumentProcess': '1. 小客体a是欲望的对象 → 2. 欲望追求小客体a → 3. 但小客体a本身是由欲望产生的 → 4. 因此小客体a既是欲望的原因，又是欲望的结果 → 5. 两者互相定义',
        'logicalProblem': '小客体a和欲望形成因果循环：小客体a是欲望的对象，但欲望又产生小客体a。这使得因果关系不清。',
        'circularChain': ['小客体a', '欲望对象', '欲望追求', '产生小客体a', '回到开始'],
        'academicSignificance': '这个循环反映了拉康对欲望结构的深刻理解，但也表明其理论的自反性特征。'
    },
    'big_other': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '大他者被定义为象征秩序的代表，但象征秩序本身又是由大他者维持的，形成循环。',
        'argumentProcess': '1. 大他者代表象征秩序 → 2. 象征秩序通过大他者的法则维持 → 3. 大他者的权威来自象征秩序 → 4. 因此大他者和象征秩序互相维持 → 5. 无法确定哪个是基础',
        'logicalProblem': '大他者和象征秩序形成循环维持：大他者维持象征秩序，象征秩序赋予大他者权威。',
        'circularChain': ['大他者', '象征秩序代表', '秩序维持', '权威来源', '回到大他者'],
        'academicSignificance': '这个循环反映了权力和秩序的相互构成关系，但也暴露了拉康理论的逻辑困境。'
    },
    'small_other': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '小他者被定义为想象界中的他人，但想象界本身是通过与小他者的关系形成的。',
        'argumentProcess': '1. 小他者是想象界中的他人 → 2. 想象界通过与小他者的镜像关系形成 → 3. 但小他者本身也是想象界的产物 → 4. 因此想象界和小他者互相定义',
        'logicalProblem': '小他者和想象界形成循环定义：小他者形成想象界，想象界又定义小他者。',
        'circularChain': ['小他者', '想象界形成', '镜像关系', '他者定义', '回到小他者'],
        'academicSignificance': '这个循环反映了主体间性的复杂性，但也表明拉康的理论框架需要进一步的逻辑澄清。'
    },
    'signifier': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '能指被定义为代表所指的东西，但所指本身又是由能指产生的，形成循环。',
        'argumentProcess': '1. 能指代表所指 → 2. 所指是能指所指向的意义 → 3. 但所指只能通过能指来表达 → 4. 因此所指是由能指产生的 → 5. 能指既代表所指，又产生所指',
        'logicalProblem': '能指和所指形成循环关系：能指代表所指，但所指又由能指产生。这使得两者的关系不清。',
        'circularChain': ['能指', '代表所指', '所指意义', '能指产生', '回到能指'],
        'academicSignificance': '这个循环反映了语言的自反性特征，但也表明拉康的符号理论可能需要进一步的澄清。'
    },
    'signified': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '所指被定义为能指所指向的意义，但意义本身又是由能指的使用方式决定的。',
        'argumentProcess': '1. 所指是能指的意义 → 2. 意义由使用方式决定 → 3. 使用方式由象征秩序规定 → 4. 象征秩序由能指系统构成 → 5. 因此所指由能指决定，能指又由所指的使用决定',
        'logicalProblem': '所指和能指形成循环：所指由能指决定，但能指的使用又由所指的意义决定。',
        'circularChain': ['所指', '能指意义', '使用方式', '象征秩序', '回到所指'],
        'academicSignificance': '这个循环体现了语言的相互依赖性，但也暴露了拉康理论的自反性困境。'
    },
    'symbolic_chain': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '象征链被定义为能指的连锁，但每个能指的意义又由其在链中的位置决定，形成循环。',
        'argumentProcess': '1. 象征链是能指的连锁 → 2. 每个能指的意义由其在链中的位置决定 → 3. 链的结构由所有能指的相互关系决定 → 4. 但每个能指的意义又依赖于整个链 → 5. 因此能指和链互相定义',
        'logicalProblem': '象征链中的能指形成循环定义：每个能指的意义由链决定，但链又由能指构成。',
        'circularChain': ['象征链', '能指连锁', '位置意义', '链结构', '回到能指'],
        'academicSignificance': '这个循环反映了语言系统的整体性特征，但也表明其逻辑基础可能需要进一步澄清。'
    },
    'subjectivity': {
        'hasCircularLogic': True,
        'circularLogicExplanation': '主体性被定义为对象征秩序的认同，但象征秩序本身又是由主体的认同维持的。',
        'argumentProcess': '1. 主体性是对象征秩序的认同 → 2. 象征秩序通过主体的认同维持 → 3. 主体的认同来自象征秩序 → 4. 因此主体性和象征秩序互相维持 → 5. 无法确定哪个是基础',
        'logicalProblem': '主体性和象征秩序形成循环维持：主体通过认同秩序而存在，秩序通过主体的认同而维持。',
        'circularChain': ['主体性', '象征认同', '秩序维持', '认同来源', '回到主体性'],
        'academicSignificance': '这个循环反映了主体和结构的相互构成关系，但也暴露了拉康理论的逻辑困境。'
    }
}

# 读取数据文件
with open('psychoanalysis_data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 为每个拉康概念添加循环论证信息
for concept_id, circular_info in lacan_circular_logic.items():
    # 查找概念的定义
    pattern = rf"(id:\s*['\"]{ concept_id}['\"].*?)(}})"
    
    # 检查是否已经有循环论证信息
    if f"id: '{concept_id}'" in content or f'id: "{concept_id}"' in content:
        # 检查是否已经有 hasCircularLogic
        if f"id: '{concept_id}'" in content:
            concept_pattern = rf"(id:\s*['\"]{ concept_id}['\"].*?)(}})"
            match = re.search(concept_pattern, content, re.DOTALL)
            if match:
                concept_text = match.group(0)
                if 'hasCircularLogic' not in concept_text:
                    # 添加循环论证信息
                    circular_str = f"""
    hasCircularLogic: true,
    circularLogicExplanation: '{circular_info['circularLogicExplanation']}',
    argumentProcess: '{circular_info['argumentProcess']}',
    logicalProblem: '{circular_info['logicalProblem']}',
    circularChain: {json.dumps(circular_info['circularChain'])},
    academicSignificance: '{circular_info['academicSignificance']}',"""
                    
                    # 在最后一个逗号前插入
                    insert_pos = match.end() - 2
                    content = content[:insert_pos] + circular_str + content[insert_pos:]

# 保存修改后的文件
with open('psychoanalysis_data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("拉康概念循环论证分析完成！")
print(f"已为 {len(lacan_circular_logic)} 个拉康概念添加循环论证信息")
