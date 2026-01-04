/**
 * 智能视觉UI检测工具
 * 集成通义千问（Qwen-VL）视觉语言模型进行UI分析。
 * 这个版本是为《基于“感知-编排”双层AI架构的Web自动化测试系统研究》的核心实验而设计的。
 * 它接受一个灵活的`prompt`参数，允许测试脚本（如`chinese-captcha-ai.spec.js`）动态构建并传入详细的分析指令。
 */

const fs = require('fs');
const path = require('path');

class VisualAIDetector {
  /**
   * 构造函数
   * @param {string} apiKey - 访问通义千问服务的API密钥。如果未提供，则从环境变量DASHSCOPE_API_KEY读取。
   */
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.DASHSCOPE_API_KEY;
    this.baseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
    this.model = "qwen-vl-max-latest"; // 使用最新的Qwen-VL-Max模型
    
    if (!this.apiKey) {
      throw new Error('请设置DASHSCOPE_API_KEY环境变量或传入API Key');
    }
    this.openai = null; // 延迟初始化OpenAI客户端
  }

  /**
   * 延迟初始化OpenAI客户端，避免在不需要时加载。
   */
  async initClient() {
    if (!this.openai) {
      const { default: OpenAI } = await import('openai');
      this.openai = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseURL
      });
    }
    return this.openai;
  }

  /**
   * 将本地图片文件读取并转换为Base64编码的Data URL。
   * @param {string} imagePath - 本地图片文件的路径。
   * @returns {string} - Base64编码的Data URL字符串。
   */
  imageToBase64(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.jpg' ? 'image/jpeg' : 'image/png';
    return `data:${mimeType};base64,${base64Image}`;
  }

  /**
   * 核心方法：分析UI截图。
   * 此方法接收一个图片路径和一个详细的prompt，然后调用VLM进行分析。
   * @param {string} imagePath - 需要分析的截图的本地路径。
   * @param {string} prompt - 指导AI如何分析图片的详细指令。
   * @returns {Promise<object>} - 包含分析结果的对象。
   */
  async analyzeUIScreenshot(imagePath, prompt) {
    const client = await this.initClient();
    const base64Image = this.imageToBase64(imagePath);

    try {
      const response = await client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: [{
              type: "text",
              // 设定一个通用的、专业的系统角色
              text: "你是一个专业的UI/UX测试、视觉回归测试和可访问性分析专家，具备丰富的网页设计和前端开发经验。请根据用户的要求，精确、详细地完成任务。"
            }]
          },
          {
            role: "user",
            content: [
              { 
                type: "image_url", 
                image_url: { url: base64Image } 
              },
              { 
                type: "text", 
                // 用户的具体指令通过prompt参数传入
                text: prompt 
              }
            ]
          }
        ],
        temperature: 0.1, // 使用较低的温度以获得更稳定、确定性的输出
        max_tokens: 2000  // 设置较大的最大token数以处理复杂的分析结果
      });

      return {
        success: true,
        analysis: response.choices[0].message.content,
        imagePath: imagePath,
        prompt: prompt,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('AI分析失败:', error);
      return {
        success: false,
        error: error.message,
        imagePath: imagePath,
        prompt: prompt,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { VisualAIDetector };
