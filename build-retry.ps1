# EAS Build 重试脚本 (PowerShell版本)
# 用法: .\build-retry.ps1 -Platform android -Profile production
#      .\build-retry.ps1 -Platform ios -Profile production

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("android", "ios")]
    [string]$Platform,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "preview", "production", "production-retry")]
    [string]$Profile = "production",
    
    [Parameter(Mandatory=$false)]
    [int]$MaxAttempts = 5,
    
    [Parameter(Mandatory=$false)]
    [int]$RetryDelay = 60
)

$attempt = 1
$buildSuccess = $false

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EAS Build 重试机制" -ForegroundColor Cyan
Write-Host "平台: $Platform" -ForegroundColor Cyan
Write-Host "配置: $Profile" -ForegroundColor Cyan
Write-Host "最大重试次数: $MaxAttempts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

while ($attempt -le $MaxAttempts -and -not $buildSuccess) {
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "尝试 $attempt / $MaxAttempts" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host ""
    
    # 测试网络连接
    Write-Host "测试网络连接..." -ForegroundColor Gray
    try {
        $pingResult = Test-Connection -ComputerName storage.googleapis.com -Count 3 -Quiet
        if (-not $pingResult) {
            Write-Host "网络连接失败，等待 $RetryDelay 秒后重试..." -ForegroundColor Red
            Start-Sleep -Seconds $RetryDelay
            continue
        }
        Write-Host "网络连接正常 ✓" -ForegroundColor Green
    } catch {
        Write-Host "无法连接到 storage.googleapis.com，等待 $RetryDelay 秒后重试..." -ForegroundColor Red
        Start-Sleep -Seconds $RetryDelay
        $attempt++
        continue
    }
    
    Write-Host ""
    Write-Host "开始构建..." -ForegroundColor Cyan
    
    # 构建命令
    $buildArgs = @(
        "build",
        "--platform", $Platform,
        "--profile", $Profile,
        "--non-interactive"
    )
    
    # 执行构建
    $buildOutput = & eas @buildArgs 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "构建成功！" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        $buildSuccess = $true
    } else {
        Write-Host ""
        Write-Host "构建失败 (尝试 $attempt)" -ForegroundColor Red
        
        # 检查是否是网络错误
        $isNetworkError = $buildOutput -match "ECONNRESET|ETIMEDOUT|ENOTFOUND|network|connection"
        
        if ($attempt -lt $MaxAttempts) {
            if ($isNetworkError) {
                Write-Host "检测到网络错误，等待 $RetryDelay 秒后重试..." -ForegroundColor Yellow
            } else {
                Write-Host "等待 $RetryDelay 秒后重试..." -ForegroundColor Yellow
            }
            Start-Sleep -Seconds $RetryDelay
            $attempt++
        } else {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Red
            Write-Host "所有尝试均失败。建议：" -ForegroundColor Red
            Write-Host "1. 使用手机热点" -ForegroundColor Yellow
            Write-Host "2. 使用VPN" -ForegroundColor Yellow
            Write-Host "3. 更换网络环境" -ForegroundColor Yellow
            Write-Host "4. 稍后重试" -ForegroundColor Yellow
            Write-Host "========================================" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "构建过程完成。" -ForegroundColor Cyan

if (-not $buildSuccess) {
    exit 1
}

