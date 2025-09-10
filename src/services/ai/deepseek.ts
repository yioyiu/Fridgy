import { getCurrentLanguage } from '@/utils/i18n';
import { getPrompt, translateStorageMethod } from './prompts';

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
  storageMethod: string;
}

interface CookingAdviceResult {
  ingredients: string[];
  advice: string;
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
    if (!this.apiKey) {
      console.error('DeepSeek API key is not configured');
      return null;
    }

    try {
      const currentLanguage = getCurrentLanguage();
      const prompt = getPrompt(currentLanguage, 'storageAnalysis', itemName);
      
      console.log('使用语言:', currentLanguage);
      console.log('DeepSeek 提示词:', prompt);
      
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

      // 直接返回AI的原始回答，不进行格式解析
      return {
        item: itemName,
        duration: '', // 不再使用
        storageMethod: '', // 不再使用
        source: 'DeepSeek AI',
        rawResponse: content
      };

    } catch (error) {
      console.error('Error analyzing storage time:', error);
      
      // 如果API调用失败，降级到本地分析
      console.log('降级到本地分析模式');
      return this.getMockAnalysis(itemName);
    }
  }

  async getCookingAdvice(ingredients: string[]): Promise<CookingAdviceResult | null> {
    if (!this.apiKey) {
      console.error('DeepSeek API key is not configured');
      return null;
    }

    try {
      const currentLanguage = getCurrentLanguage();
      const prompt = getPrompt(currentLanguage, 'cookingAdvice', ingredients);
      
      console.log('使用语言:', currentLanguage);
      console.log('DeepSeek 提示词:', prompt);
      
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
          max_tokens: 500, // 烹饪建议需要更多字数
          temperature: 0.3,
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

      console.log('DeepSeek 返回结果:', content);

      return {
        ingredients,
        advice: content
      };

    } catch (error) {
      console.error('Error getting cooking advice:', error);
      return null;
    }
  }

  // 本地分析降级功能
  private getMockAnalysis(itemName: string): StorageAnalysisResult {
    const currentLanguage = getCurrentLanguage();
    // 常见食材的储藏时间和方式数据库
    const storageDatabase: Record<string, { duration: string; method: string }> = {
      // 蔬菜类
      '白菜': { duration: '1-2周', method: '冷藏保存' },
      '菠菜': { duration: '3-5天', method: '冷藏保存' },
      '萝卜': { duration: '2-3周', method: '阴凉通风处' },
      '胡萝卜': { duration: '2-4周', method: '冷藏保存' },
      '土豆': { duration: '2-3个月', method: '阴凉干燥处' },
      '洋葱': { duration: '1-2个月', method: '通风干燥处' },
      '大蒜': { duration: '3-6个月', method: '通风干燥处' },
      '生姜': { duration: '2-3周', method: '阴凉通风处' },
      '青椒': { duration: '1-2周', method: '冷藏保存' },
      '西红柿': { duration: '1周', method: '室温保存' },
      '黄瓜': { duration: '1周', method: '冷藏保存' },
      '茄子': { duration: '1周', method: '冷藏保存' },
      '西兰花': { duration: '3-5天', method: '冷藏保存' },
      '芹菜': { duration: '1-2周', method: '冷藏保存' },
      '韭菜': { duration: '3-5天', method: '冷藏保存' },
      '豆芽': { duration: '2-3天', method: '冷藏保存' },
      
      // 水果类
      '苹果': { duration: '1-2个月', method: '冷藏保存' },
      '香蕉': { duration: '5-7天', method: '室温保存' },
      '橙子': { duration: '2-3周', method: '冷藏保存' },
      '梨': { duration: '1-2周', method: '冷藏保存' },
      '葡萄': { duration: '1-2周', method: '冷藏保存' },
      '草莓': { duration: '3-5天', method: '冷藏保存' },
      '桃子': { duration: '3-5天', method: '冷藏保存' },
      '柠檬': { duration: '2-3周', method: '冷藏保存' },
      '猕猴桃': { duration: '1-2周', method: '冷藏保存' },
      '西瓜': { duration: '1-2周', method: '冷藏保存' },
      '芒果': { duration: '5-7天', method: '室温保存' },
      '樱桃': { duration: '3-5天', method: '冷藏保存' },
      
      // 肉类（冷藏）
      '猪肉': { duration: '3-5天', method: '冷藏保存' },
      '牛肉': { duration: '3-5天', method: '冷藏保存' },
      '鸡肉': { duration: '1-2天', method: '冷藏保存' },
      '鱼肉': { duration: '1-2天', method: '冷藏保存' },
      '虾': { duration: '1-2天', method: '冷藏保存' },
      '蟹蟾': { duration: '1-2天', method: '冷藏保存' },
      '羊肉': { duration: '3-5天', method: '冷藏保存' },
      '鸭肉': { duration: '1-2天', method: '冷藏保存' },
      
      // 乳制品
      '牛奶': { duration: '5-7天', method: '冷藏保存' },
      '酸奶': { duration: '1-2周', method: '冷藏保存' },
      '奶酪': { duration: '2-4周', method: '冷藏保存' },
      '鸡蛋': { duration: '3-5周', method: '冷藏保存' },
      '黄油': { duration: '1-3个月', method: '冷藏保存' },
      
      // 调料
      '酱油': { duration: '2-3年', method: '室温密封' },
      '醋': { duration: '2-3年', method: '室温密封' },
      '盐': { duration: '无限期', method: '干燥密封' },
      '糖': { duration: '2年', method: '干燥密封' },
      '油': { duration: '1-2年', method: '阴凉密封' },
      '蜂蜜': { duration: '无限期', method: '室温密封' },
      '胡椒粉': { duration: '2-3年', method: '干燥密封' },
      '料酒': { duration: '1-2年', method: '阴凉密封' },
      
      // 主食
      '大米': { duration: '6个月-1年', method: '干燥密封' },
      '面粉': { duration: '6-8个月', method: '干燥密封' },
      '面包': { duration: '3-5天', method: '室温密封' },
      '馆头': { duration: '2-3天', method: '室温保存' },
      '面条': { duration: '1-2年（干面）', method: '干燥密封' },
      
      // 豆类
      '绿豆': { duration: '2-3年', method: '干燥密封' },
      '红豆': { duration: '2-3年', method: '干燥密封' },
      '黄豆': { duration: '2-3年', method: '干燥密封' },
      '豆腐': { duration: '3-5天', method: '冷藏保存' },
      '豆浆': { duration: '1-2天', method: '冷藏保存' },
      
      // 坚果
      '花生': { duration: '6个月-1年', method: '干燥密封' },
      '核桃': { duration: '6个月-1年', method: '干燥密封' },
      '杏仁': { duration: '1年', method: '干燥密封' },
      '瓜子': { duration: '6个月', method: '干燥密封' },
    };

    // 查找精确匹配
    let storageInfo = storageDatabase[itemName];
    
    // 如果没有精确匹配，尝试模糊匹配
    if (!storageInfo) {
      for (const [key, value] of Object.entries(storageDatabase)) {
        if (itemName.includes(key) || key.includes(itemName)) {
          storageInfo = value;
          break;
        }
      }
    }
    
    // 如果还是没有匹配，根据类型给出通用建议
    if (!storageInfo) {
      if (itemName.includes('肉') || itemName.includes('鱼') || itemName.includes('虾') || itemName.includes('蟹')) {
        storageInfo = { duration: '1-3天（冷藏）', method: '冷藏保存' };
      } else if (itemName.includes('菜') || itemName.includes('蔬')) {
        storageInfo = { duration: '3-7天', method: '冷藏保存' };
      } else if (itemName.includes('果') || itemName.includes('水果')) {
        // 水果根据类型区分储藏方式
        if (itemName.includes('香蕉') || itemName.includes('芒果') || itemName.includes('牛油果')) {
          storageInfo = { duration: '5-7天', method: '室温保存' };
        } else {
          storageInfo = { duration: '1-2周', method: '冷藏保存' };
        }
      } else if (itemName.includes('奶') || itemName.includes('酸奶') || itemName.includes('鸡蛋')) {
        storageInfo = { duration: '5-10天', method: '冷藏保存' };
      } else if (itemName.includes('米') || itemName.includes('面') || itemName.includes('豆') || itemName.includes('坚果')) {
        storageInfo = { duration: '6个月-1年', method: '干燥密封' };
      } else if (itemName.includes('油') || itemName.includes('酱') || itemName.includes('醋') || itemName.includes('蜂蜜')) {
        storageInfo = { duration: '1-3年', method: '室温密封' };
      } else if (itemName.includes('土豆') || itemName.includes('洋葱') || itemName.includes('大蒜') || itemName.includes('生姜')) {
        storageInfo = { duration: '2-4周', method: '阴凉通风处' };
      } else if (itemName.includes('面包') || itemName.includes('馒头')) {
        storageInfo = { duration: '3-5天', method: '室温密封' };
      } else if (itemName.includes('盐') || itemName.includes('糖') || itemName.includes('胡椒粉')) {
        storageInfo = { duration: '2-3年', method: '干燥密封' };
      } else {
        storageInfo = { duration: '请查看包装说明', method: '按包装说明' };
      }
    }
    
    // 构造本地分析的原始回答
    const rawResponse = currentLanguage === 'zh' 
      ? `${itemName} 最佳储藏时间和储藏方式为：${storageInfo.duration}，${storageInfo.method}`
      : currentLanguage === 'en'
      ? `The best storage time and storage method for ${itemName} are: ${storageInfo.duration}, ${currentLanguage !== 'zh' ? translateStorageMethod(storageInfo.method, currentLanguage) : storageInfo.method}`
      : `${itemName} ${currentLanguage === 'es' ? 'El mejor tiempo y método de almacenamiento son:' : 
                   currentLanguage === 'fr' ? 'Le meilleur temps et méthode de stockage sont:' :
                   currentLanguage === 'de' ? 'Die beste Lagerzeit und Lagermethode sind:' :
                   currentLanguage === 'ja' ? '最適な保存時間と保存方法は：' :
                   currentLanguage === 'ko' ? '최적의 보관 시간과 보관 방법은:' : ''} ${storageInfo.duration}，${currentLanguage !== 'zh' ? translateStorageMethod(storageInfo.method, currentLanguage) : storageInfo.method}`;
    
    return {
      item: itemName,
      duration: storageInfo.duration,
      storageMethod: currentLanguage !== 'zh' ? translateStorageMethod(storageInfo.method, currentLanguage) : storageInfo.method,
      source: 'DeepSeek AI',
      rawResponse: rawResponse
    };
  }

  private parseResponse(content: string, itemName: string): StorageAnalysisResult | null {
    // 期望格式："物品名" "时长" "储藏方式"
    const match = content.match(/"([^"]+)"\s+"([^"]+)"\s+"([^"]+)"/);
    if (match && match[1] && match[2] && match[3]) {
      return {
        item: match[1],
        duration: match[2],
        storageMethod: match[3]
      };
    }

    // 如果没有三个引号，尝试两个引号的格式
    const twoQuoteMatch = content.match(/"([^"]+)"\s+"([^"]+)"/);
    if (twoQuoteMatch && twoQuoteMatch[1] && twoQuoteMatch[2]) {
      return {
        item: twoQuoteMatch[1],
        duration: twoQuoteMatch[2],
        storageMethod: '冷藏保存' // 默认值
      };
    }

    // 如果没有引号，尝试其他格式
    const simpleMatch = content.match(/(\S+)\s+(.+)/);
    if (simpleMatch && simpleMatch[1] && simpleMatch[2]) {
      return {
        item: simpleMatch[1],
        duration: simpleMatch[2],
        storageMethod: '冷藏保存'
      };
    }

    // 如果解析失败，返回原始内容
    return {
      item: itemName,
      duration: content,
      storageMethod: '请查看包装说明'
    };
  }
}

export const deepSeekService = new DeepSeekService();
export type { StorageAnalysisResult, CookingAdviceResult };