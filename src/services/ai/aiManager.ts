import { zhipuService } from './zhipu';
import { deepSeekService } from './deepseek';
import { getCurrentLanguage } from '@/utils/i18n';
import { translateStorageMethod, getPrompt } from './prompts';

interface StorageAnalysisResult {
  item: string;
  duration: string;
  storageMethod: string;
  source: '智谱AI' | 'DeepSeek AI' | '本地分析';
  rawResponse?: string; // 添加原始AI回答字段
}

interface CookingAdviceResult {
  ingredients: string[];
  advice: string;
  source: '智谱AI' | 'DeepSeek AI' | '本地建议';
}

class AIManager {
  async analyzeStorageTime(itemName: string): Promise<StorageAnalysisResult | null> {
    console.log('开始AI储藏分析，物品:', itemName);
    
    // 优先级1: 尝试智谱AI
    try {
      console.log('尝试调用智谱AI...');
      const zhipuResult = await zhipuService.analyzeStorageTime(itemName);
      if (zhipuResult) {
        console.log('智谱AI分析成功');
        return {
          ...zhipuResult,
          source: '智谱AI'
        };
      }
    } catch (error) {
      console.log('智谱AI调用失败，尝试DeepSeek AI:', error);
    }
    
    // 优先级2: 尝试DeepSeek AI
    try {
      console.log('尝试调用DeepSeek AI...');
      const deepSeekResult = await deepSeekService.analyzeStorageTime(itemName);
      if (deepSeekResult) {
        console.log('DeepSeek AI分析成功');
        return {
          ...deepSeekResult,
          source: 'DeepSeek AI'
        };
      }
    } catch (error) {
      console.log('DeepSeek AI调用失败，使用本地分析:', error);
    }
    
    // 优先级3: 本地分析（深度获取）
    console.log('使用本地分析作为最后备选');
    const localResult = this.getLocalAnalysis(itemName);
    return localResult;
  }

  async getCookingAdvice(ingredients: string[]): Promise<CookingAdviceResult | null> {
    console.log('开始AI烹饪建议分析，食材:', ingredients);
    
    // 优先级1: 尝试智谱AI
    try {
      console.log('尝试调用智谱AI获取烹饪建议...');
      const zhipuResult = await zhipuService.getCookingAdvice(ingredients);
      if (zhipuResult) {
        console.log('智谱AI烹饪建议成功');
        return {
          ...zhipuResult,
          source: '智谱AI'
        };
      }
    } catch (error) {
      console.log('智谱AI调用失败，尝试DeepSeek AI:', error);
    }
    
    // 优先级2: 尝试DeepSeek AI
    try {
      console.log('尝试调用DeepSeek AI获取烹饪建议...');
      const deepSeekResult = await deepSeekService.getCookingAdvice(ingredients);
      if (deepSeekResult) {
        console.log('DeepSeek AI烹饪建议成功');
        return {
          ...deepSeekResult,
          source: 'DeepSeek AI'
        };
      }
    } catch (error) {
      console.log('DeepSeek AI调用失败，使用本地建议:', error);
    }
    
    // 优先级3: 本地建议
    console.log('使用本地建议作为最后备选');
    const localResult = this.getLocalCookingAdvice(ingredients);
    return localResult;
  }

  // 本地分析功能
  private getLocalAnalysis(itemName: string): StorageAnalysisResult {
    const currentLanguage = getCurrentLanguage();
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
      '螃蟹': { duration: '1-2天', method: '冷藏保存' },
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
      '馒头': { duration: '2-3天', method: '室温保存' },
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
      '腰果': { duration: '6个月-1年', method: '干燥密封' },
      '开心果': { duration: '6个月-1年', method: '干燥密封' },
      
      // 更多水果
      '牛油果': { duration: '5-7天', method: '室温保存' },
      '火龙果': { duration: '1-2周', method: '冷藏保存' },
      '榴莲': { duration: '3-5天', method: '室温保存' },
      '山竹': { duration: '3-5天', method: '冷藏保存' },
      '荔枝': { duration: '3-5天', method: '冷藏保存' },
      '龙眼': { duration: '3-5天', method: '冷藏保存' },
      '菠萝': { duration: '1-2周', method: '室温保存' },
      '椰子': { duration: '2-3周', method: '室温保存' },
      
      // 更多蔬菜
      '韭菜': { duration: '3-5天', method: '冷藏保存' },
      '香菜': { duration: '3-5天', method: '冷藏保存' },
      '生菜': { duration: '3-5天', method: '冷藏保存' },
      '小白菜': { duration: '3-5天', method: '冷藏保存' },
      '油菜': { duration: '3-5天', method: '冷藏保存' },
      '菠菜': { duration: '3-5天', method: '冷藏保存' },
      '茼蒿': { duration: '3-5天', method: '冷藏保存' },
      '空心菜': { duration: '3-5天', method: '冷藏保存' },
      
      // 更多调料
      '料酒': { duration: '1-2年', method: '阴凉密封' },
      '生抽': { duration: '2-3年', method: '室温密封' },
      '老抽': { duration: '2-3年', method: '室温密封' },
      '蚝油': { duration: '1-2年', method: '冷藏保存' },
      '豆瓣酱': { duration: '1-2年', method: '室温密封' },
      '番茄酱': { duration: '1年', method: '冷藏保存' },
      '沙拉酱': { duration: '6个月', method: '冷藏保存' },
      '芥末': { duration: '1-2年', method: '冷藏保存' },
      
      // 更多主食
      '馒头': { duration: '2-3天', method: '室温保存' },
      '包子': { duration: '1-2天', method: '冷藏保存' },
      '饺子': { duration: '1-2天', method: '冷藏保存' },
      '馄饨': { duration: '1-2天', method: '冷藏保存' },
      '汤圆': { duration: '1-2天', method: '冷藏保存' },
      '年糕': { duration: '3-5天', method: '冷藏保存' },
      
      // 更多豆制品
      '豆腐': { duration: '3-5天', method: '冷藏保存' },
      '豆浆': { duration: '1-2天', method: '冷藏保存' },
      '豆腐干': { duration: '1周', method: '冷藏保存' },
      '腐竹': { duration: '6个月', method: '干燥密封' },
      '豆皮': { duration: '3-5天', method: '冷藏保存' },
      '豆腐乳': { duration: '1年', method: '室温密封' },
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
      source: '本地分析',
      rawResponse: rawResponse
    };
  }

  // 本地烹饪建议功能
  private getLocalCookingAdvice(ingredients: string[]): CookingAdviceResult {
    const currentLanguage = getCurrentLanguage();
    
    // 基础烹饪建议数据库
    const cookingDatabase: Record<string, { methods: string[]; tips: string }> = {
      // 蔬菜类
      '菠菜': {
        methods: ['热水焦烫后凉拌', '菠菜鸡蛋汤', '菠菜烒鸡蛋'],
        tips: '菠菜容易变质，建议先用开水焦烫去除草酸。'
      },
      '西红柿': {
        methods: ['西红柿鸡蛋面', '糖醇西红柿', '西红柿烒鸡蛋'],
        tips: '较软的西红柿适合做汤或烒菜，可以去皮后使用。'
      },
      '面包': {
        methods: ['烤面包丁', '面包布丁', '法式吉士拌面包'],
        tips: '变硬的面包可以做面包粋或面包丁，发霉的面包不能食用。'
      },
      '土豆': {
        methods: ['土豆丝', '土豆炒肉丝', '土豆炒牛肉'],
        tips: '发芽的土豆要去掉芽眼，变绿的土豆不宜食用。'
      },
      '鸡蛋': {
        methods: ['水煮蛋', '鸡蛋炒饭', '鸡蛋羹嘴豆'],
        tips: '可以做水煮蛋保存更久，或者用来做各种烒菜。'
      },
      '鸡胸肉': {
        methods: ['鸡胸肉丁炒菜', '鸡胸肉汤', '鸡胸肉沙拉'],
        tips: '切成丁状烒熟后可以冷藏保存，做沙拉或炒饭。'
      },
      '香蕉': {
        methods: ['香蕉奥利奥饼干', '香蕉奶昵', '香蕉面包'],
        tips: '过熟的香蕉适合做甜点或奶昵，可以冷冻保存。'
      },
      '牛奶': {
        methods: ['奶昵', '鸡蛋罾', '奶油汤'],
        tips: '过期不久的牛奶可以用来做甜点，但要先闻一下是否有异味。'
      }
    };

    // 全局通用建议
    const generalAdvice = {
      zh: `针对您的食材，以下是一些建议：\n\n1. **快速烒菜**：将即将过期的蔬菜和肉类一起烒制，加入适量调料。\n\n2. **做汤**：将所有食材切碗放入锅中煮汤，既营养又不浪费。\n\n3. **制作炒饭**：将蔬菜和肉类切丁，与米饭一起炒制，做成炒饭。\n\n**安全提示**：请确保食材没有发霉、变质或有异味，如有疑问请勿食用。`,
      en: `For your ingredients, here are some suggestions:\n\n1. **Quick Stir-fry**: Stir-fry the vegetables and meat together with appropriate seasonings.\n\n2. **Make Soup**: Cut all ingredients into pieces and cook them in a pot to make a nutritious soup.\n\n3. **Fried Rice**: Dice the vegetables and meat, then stir-fry with rice to make fried rice.\n\n**Safety Note**: Please ensure the ingredients are not moldy, spoiled, or have strange odors. When in doubt, do not consume.`,
      es: `Para sus ingredientes, aquí hay algunas sugerencias:\n\n1. **Salteado rápido**: Saltee las verduras y la carne juntas con condimentos apropiados.\n\n2. **Hacer sopa**: Corte todos los ingredientes en trozos y cuézalos en una olla para hacer una sopa nutritiva.\n\n3. **Arroz frito**: Corte en cubitos las verduras y la carne, luego saltee con arroz para hacer arroz frito.\n\n**Nota de seguridad**: Asegúrese de que los ingredientes no estén mohosos, dañados o tengan olores extraños. En caso de duda, no consuma.`,
      fr: `Pour vos ingrédients, voici quelques suggestions :\n\n1. **Sauté rapide** : Faites sauter les légumes et la viande ensemble avec des assaisonnements appropriés.\n\n2. **Faire une soupe** : Coupez tous les ingrédients en morceaux et faites-les cuire dans une casserole pour faire une soupe nutritive.\n\n3. **Riz sauté** : Coupez en dés les légumes et la viande, puis faites sauter avec du riz pour faire du riz sauté.\n\n**Note de sécurité** : Assurez-vous que les ingrédients ne sont pas moisis, abîmés ou n'ont pas d'odeurs étranges. En cas de doute, ne consommez pas.`,
      de: `Für Ihre Zutaten sind hier einige Vorschläge:\n\n1. **Schnelles Anbraten**: Braten Sie Gemüse und Fleisch zusammen mit geeigneten Gewürzen an.\n\n2. **Suppe machen**: Schneiden Sie alle Zutaten in Stücke und kochen Sie sie in einem Topf, um eine nahrhafte Suppe zu machen.\n\n3. **Gebratener Reis**: Würfeln Sie Gemüse und Fleisch, dann braten Sie mit Reis für gebratenen Reis.\n\n**Sicherheitshinweis**: Stellen Sie sicher, dass die Zutaten nicht schimmelig, verdorben sind oder seltsame Gerüche haben. Im Zweifel nicht verzehren.`,
      ja: `あなたの食材に対して、いくつかの提案があります：\n\n1. **簡単炒め物**: 野菜と肉を適切な調味料で一緒に炒めます。\n\n2. **スープ作り**: すべての食材を小さく切って鐘で煮て栄養価の高いスープを作ります。\n\n3. **チャーハン**: 野菜と肉をサイコロ状に切って、米と一緒に炒めてチャーハンを作ります。\n\n**安全の注意**: 食材にカビ、腐敗、奇妙な臭いがないことを確認してください。疑わしい場合は食べないでください。`,
      ko: `귀하의 식재료에 대해 몇 가지 제안이 있습니다:\n\n1. **빠른 볶음**: 야채와 고기를 적절한 양념과 함께 볶아냅니다.\n\n2. **수프 만들기**: 모든 재료를 작게 자르고 냄비에 끓여 영양가 있는 수프를 만듭니다.\n\n3. **볶음밥**: 야채와 고기를 주사위 모양으로 자른 다음 밥과 함께 볶아 볶음밥을 만듭니다.\n\n**안전 주의사항**: 식재료에 곰팡이, 변질, 이상한 냄새가 없는지 확인하세요. 의심스러우면 섭취하지 마세요.`
    };

    // 根据具体食材生成建议
    let specificAdvice = '';
    const matchedIngredients: string[] = [];
    
    ingredients.forEach(ingredient => {
      for (const [key, value] of Object.entries(cookingDatabase)) {
        if (ingredient.includes(key) || key.includes(ingredient)) {
          matchedIngredients.push(ingredient);
          specificAdvice += `\n\n**${ingredient}**:\n${value.methods.map((method, index) => `${index + 1}. ${method}`).join('\n')}\nℹ️ ${value.tips}`;
          break;
        }
      }
    });

    const finalAdvice = specificAdvice || generalAdvice[currentLanguage] || generalAdvice.zh;
    
    return {
      ingredients,
      advice: finalAdvice,
      source: '本地建议'
    };
  }
}

export const aiManager = new AIManager();
export type { StorageAnalysisResult, CookingAdviceResult };