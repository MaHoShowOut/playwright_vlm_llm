// 加载环境变量
require('dotenv').config();

// 验证环境变量
if (!process.env.DASHSCOPE_API_KEY) {
  console.error('❌ DASHSCOPE_API_KEY 未配置');
  process.exit(1);
}

console.log('✅ 通义千问API密钥已配置');
console.log(`密钥长度: ${process.env.DASHSCOPE_API_KEY.length} 字符`);