# -*- coding: utf-8 -*-
import os
import glob
from pathlib import Path

# 获取所有.ts和.tsx文件，排除.d.ts文件
src_path = "src"
all_files = []
for root, dirs, files in os.walk(src_path):
    for file in files:
        if (file.endswith('.ts') or file.endswith('.tsx')) and not file.endswith('.d.ts'):
            file_path = os.path.join(root, file)
            all_files.append(file_path)

# 按文件名排序
all_files.sort()

# 收集所有代码行
all_lines = []

for file_path in all_files:
    relative_path = file_path.replace(os.getcwd() + os.sep, "")
    all_lines.append("// ============================================")
    all_lines.append(f"// 文件: {relative_path}")
    all_lines.append("// ============================================")
    all_lines.append("")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.readlines()
            # 移除每行末尾的换行符，后面统一添加
            content = [line.rstrip('\n\r') for line in content]
            all_lines.extend(content)
    except Exception as e:
        print(f"读取文件 {file_path} 时出错: {e}")
        continue
    
    all_lines.append("")
    all_lines.append("")

# 提取前1500行和后1500行
total_lines = len(all_lines)
first_1500 = all_lines[:1500] if total_lines >= 1500 else all_lines
last_1500 = all_lines[-1500:] if total_lines > 1500 else []

# 组合输出
output = []
output.append("=" * 50)
output.append("软著程序鉴别材料 V1.0")
output.append("源代码首1500行")
output.append("=" * 50)
output.append("")
output.extend(first_1500)
output.append("")
output.append("")
output.append("=" * 50)
output.append("源代码尾1500行")
output.append("=" * 50)
output.append("")
output.extend(last_1500)
output.append("")
output.append("")
output.append("=" * 50)
output.append("统计信息")
output.append("=" * 50)
output.append(f"总代码行数: {total_lines}")
output.append(f"首1500行行数: {len(first_1500)}")
output.append(f"尾1500行行数: {len(last_1500)}")
output.append(f"文件总数: {len(all_files)}")

# 输出到文件
output_file = "软著代码材料.txt"
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("代码提取完成！")
print(f"输出文件: {output_file}")
print(f"总行数: {total_lines}")
print(f"首1500行: {len(first_1500)}")
print(f"尾1500行: {len(last_1500)}")
print(f"文件总数: {len(all_files)}")

