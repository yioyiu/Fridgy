# 提取源代码首尾1500行用于软著材料
$srcPath = "src"
$outputFile = "软著代码材料.txt"

# 获取所有.ts和.tsx文件，按文件名排序
$files = Get-ChildItem -Path $srcPath -Recurse -Include *.ts,*.tsx | 
    Where-Object { $_.Name -notmatch '\.d\.ts$' } | 
    Sort-Object FullName

# 收集所有代码行
$allLines = @()

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    $allLines += "// ============================================"
    $allLines += "// 文件: $relativePath"
    $allLines += "// ============================================"
    $allLines += ""
    $content = Get-Content $file.FullName -Encoding UTF8
    $allLines += $content
    $allLines += ""
    $allLines += ""
}

# 提取前1500行和后1500行
$totalLines = $allLines.Count
$first1500 = $allLines[0..[Math]::Min(1499, $totalLines - 1)]
$last1500 = if ($totalLines -gt 1500) {
    $allLines[[Math]::Max(0, $totalLines - 1500)..($totalLines - 1)]
} else {
    @()
}

# 组合输出
$output = @()
$output += "============================================"
$output += "软著程序鉴别材料 V1.0"
$output += "源代码首1500行"
$output += "============================================"
$output += ""
$output += $first1500
$output += ""
$output += ""
$output += "============================================"
$output += "源代码尾1500行"
$output += "============================================"
$output += ""
$output += $last1500
$output += ""
$output += ""
$output += "============================================"
$output += "统计信息"
$output += "============================================"
$output += "总代码行数: $totalLines"
$output += "首1500行行数: $($first1500.Count)"
$output += "尾1500行行数: $($last1500.Count)"
$output += "文件总数: $($files.Count)"

# 输出到文件
$output | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "代码提取完成！"
Write-Host "输出文件: $outputFile"
Write-Host "总行数: $totalLines"
Write-Host "首1500行: $($first1500.Count)"
Write-Host "尾1500行: $($last1500.Count)"

