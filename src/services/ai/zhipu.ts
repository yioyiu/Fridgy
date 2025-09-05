import { getCurrentLanguage } from '@/utils/i18n';
import { getPrompt, translateStorageMethod } from './prompts';

interface ZhipuResponse {
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

class ZhipuService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    // 从环境变量获取API密钥
    this.apiKey = process.env.EXPO_PUBLIC_ZHIPU_API_KEY || '';
    this.baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  }

  async analyzeStorageTime(itemName: string): Promise<StorageAnalysisResult | null> {
    if (!this.apiKey) {
      console.error('智谱AI API key is not configured');
      return null;
    }

    try {
      console.log('调用智谱AI分析:', itemName);
      
      const currentLanguage = getCurrentLanguage();
      const prompt = getPrompt(currentLanguage, 'storageAnalysis', itemName);
      
      console.log('使用语言:', currentLanguage);
      console.log('提示词:', prompt);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4',
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
        throw new Error(`智谱AI API request failed: ${response.status}`);
      }

      const data: ZhipuResponse = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('No content in 智谱AI API response');
      }

      console.log('智谱AI返回结果:', content);

      // 解析回复内容，提取物品名、时长和储藏方式
      let result = this.parseResponse(content, itemName);
      
      // 如果不是中文，翻译储藏方式
      if (currentLanguage !== 'zh' && result) {
        result.storageMethod = translateStorageMethod(result.storageMethod, currentLanguage);
      }
      
      return result;

    } catch (error) {
      console.error('智谱AI Error analyzing storage time:', error);
      return null;
    }
  }

  async getCookingAdvice(ingredients: string[]): Promise<CookingAdviceResult | null> {
    if (!this.apiKey) {
      console.error('智谱AI API key is not configured');
      return null;
    }

    try {
      console.log('调用智谱AI获取烹饪建议:', ingredients);
      
      const currentLanguage = getCurrentLanguage();
      const prompt = getPrompt(currentLanguage, 'cookingAdvice', ingredients);
      
      console.log('使用语言:', currentLanguage);
      console.log('提示词:', prompt);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4',
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
        throw new Error(`智谱AI API request failed: ${response.status}`);
      }

      const data: ZhipuResponse = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('No content in 智谱AI API response');
      }

      console.log('智谱AI返回结果:', content);

      return {
        ingredients,
        advice: content
      };

    } catch (error) {
      console.error('智谱AI Error getting cooking advice:', error);
      return null;
    }
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

export const zhipuService = new ZhipuService();
export type { StorageAnalysisResult, CookingAdviceResult };