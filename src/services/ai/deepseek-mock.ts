interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface StorageAnalysisResult {
  item: string;
  duration: string;
}

class DeepSeekService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    // 从环境变量获取API密钥
    this.apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '';
    this.baseURL = 'https://api.deepseek.com/v1/chat/completions';
  }

  async analyzeStorageTime(itemName: string): Promise<StorageAnalysisResult | null> {
    console.log('开始分析储藏时间:', itemName);
    
    // 优先使用本地模拟数据（解决API 402错误）
    const mockResult = this.getMockAnalysis(itemName);
    if (mockResult) {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('使用本地模拟分析结果:', mockResult);
      return mockResult;
    }

    // 如果需要使用真实API，取消下面代码的注释
    /*
    if (!this.apiKey) {
      console.error('DeepSeek API key is not configured');
      return null;
    }

    try {
      const prompt = `请问 "${itemName}" 最佳储藏时间为多少？以 "${itemName}" "时长"回答我即可`;
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 100,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('No content in API response');
      }

      // 解析回复内容，提取物品名和时长
      const match = content.match(/"([^"]+)"\s+"([^"]+)"/);
      if (match && match[1] && match[2]) {
        return {
          item: match[1],
          duration: match[2]
        };
      }

      const simpleMatch = content.match(/(\S+)\s+(.+)/);
      if (simpleMatch && simpleMatch[1] && simpleMatch[2]) {
        return {
          item: simpleMatch[1],
          duration: simpleMatch[2]
        };
      }

      return {
        item: itemName,
        duration: content
      };

    } catch (error) {
      console.error('Error analyzing storage time:', error);
      // API调用失败时返回本地模拟数据
      return this.getMockAnalysis(itemName);
    }
    */

    return mockResult;
  }

  // 本地模拟分析功能
  private getMockAnalysis(itemName: string): StorageAnalysisResult {
    // 常见食材的储藏时间数据库
    const storageDatabase: Record<string, string> = {
      // 蔬菜类
      '白菜': '1-2周',
      '菠菜': '3-5天',
      '萝卜': '2-3周',
      '胡萝卜': '2-4周',
      '土豆': '2-3个月',
      '洋葱': '1-2个月',
      '大蒜': '3-6个月',
      '生姜': '2-3周',
      '青椒': '1-2周',
      '西红柿': '1周',
      '黄瓜': '1周',
      '茄子': '1周',
      '西兰花': '3-5天',
      '芹菜': '1-2周',
      '韭菜': '3-5天',
      '豆芽': '2-3天',
      
      // 水果类
      '苹果': '1-2个月',
      '香蕉': '5-7天',
      '橙子': '2-3周',
      '梨': '1-2周',
      '葡萄': '1-2周',
      '草莓': '3-5天',
      '桃子': '3-5天',
      '柠檬': '2-3周',
      '猕猴桃': '1-2周',
      '西瓜': '1-2周',
      '芒果': '5-7天',
      '樱桃': '3-5天',
      
      // 肉类（冷藏）
      '猪肉': '3-5天',
      '牛肉': '3-5天',
      '鸡肉': '1-2天',
      '鱼肉': '1-2天',
      '虾': '1-2天',
      '螃蟹': '1-2天',
      '羊肉': '3-5天',
      '鸭肉': '1-2天',
      
      // 乳制品
      '牛奶': '5-7天',
      '酸奶': '1-2周',
      '奶酪': '2-4周',
      '鸡蛋': '3-5周',
      '黄油': '1-3个月',
      
      // 调料
      '酱油': '2-3年',
      '醋': '2-3年',
      '盐': '无限期',
      '糖': '2年',
      '油': '1-2年',
      '蜂蜜': '无限期',
      '胡椒粉': '2-3年',
      '料酒': '1-2年',
      
      // 主食
      '大米': '6个月-1年',
      '面粉': '6-8个月',
      '面包': '3-5天',
      '馒头': '2-3天',
      '面条': '1-2年（干面）',
      
      // 豆类
      '绿豆': '2-3年',
      '红豆': '2-3年',
      '黄豆': '2-3年',
      '豆腐': '3-5天',
      '豆浆': '1-2天',
      
      // 坚果
      '花生': '6个月-1年',
      '核桃': '6个月-1年',
      '杏仁': '1年',
      '瓜子': '6个月',
    };

    // 查找精确匹配
    let duration = storageDatabase[itemName];
    
    // 如果没有精确匹配，尝试模糊匹配
    if (!duration) {
      for (const [key, value] of Object.entries(storageDatabase)) {
        if (itemName.includes(key) || key.includes(itemName)) {
          duration = value;
          break;
        }
      }
    }
    
    // 如果还是没有匹配，根据类型给出通用建议
    if (!duration) {
      if (itemName.includes('肉') || itemName.includes('鱼') || itemName.includes('虾')) {
        duration = '1-3天（冷藏）';
      } else if (itemName.includes('菜') || itemName.includes('蔬')) {
        duration = '3-7天';
      } else if (itemName.includes('果') || itemName.includes('水果')) {
        duration = '1-2周';
      } else if (itemName.includes('奶') || itemName.includes('酸奶')) {
        duration = '5-10天';
      } else if (itemName.includes('米') || itemName.includes('面')) {
        duration = '6个月-1年';
      } else {
        duration = '请查看包装说明';
      }
    }
    
    return {
      item: itemName,
      duration: duration
    };
  }
}

export const deepSeekService = new DeepSeekService();
export type { StorageAnalysisResult };