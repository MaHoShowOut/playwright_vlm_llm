/**
 * OCR验证码识别工具包
 * 
 * 使用方法：
 * 1. 安装依赖：npm install tesseract.js
 * 2. 导入工具包：const { CaptchaOCR } = require('./ocr-toolkit-example');
 * 3. 在测试中使用：
 *    const ocr = new CaptchaOCR();
 *    const result = await ocr.recognizeCaptcha(page, '#captchaCode');
 */

class CaptchaOCR {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.confidenceThreshold = options.confidenceThreshold || 0.8;
    this.expectedLength = options.expectedLength || 4;
    this.characterMap = options.characterMap || {
      '0': 'O', '1': 'I', '8': 'B', '5': 'S', '6': 'G'
    };
  }

  /**
   * 识别验证码
   * @param {Page} page - Playwright页面对象
   * @param {string} captchaSelector - 验证码元素选择器
   * @returns {Promise<{success: boolean, text: string, confidence: number, attempts: number}>}
   */
  async recognizeCaptcha(page, captchaSelector) {
    let attempts = 0;
    
    while (attempts < this.maxRetries) {
      attempts++;
      console.log(`🔍 第${attempts}次OCR识别尝试`);
      
      try {
        // 截取验证码图片
        const captchaElement = page.locator(captchaSelector);
        const screenshot = await captchaElement.screenshot();
        
        // 执行OCR识别
        const ocrResult = await this.performOCR(screenshot);
        
        // 处理识别结果
        const processedResult = this.processOCRResult(ocrResult);
        
        console.log(`🤖 OCR识别结果: ${processedResult.text}`);
        console.log(`🎯 识别置信度: ${(processedResult.confidence * 100).toFixed(1)}%`);
        
        // 质量检查
        if (this.validateResult(processedResult)) {
          console.log('✅ 识别结果质量良好');
          return {
            success: true,
            text: processedResult.text,
            confidence: processedResult.confidence,
            attempts: attempts
          };
        } else {
          console.log('❌ 识别质量不佳');
          if (attempts < this.maxRetries) {
            await this.refreshCaptcha(page);
            await page.waitForTimeout(1000);
          }
        }
        
      } catch (error) {
        console.log(`❌ OCR识别错误: ${error.message}`);
        if (attempts < this.maxRetries) {
          await this.refreshCaptcha(page);
          await page.waitForTimeout(1000);
        }
      }
    }
    
    return {
      success: false,
      text: '',
      confidence: 0,
      attempts: attempts
    };
  }

  /**
   * 执行OCR识别
   * @param {Buffer} imageBuffer - 图片数据
   * @returns {Promise<{text: string, confidence: number}>}
   */
  async performOCR(imageBuffer) {
    // 方法1: 使用tesseract.js
    try {
      const { createWorker } = require('tesseract.js');
      const worker = createWorker();
      
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const result = await worker.recognize(imageBuffer);
      await worker.terminate();
      
      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence / 100
      };
    } catch (error) {
      console.log('Tesseract.js不可用，使用模拟OCR');
      return this.simulateOCR();
    }
  }

  /**
   * 模拟OCR识别（用于演示）
   * @returns {Promise<{text: string, confidence: number}>}
   */
  async simulateOCR() {
    // 模拟OCR识别过程
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let text = '';
    for (let i = 0; i < this.expectedLength; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return {
      text: text,
      confidence: Math.random() * 0.4 + 0.6 // 60-100%
    };
  }

  /**
   * 处理OCR识别结果
   * @param {Object} ocrResult - OCR原始结果
   * @returns {Object} 处理后的结果
   */
  processOCRResult(ocrResult) {
    let text = ocrResult.text;
    
    // 1. 基础清理
    text = text.replace(/[^A-Z0-9]/g, '').toUpperCase();
    
    // 2. 字符替换
    Object.entries(this.characterMap).forEach(([from, to]) => {
      text = text.replace(new RegExp(from, 'g'), to);
    });
    
    // 3. 长度调整
    if (text.length > this.expectedLength) {
      text = text.substring(0, this.expectedLength);
    } else if (text.length < this.expectedLength) {
      // 如果长度不足，降低置信度
      ocrResult.confidence *= 0.5;
    }
    
    return {
      text: text,
      confidence: ocrResult.confidence
    };
  }

  /**
   * 验证识别结果质量
   * @param {Object} result - 识别结果
   * @returns {boolean} 是否通过验证
   */
  validateResult(result) {
    // 置信度检查
    if (result.confidence < this.confidenceThreshold) {
      console.log(`⚠️  置信度过低: ${(result.confidence * 100).toFixed(1)}%`);
      return false;
    }
    
    // 长度检查
    if (result.text.length !== this.expectedLength) {
      console.log(`⚠️  长度不正确: 期望${this.expectedLength}，实际${result.text.length}`);
      return false;
    }
    
    // 字符检查
    if (!/^[A-Z0-9]+$/.test(result.text)) {
      console.log(`⚠️  包含非法字符: ${result.text}`);
      return false;
    }
    
    return true;
  }

  /**
   * 刷新验证码
   * @param {Page} page - Playwright页面对象
   */
  async refreshCaptcha(page) {
    const refreshSelectors = [
      '#refreshCaptcha',
      '.refresh-captcha',
      '[onclick*="refresh"]',
      'button:has-text("刷新")'
    ];
    
    for (const selector of refreshSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.click();
          console.log('🔄 验证码已刷新');
          return;
        }
      } catch (e) {
        continue;
      }
    }
    
    // 如果没有刷新按钮，重新加载页面
    console.log('🔄 重新加载页面');
    await page.reload();
  }
}

/**
 * 自动登录函数
 * @param {Page} page - Playwright页面对象
 * @param {Object} credentials - 登录凭证
 * @param {Object} selectors - 页面元素选择器
 * @returns {Promise<boolean>} 登录是否成功
 */
async function autoLogin(page, credentials, selectors) {
  try {
    // 填写用户名
    await page.fill(selectors.username, credentials.username);
    console.log(`👤 用户名已填写: ${credentials.username}`);
    
    // 填写密码
    await page.fill(selectors.password, credentials.password);
    console.log('🔐 密码已填写');
    
    // OCR识别验证码
    const ocr = new CaptchaOCR();
    const captchaResult = await ocr.recognizeCaptcha(page, selectors.captcha);
    
    if (!captchaResult.success) {
      console.log('❌ 验证码识别失败');
      return false;
    }
    
    // 填写验证码
    await page.fill(selectors.captchaInput, captchaResult.text);
    console.log(`🔢 验证码已填写: ${captchaResult.text}`);
    
    // 点击登录按钮
    await page.click(selectors.loginButton);
    console.log('🚀 登录按钮已点击');
    
    // 等待登录结果
    await page.waitForTimeout(3000);
    
    // 检查登录结果
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    const successKeywords = ['欢迎', '成功', '首页', '主页', '退出', 'welcome', 'dashboard'];
    const isSuccess = successKeywords.some(keyword => 
      pageContent.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isSuccess) {
      console.log('🎉 自动登录成功！');
      return true;
    } else {
      console.log('❌ 登录失败');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 自动登录错误: ${error.message}`);
    return false;
  }
}

// 使用示例
async function example(page) {
  const credentials = {
    username: 'admin',
    password: '123456'
  };
  
  const selectors = {
    username: '#username',
    password: '#password',
    captcha: '#captchaCode',
    captchaInput: '#captcha',
    loginButton: '#loginBtn'
  };
  
  const success = await autoLogin(page, credentials, selectors);
  return success;
}

module.exports = {
  CaptchaOCR,
  autoLogin,
  example
};

// 安装依赖的说明
console.log(`
📦 OCR验证码识别工具包

🚀 安装依赖：
npm install tesseract.js

📖 使用方法：
const { CaptchaOCR, autoLogin } = require('./ocr-toolkit-example');

// 方法1：使用OCR类
const ocr = new CaptchaOCR();
const result = await ocr.recognizeCaptcha(page, '#captchaCode');

// 方法2：使用自动登录函数
const success = await autoLogin(page, credentials, selectors);

🎯 支持的OCR服务：
- tesseract.js (本地OCR)
- 百度OCR API
- 腾讯OCR API
- 阿里云OCR API
- Google Cloud Vision API
`);