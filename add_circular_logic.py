#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为精神分析概念补充循环论证标记的脚本
"""

import re

# 循环论证数据库 - 包含概念ID和其循环论证说明
CIRCULAR_LOGIC_DATA = {
    'unconscious': '循环论证：无意识通过压抑来隐藏不可接受的内容，而压抑本身又是由无意识执行的。我们知道无意识存在是因为有压抑现象，但压抑现象的存在本身又被用来证明无意识的存在，形成循环论证。',
    'id': '循环论证：本我通过欲望驱动人的行为，但我们识别本我的方式就是通过观察这些欲望驱动的行为，形成循环定义。',
    'denial': '循环论证：否认是对不愉快现实的拒绝，但否认本身的存在只能通过观察人们对现实的否认来推断，形成循环。',
    'free_association': '循环论证：自由联想被认为能够绕过防御机制，但防御机制的存在本身只能通过自由联想中的阻碍来推断。',
    'countertransference': '循环论证：反移情被用来理解患者的内部世界，但分析师对患者的理解本身又受到反移情的影响，形成循环。',
    'interpretation': '循环论证：解释被认为能够使无意识意识化，但解释的正确性只能通过患者的反应来判断，而患者的反应本身可能受到解释的影响。',
    'psychoanalytic_therapy': '循环论证：精神分析治疗通过使无意识意识化来治愈，但治愈的标准本身就是患者对无意识内容的认识。',
    'oedipus_complex': '循环论证：俄狄浦斯情结被认为是普遍的心理现象，但这个理论本身可能导致人们在分析中发现符合这个理论的内容。',
    'resistance': '循环论证：阻抗被认为是患者对分析的无意识反对，但任何患者的行为或言语都可能被解释为阻抗的表现。',
    'repetition_compulsion': '循环论证：重复强迫被认为是无意识地重复创伤，但创伤的存在本身只能通过这种重复来推断。',
    'projection': '循环论证：投射是将自己的特质归因于他人，但我们识别投射的方式就是观察人们对他人的描述与他们自己的特质的相似性。',
    'rationalization': '循环论证：理性化是为无意识动机提供合理解释，但无意识动机的存在本身只能通过理性化的解释来推断。',
    'transference': '循环论证：移情是将对早期人物的情感转移到分析师，但移情的存在本身只能通过分析师的解释来确认。',
    'working_through': '循环论证：工作通过是反复处理同样的冲突，但冲突是否已解决的判断标准本身就是患者不再重复这个冲突。',
    'false_self': '循环论证：虚假自体是对环境的适应，但真实自体的存在本身只能通过虚假自体的识别来推断。',
    'shadow': '循环论证：阴影是被意识拒绝的人格部分，但阴影的内容本身只能通过意识的拒绝来识别。',
}

def add_circular_logic_marks(file_path):
    """为概念添加循环论证标记"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 对每个需要标记的概念进行处理
    for concept_id, explanation in CIRCULAR_LOGIC_DATA.items():
        # 查找该概念的定义
        pattern = rf"(id:\s*'{re.escape(concept_id)}'.*?)(,\s*\n\s*\}})"
        
        def replace_func(match):
            concept_block = match.group(1)
            closing = match.group(2)
            
            # 检查是否已有hasCircularLogic标记
            if 'hasCircularLogic:' in concept_block:
                # 替换现有的标记
                concept_block = re.sub(
                    r"hasCircularLogic:\s*(?:true|false)",
                    "hasCircularLogic: true",
                    concept_block
                )
                # 检查是否已有circularLogicExplanation
                if 'circularLogicExplanation:' not in concept_block:
                    # 添加解释
                    concept_block = re.sub(
                        r"(hasCircularLogic:\s*true)",
                        rf"\1,\n    circularLogicExplanation: '{explanation}'",
                        concept_block
                    )
            else:
                # 添加新的标记
                concept_block = f"{concept_block},\n    hasCircularLogic: true,\n    circularLogicExplanation: '{explanation}'"
            
            return f"{concept_block}{closing}"
        
        content = re.sub(pattern, replace_func, content, flags=re.DOTALL)
    
    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"已为 {len(CIRCULAR_LOGIC_DATA)} 个概念添加或更新循环论证标记")

if __name__ == '__main__':
    add_circular_logic_marks('/home/ubuntu/psychoanalysis_network/psychoanalysis_data.ts')
    print("循环论证标记补充完成！")
