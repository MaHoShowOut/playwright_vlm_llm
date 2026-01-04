// 极简API密钥验证脚本
const dotenv = require('dotenv');
dotenv.config();

async function testAPIKey() {
  const apiKey = process.env.DASHSCOPE_API_KEY || 'sk-f582ca48b59f40f5bc40db5558e9610b-';
  
  console.log('🔍 验证API密钥...');
  console.log('密钥长度:', apiKey.length);
  console.log('密钥前缀:', apiKey.substring(0, 10) + '...');
  
  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });
    
    const response = await client.chat.completions.create({
      model: "qwen-vl-max-latest",
      messages: [{role: "user", content: "hi"}],
      max_tokens: 10
    });
    
    console.log('✅ API密钥有效');
    console.log('响应:', response.choices[0].message.content);
    
  } catch (error) {
    console.log('❌ API错误:', error.message);
    console.log('错误类型:', error.type);
    console.log('状态码:', error.status);
  }
}

if (require.main === module) {
  testAPIKey();
}

module.exports = { testAPIKey };