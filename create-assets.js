const fs = require('fs');
const path = require('path');

// 创建一个简单的 SVG 图标
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4CAF50" rx="${size * 0.2}"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white">🍎</text>
</svg>`;

// 创建启动画面 SVG
const createSplashSVG = (width, height) => `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#4CAF50"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.15}" font-weight="bold" fill="white">Ingredient Manager</text>
</svg>`;

// 确保 assets 目录存在
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

// 创建图标文件
fs.writeFileSync('assets/icon.svg', createIconSVG(1024));
fs.writeFileSync('assets/adaptive-icon.svg', createIconSVG(1024));
fs.writeFileSync('assets/splash.svg', createSplashSVG(1284, 2778));

console.log('✅ 已创建基础 SVG 图标文件');
console.log('📝 注意：你需要将这些 SVG 文件转换为 PNG 格式');
console.log('🔗 推荐使用在线转换工具：https://convertio.co/svg-png/');
console.log('');
console.log('需要的文件：');
console.log('- icon.png (1024x1024)');
console.log('- adaptive-icon.png (1024x1024)');
console.log('- splash.png (1284x2778)');
