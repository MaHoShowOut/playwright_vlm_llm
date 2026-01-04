/**
 * 像素级图像对比工具
 * 使用 Pixelmatch 进行精确的视觉差异检测
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

class PixelComparator {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.1; // 差异阈值
    this.includeAA = options.includeAA !== false; // 包含抗锯齿检测
    this.alpha = options.alpha || 0.1; // 透明度差异阈值
    this.aaColor = options.aaColor || [255, 255, 0]; // 抗锯齿像素颜色
    this.diffColor = options.diffColor || [255, 0, 0]; // 差异像素颜色
  }

  /**
   * 对比两张图片的像素差异
   * @param {string} img1Path - 基线图片路径
   * @param {string} img2Path - 对比图片路径
   * @param {string} diffOutputPath - 差异图片输出路径
   * @returns {Promise<Object>} 对比结果
   */
  async compareImages(img1Path, img2Path, diffOutputPath) {
    try {
      // 动态导入 pixelmatch
      const pixelmatch = (await import('pixelmatch')).default;
      
      // 读取图片
      const img1 = PNG.sync.read(fs.readFileSync(img1Path));
      const img2 = PNG.sync.read(fs.readFileSync(img2Path));
      
      // 检查图片尺寸
      if (img1.width !== img2.width || img1.height !== img2.height) {
        // 如果尺寸不同，调整到相同尺寸
        const { resizedImg1, resizedImg2 } = this.resizeImages(img1, img2);
        return this.performComparison(resizedImg1, resizedImg2, diffOutputPath, pixelmatch);
      }
      
      return this.performComparison(img1, img2, diffOutputPath, pixelmatch);
      
    } catch (error) {
      console.error('图像对比失败:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 执行实际的像素对比
   */
  performComparison(img1, img2, diffOutputPath, pixelmatch) {
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    // 执行像素对比
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      {
        threshold: this.threshold,
        includeAA: this.includeAA,
        alpha: this.alpha,
        aaColor: this.aaColor,
        diffColor: this.diffColor
      }
    );
    
    // 保存差异图像
    if (diffOutputPath) {
      fs.writeFileSync(diffOutputPath, PNG.sync.write(diff));
    }
    
    // 计算差异统计
    const totalPixels = width * height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;
    
    // 分析差异区域
    const diffRegions = this.analyzeDiffRegions(diff.data, width, height);
    
    return {
      success: true,
      comparison: {
        totalPixels,
        diffPixels: numDiffPixels,
        diffPercentage: parseFloat(diffPercentage.toFixed(2)),
        dimensions: { width, height },
        threshold: this.threshold,
        diffImagePath: diffOutputPath,
        diffRegions: diffRegions,
        status: this.getComparisonStatus(diffPercentage),
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 调整图片尺寸到相同大小
   */
  resizeImages(img1, img2) {
    const maxWidth = Math.max(img1.width, img2.width);
    const maxHeight = Math.max(img1.height, img2.height);
    
    const resizedImg1 = this.resizeImage(img1, maxWidth, maxHeight);
    const resizedImg2 = this.resizeImage(img2, maxWidth, maxHeight);
    
    return { resizedImg1, resizedImg2 };
  }

  /**
   * 调整单个图片尺寸
   */
  resizeImage(img, newWidth, newHeight) {
    const resized = new PNG({ width: newWidth, height: newHeight });
    
    // 填充白色背景
    for (let i = 0; i < resized.data.length; i += 4) {
      resized.data[i] = 255;     // R
      resized.data[i + 1] = 255; // G
      resized.data[i + 2] = 255; // B
      resized.data[i + 3] = 255; // A
    }
    
    // 复制原图像数据
    for (let y = 0; y < Math.min(img.height, newHeight); y++) {
      for (let x = 0; x < Math.min(img.width, newWidth); x++) {
        const srcIdx = (y * img.width + x) * 4;
        const dstIdx = (y * newWidth + x) * 4;
        
        resized.data[dstIdx] = img.data[srcIdx];         // R
        resized.data[dstIdx + 1] = img.data[srcIdx + 1]; // G
        resized.data[dstIdx + 2] = img.data[srcIdx + 2]; // B
        resized.data[dstIdx + 3] = img.data[srcIdx + 3]; // A
      }
    }
    
    return resized;
  }

  /**
   * 分析差异区域
   */
  analyzeDiffRegions(diffData, width, height) {
    const regions = [];
    let currentRegion = null;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const isDiff = diffData[idx] === this.diffColor[0] && 
                      diffData[idx + 1] === this.diffColor[1] && 
                      diffData[idx + 2] === this.diffColor[2];
        
        if (isDiff) {
          if (!currentRegion) {
            currentRegion = {
              minX: x, maxX: x,
              minY: y, maxY: y,
              pixelCount: 1
            };
          } else {
            currentRegion.minX = Math.min(currentRegion.minX, x);
            currentRegion.maxX = Math.max(currentRegion.maxX, x);
            currentRegion.minY = Math.min(currentRegion.minY, y);
            currentRegion.maxY = Math.max(currentRegion.maxY, y);
            currentRegion.pixelCount++;
          }
        } else if (currentRegion && x - currentRegion.maxX > 50) {
          // 如果距离上一个差异像素超过50像素，认为是新的区域
          regions.push(this.finalizeRegion(currentRegion));
          currentRegion = null;
        }
      }
    }
    
    if (currentRegion) {
      regions.push(this.finalizeRegion(currentRegion));
    }
    
    // 合并相近的区域
    return this.mergeNearbyRegions(regions);
  }

  /**
   * 完善区域信息
   */
  finalizeRegion(region) {
    return {
      ...region,
      width: region.maxX - region.minX + 1,
      height: region.maxY - region.minY + 1,
      area: (region.maxX - region.minX + 1) * (region.maxY - region.minY + 1),
      center: {
        x: Math.round((region.minX + region.maxX) / 2),
        y: Math.round((region.minY + region.maxY) / 2)
      }
    };
  }

  /**
   * 合并相近的差异区域
   */
  mergeNearbyRegions(regions, maxDistance = 100) {
    if (regions.length <= 1) return regions;
    
    const merged = [];
    const used = new Set();
    
    for (let i = 0; i < regions.length; i++) {
      if (used.has(i)) continue;
      
      let currentRegion = { ...regions[i] };
      used.add(i);
      
      for (let j = i + 1; j < regions.length; j++) {
        if (used.has(j)) continue;
        
        const distance = Math.sqrt(
          Math.pow(currentRegion.center.x - regions[j].center.x, 2) +
          Math.pow(currentRegion.center.y - regions[j].center.y, 2)
        );
        
        if (distance <= maxDistance) {
          // 合并区域
          currentRegion.minX = Math.min(currentRegion.minX, regions[j].minX);
          currentRegion.maxX = Math.max(currentRegion.maxX, regions[j].maxX);
          currentRegion.minY = Math.min(currentRegion.minY, regions[j].minY);
          currentRegion.maxY = Math.max(currentRegion.maxY, regions[j].maxY);
          currentRegion.pixelCount += regions[j].pixelCount;
          used.add(j);
        }
      }
      
      merged.push(this.finalizeRegion(currentRegion));
    }
    
    return merged.sort((a, b) => b.pixelCount - a.pixelCount); // 按像素数量排序
  }

  /**
   * 获取对比状态
   */
  getComparisonStatus(diffPercentage) {
    if (diffPercentage === 0) return 'identical';
    if (diffPercentage < 1) return 'minor_differences';
    if (diffPercentage < 5) return 'moderate_differences';
    if (diffPercentage < 20) return 'major_differences';
    return 'critical_differences';
  }

  /**
   * 批量对比多组图片
   */
  async batchCompare(comparisons, outputDir) {
    const results = [];
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (let i = 0; i < comparisons.length; i++) {
      const { baseline, current, name } = comparisons[i];
      console.log(`对比进度: ${i + 1}/${comparisons.length} - ${name}`);
      
      const diffPath = path.join(outputDir, `diff-${name}.png`);
      const result = await this.compareImages(baseline, current, diffPath);
      
      results.push({
        name,
        baseline,
        current,
        ...result
      });
    }
    
    return results;
  }

  /**
   * 生成对比报告
   */
  generateReport(results, outputPath) {
    const report = {
      generated_at: new Date().toISOString(),
      total_comparisons: results.length,
      summary: {
        identical: results.filter(r => r.comparison?.status === 'identical').length,
        minor_differences: results.filter(r => r.comparison?.status === 'minor_differences').length,
        moderate_differences: results.filter(r => r.comparison?.status === 'moderate_differences').length,
        major_differences: results.filter(r => r.comparison?.status === 'major_differences').length,
        critical_differences: results.filter(r => r.comparison?.status === 'critical_differences').length,
        errors: results.filter(r => !r.success).length
      },
      results: results
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    // 生成HTML报告
    const htmlPath = outputPath.replace('.json', '.html');
    this.generateHTMLReport(report, htmlPath);
    
    return {
      jsonReport: outputPath,
      htmlReport: htmlPath,
      summary: report.summary
    };
  }

  /**
   * 生成HTML报告
   */
  generateHTMLReport(reportData, htmlPath) {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>像素对比测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; flex-wrap: wrap; }
        .stat { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin: 5px; min-width: 120px; }
        .stat.identical { border-left: 5px solid #28a745; }
        .stat.minor { border-left: 5px solid #17a2b8; }
        .stat.moderate { border-left: 5px solid #ffc107; }
        .stat.major { border-left: 5px solid #fd7e14; }
        .stat.critical { border-left: 5px solid #dc3545; }
        .stat.error { border-left: 5px solid #6c757d; }
        .comparison-item { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .comparison-item.identical { border-left: 5px solid #28a745; }
        .comparison-item.minor_differences { border-left: 5px solid #17a2b8; }
        .comparison-item.moderate_differences { border-left: 5px solid #ffc107; }
        .comparison-item.major_differences { border-left: 5px solid #fd7e14; }
        .comparison-item.critical_differences { border-left: 5px solid #dc3545; }
        .comparison-item.error { border-left: 5px solid #6c757d; }
        .image-row { display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap; }
        .image-item { flex: 1; min-width: 200px; }
        .image-item img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; }
        .stats { background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .regions { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 像素对比测试报告</h1>
            <p>生成时间: ${reportData.generated_at}</p>
        </div>
        
        <div class="summary">
            <div class="stat identical">
                <h3>${reportData.summary.identical}</h3>
                <p>完全相同</p>
            </div>
            <div class="stat minor">
                <h3>${reportData.summary.minor_differences}</h3>
                <p>轻微差异</p>
            </div>
            <div class="stat moderate">
                <h3>${reportData.summary.moderate_differences}</h3>
                <p>中等差异</p>
            </div>
            <div class="stat major">
                <h3>${reportData.summary.major_differences}</h3>
                <p>重大差异</p>
            </div>
            <div class="stat critical">
                <h3>${reportData.summary.critical_differences}</h3>
                <p>严重差异</p>
            </div>
            <div class="stat error">
                <h3>${reportData.summary.errors}</h3>
                <p>对比失败</p>
            </div>
        </div>
        
        <div class="results">
            ${reportData.results.map((result, index) => `
                <div class="comparison-item ${result.comparison?.status || 'error'}">
                    <h3>对比 #${index + 1}: ${result.name || 'Unknown'}</h3>
                    
                    ${result.success ? `
                        <div class="stats">
                            <strong>📊 统计信息:</strong><br>
                            总像素: ${result.comparison.totalPixels.toLocaleString()}<br>
                            差异像素: ${result.comparison.diffPixels.toLocaleString()}<br>
                            差异百分比: ${result.comparison.diffPercentage}%<br>
                            图片尺寸: ${result.comparison.dimensions.width} × ${result.comparison.dimensions.height}<br>
                            对比状态: ${result.comparison.status}
                        </div>
                        
                        ${result.comparison.diffRegions && result.comparison.diffRegions.length > 0 ? `
                            <div class="regions">
                                <strong>🎯 主要差异区域 (${result.comparison.diffRegions.length}个):</strong><br>
                                ${result.comparison.diffRegions.slice(0, 5).map((region, i) => `
                                    区域${i + 1}: 位置(${region.minX}, ${region.minY}) 大小${region.width}×${region.height} 像素数${region.pixelCount}
                                `).join('<br>')}
                            </div>
                        ` : ''}
                        
                        <div class="image-row">
                            <div class="image-item">
                                <h4>基线图片</h4>
                                <img src="${path.basename(result.baseline)}" alt="基线图片" onerror="this.style.display='none'">
                            </div>
                            <div class="image-item">
                                <h4>当前图片</h4>
                                <img src="${path.basename(result.current)}" alt="当前图片" onerror="this.style.display='none'">
                            </div>
                            ${result.comparison.diffImagePath ? `
                                <div class="image-item">
                                    <h4>差异图片</h4>
                                    <img src="${path.basename(result.comparison.diffImagePath)}" alt="差异图片" onerror="this.style.display='none'">
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="stats">
                            <strong>❌ 对比失败:</strong> ${result.error}
                        </div>
                    `}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(htmlPath, html);
  }
}

module.exports = { PixelComparator };

// 使用示例
async function example() {
  const comparator = new PixelComparator({
    threshold: 0.1,
    diffColor: [255, 0, 0]
  });
  
  const result = await comparator.compareImages(
    './screenshots/captcha-before.png',
    './screenshots/captcha-after.png',
    './screenshots/captcha-diff.png'
  );
  
  console.log('对比结果:', result);
}

if (require.main === module) {
  example().catch(console.error);
}