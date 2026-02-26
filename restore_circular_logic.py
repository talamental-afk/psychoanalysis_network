#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""恢复缺失的循环论证信息"""

import re
import subprocess

# 从版本77a3aaf获取完整的循环论证数据
result = subprocess.run(['git', 'show', '77a3aaf:psychoanalysis_data.ts'], 
                       capture_output=True, text=True, encoding='utf-8')
old_content = result.stdout

# 需要恢复的概念及其循环论证信息
circular_logic_data = {
    'collective_unconscious': {
        'argumentProcess': '荣格论证：(1)各文化中存在相似的神话和象征；(2)这些相似性表明存在共同的心理结构；(3)这个共同的心理结构就是集体无意识。',
        'logicalProblem': '但文化相似性也可能来自文化传播、环境相似或人类的共同需求，而不是集体无意识。任何相似性都被解释为集体无意识的证据。',
        'circularChain': ['观察到文化相似性', '假设集体无意识存在', '用集体无意识解释相似性', '相似性成为集体无意识的证据'],
        'academicSignificance': '这个循环论证表明，集体无意识是一个无法被证伪的假设。任何文化现象都可以被解释为集体无意识的表现。'
    },
    'holding_environment': {
        'argumentProcess': '温尼科特论证：(1)婴儿需要被"抱持"；(2)抱持环境提供安全感；(3)安全感的存在证明了抱持环境的存在。',
        'logicalProblem': '但安全感也可能来自其他因素（如生物学因素、遗传因素）。缺乏安全感被解释为缺乏抱持环境，但缺乏抱持环境的证据本身就是缺乏安全感。',
        'circularChain': ['婴儿需要安全感', '定义为抱持环境', '安全感存在', '抱持环境存在'],
        'academicSignificance': '这个循环论证说明了温尼科特的理论中，抱持环境是一个难以独立验证的概念。'
    },
    'libido': {
        'argumentProcess': '弗洛伊德论证：(1)人类有驱动力；(2)这个驱动力是力比多；(3)任何行为都是力比多的表现。',
        'logicalProblem': '任何行为都可以被解释为力比多的表现。如果一个人表现出某种行为，这是力比多的证据；如果一个人不表现出这种行为，这可能是压抑，仍然是力比多的证据。',
        'circularChain': ['观察到人类行为', '定义为力比多的表现', '任何行为都符合定义', '力比多存在'],
        'academicSignificance': '这个循环论证表明，力比多是一个过于宽泛的概念，几乎无法被证伪。'
    },
    'oedipus_complex': {
        'argumentProcess': '弗洛伊德论证：(1)儿童对异性父母有无意识的欲望；(2)这是俄狄浦斯情结；(3)症状、梦或言语错误证明了情结的存在。',
        'logicalProblem': '如果儿童表现出这种欲望，这被视为情结的证据；如果儿童不表现出这种欲望，这被解释为压抑或否认，仍然被视为情结存在的证据。',
        'circularChain': ['假设俄狄浦斯情结存在', '观察到相关行为或症状', '用情结解释现象', '现象成为情结的证据'],
        'academicSignificance': '这个循环论证表明，俄狄浦斯情结是一个无法被证伪的假设。'
    },
    'synchronicity': {
        'argumentProcess': '荣格论证：(1)存在有意义的巧合；(2)这些巧合不是因果关系；(3)这些巧合是共时性的证据。',
        'logicalProblem': '但什么是"有意义的"巧合？任何巧合都可以被解释为共时性，而不是纯粹的巧合。不存在明确的标准来区分有意义的巧合和纯粹的巧合。',
        'circularChain': ['观察到巧合', '定义为有意义', '假设共时性', '巧合成为共时性的证据'],
        'academicSignificance': '这个循环论证表明，共时性是一个无法被验证的假设。'
    }
}

# 读取当前文件
with open('psychoanalysis_data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 为每个概念更新循环论证信息
for concept_id, data in circular_logic_data.items():
    # 查找该概念的位置
    pattern = rf"(id:\s*'{concept_id}'[^}}]*?hasCircularLogic:\s*true,)"
    
    # 构建新的循环论证信息
    new_data = f"""    argumentProcess: '{data['argumentProcess']}',
    logicalProblem: '{data['logicalProblem']}',
    circularChain: {data['circularChain']},
    academicSignificance: '{data['academicSignificance']}',"""
    
    # 替换旧的数据
    # 首先删除旧的argumentProcess, logicalProblem等字段
    pattern_old = rf"(id:\s*'{concept_id}'[^}}]*?hasCircularLogic:\s*true,)\s*argumentProcess:[^,]*,\s*logicalProblem:[^,]*,\s*circularChain:\s*\[[^\]]*\],\s*(?:visualization:[^,]*,\s*)?academicSignificance:[^,]*,"
    
    if re.search(pattern_old, content, re.DOTALL):
        content = re.sub(pattern_old, rf"\1\n{new_data}", content, flags=re.DOTALL)
    else:
        # 如果没有旧数据，直接在hasCircularLogic后添加
        pattern_insert = rf"(id:\s*'{concept_id}'[^}}]*?hasCircularLogic:\s*true,)"
        content = re.sub(pattern_insert, rf"\1\n{new_data}", content, flags=re.DOTALL)

# 写回文件
with open('psychoanalysis_data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 循环论证信息已恢复")
print(f"已更新 {len(circular_logic_data)} 个概念的循环论证信息")
