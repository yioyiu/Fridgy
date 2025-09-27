import { getCurrentLanguage } from '@/utils/i18n';

interface ZhipuResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

interface SeasonalFruit {
    name: string;
    season: string;
    source: '智谱AI' | 'DeepSeek AI' | '本地数据';
}

interface SeasonalFruitsResult {
    fruits: SeasonalFruit[];
    season: string;
    lastUpdated: string;
    source: '智谱AI' | 'DeepSeek AI' | '本地数据';
}

class SeasonalFruitsService {
    private apiKey: string;
    private baseURL: string;

    constructor() {
        this.apiKey = process.env.EXPO_PUBLIC_ZHIPU_API_KEY || '';
        this.baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    }

    async getSeasonalFruits(): Promise<SeasonalFruitsResult | null> {
        console.log('开始获取当季水果信息');

        // 优先级1: 尝试智谱AI
        try {
            console.log('尝试调用智谱AI获取当季水果...');
            const zhipuResult = await this.getZhipuSeasonalFruits();
            if (zhipuResult) {
                console.log('智谱AI当季水果获取成功');
                return zhipuResult;
            }
        } catch (error) {
            console.log('智谱AI调用失败，尝试DeepSeek AI:', error);
        }

        // 优先级2: 尝试DeepSeek AI
        try {
            console.log('尝试调用DeepSeek AI获取当季水果...');
            const deepSeekResult = await this.getDeepSeekSeasonalFruits();
            if (deepSeekResult) {
                console.log('DeepSeek AI当季水果获取成功');
                return deepSeekResult;
            }
        } catch (error) {
            console.log('DeepSeek AI调用失败，使用本地数据:', error);
        }

        // 优先级3: 本地数据
        console.log('使用本地当季水果数据');
        return this.getLocalSeasonalFruits();
    }

    private async getZhipuSeasonalFruits(): Promise<SeasonalFruitsResult | null> {
        if (!this.apiKey) {
            console.error('智谱AI API key is not configured');
            return null;
        }

        try {
            const currentLanguage = getCurrentLanguage();
            const currentMonth = new Date().getMonth() + 1;
            const season = this.getCurrentSeason(currentMonth);

            const prompt = this.getSeasonalFruitsPrompt(currentLanguage, season);

            console.log('使用语言:', currentLanguage);
            console.log('当前季节:', season);
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
                    max_tokens: 800,
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

            // 解析AI返回的JSON数据
            const parsedData = this.parseSeasonalFruitsResponse(content, season, '智谱AI');
            return parsedData;

        } catch (error) {
            console.error('智谱AI Error getting seasonal fruits:', error);
            return null;
        }
    }

    private async getDeepSeekSeasonalFruits(): Promise<SeasonalFruitsResult | null> {
        // 这里可以添加DeepSeek AI的实现
        // 暂时返回null，让系统使用本地数据
        return null;
    }

    private getLocalSeasonalFruits(): SeasonalFruitsResult {
        const currentMonth = new Date().getMonth() + 1;
        const season = this.getCurrentSeason(currentMonth);
        const currentLanguage = getCurrentLanguage();

        // 本地当季水果数据库
        const seasonalFruitsDatabase: Record<string, Record<string, SeasonalFruit[]>> = {
            zh: {
                '春季': [
                    {
                        name: '草莓',
                        season: '春季',
                        source: '本地数据'
                    },
                    {
                        name: '樱桃',
                        season: '春季',
                        source: '本地数据'
                    },
                    {
                        name: '枇杷',
                        season: '春季',
                        source: '本地数据'
                    }
                ],
                '夏季': [
                    {
                        name: '西瓜',
                        season: '夏季',
                        source: '本地数据'
                    },
                    {
                        name: '桃子',
                        season: '夏季',
                        source: '本地数据'
                    },
                    {
                        name: '荔枝',
                        season: '夏季',
                        source: '本地数据'
                    }
                ],
                '秋季': [
                    {
                        name: '苹果',
                        season: '秋季',
                        source: '本地数据'
                    },
                    {
                        name: '梨',
                        season: '秋季',
                        source: '本地数据'
                    },
                    {
                        name: '葡萄',
                        season: '秋季',
                        source: '本地数据'
                    }
                ],
                '冬季': [
                    {
                        name: '橙子',
                        season: '冬季',
                        source: '本地数据'
                    },
                    {
                        name: '柚子',
                        season: '冬季',
                        source: '本地数据'
                    },
                    {
                        name: '猕猴桃',
                        season: '冬季',
                        source: '本地数据'
                    }
                ]
            },
            en: {
                'Spring': [
                    {
                        name: 'Strawberry',
                        season: 'Spring',
                        source: '本地数据'
                    },
                    {
                        name: 'Cherry',
                        season: 'Spring',
                        source: '本地数据'
                    }
                ],
                'Summer': [
                    {
                        name: 'Watermelon',
                        season: 'Summer',
                        source: '本地数据'
                    },
                    {
                        name: 'Peach',
                        season: 'Summer',
                        source: '本地数据'
                    }
                ],
                'Autumn': [
                    {
                        name: 'Apple',
                        season: 'Autumn',
                        source: '本地数据'
                    },
                    {
                        name: 'Pear',
                        season: 'Autumn',
                        source: '本地数据'
                    }
                ],
                'Winter': [
                    {
                        name: 'Orange',
                        season: 'Winter',
                        source: '本地数据'
                    },
                    {
                        name: 'Grapefruit',
                        season: 'Winter',
                        source: '本地数据'
                    }
                ]
            },
            it: {
                'Primavera': [
                    {
                        name: 'Fragole',
                        season: 'Primavera',
                        source: '本地数据'
                    },
                    {
                        name: 'Ciliegie',
                        season: 'Primavera',
                        source: '本地数据'
                    },
                    {
                        name: 'Nespole',
                        season: 'Primavera',
                        source: '本地数据'
                    }
                ],
                'Estate': [
                    {
                        name: 'Anguria',
                        season: 'Estate',
                        source: '本地数据'
                    },
                    {
                        name: 'Pesche',
                        season: 'Estate',
                        source: '本地数据'
                    },
                    {
                        name: 'Litchi',
                        season: 'Estate',
                        source: '本地数据'
                    }
                ],
                'Autunno': [
                    {
                        name: 'Mele',
                        season: 'Autunno',
                        source: '本地数据'
                    },
                    {
                        name: 'Pere',
                        season: 'Autunno',
                        source: '本地数据'
                    },
                    {
                        name: 'Uva',
                        season: 'Autunno',
                        source: '本地数据'
                    }
                ],
                'Inverno': [
                    {
                        name: 'Arance',
                        season: 'Inverno',
                        source: '本地数据'
                    },
                    {
                        name: 'Pompelmi',
                        season: 'Inverno',
                        source: '本地数据'
                    },
                    {
                        name: 'Kiwi',
                        season: 'Inverno',
                        source: '本地数据'
                    }
                ]
            }
        };

        const fruits = seasonalFruitsDatabase[currentLanguage]?.[season] ||
            seasonalFruitsDatabase['zh']?.[season] ||
            [];

        return {
            fruits,
            season,
            lastUpdated: new Date().toISOString(),
            source: '本地数据'
        };
    }

    private getCurrentSeason(month: number): string {
        const currentLanguage = getCurrentLanguage();

        if (month >= 3 && month <= 5) {
            if (currentLanguage === 'zh') return '春季';
            if (currentLanguage === 'it') return 'Primavera';
            return 'Spring';
        } else if (month >= 6 && month <= 8) {
            if (currentLanguage === 'zh') return '夏季';
            if (currentLanguage === 'it') return 'Estate';
            return 'Summer';
        } else if (month >= 9 && month <= 11) {
            if (currentLanguage === 'zh') return '秋季';
            if (currentLanguage === 'it') return 'Autunno';
            return 'Autumn';
        } else {
            if (currentLanguage === 'zh') return '冬季';
            if (currentLanguage === 'it') return 'Inverno';
            return 'Winter';
        }
    }

    private getSeasonalFruitsPrompt(language: string, season: string): string {
        if (language === 'zh') {
            return `请推荐当前${season}的当季水果。

请以JSON格式返回，格式如下：
{
  "fruits": [
    {
      "name": "水果名称",
      "season": "${season}"
    }
  ]
}

推荐3-5种当季水果，要实用且常见。`;
        } else if (language === 'it') {
            return `Per favore raccomanda frutti di stagione per ${season}.

Per favore restituisci in formato JSON come segue:
{
  "fruits": [
    {
      "name": "Nome del frutto",
      "season": "${season}"
    }
  ]
}

Raccomanda 3-5 frutti di stagione che siano pratici e comuni.`;
        } else {
            return `Please recommend seasonal fruits for ${season}.

Please return in JSON format as follows:
{
  "fruits": [
    {
      "name": "Fruit name",
      "season": "${season}"
    }
  ]
}

Recommend 3-5 seasonal fruits that are practical and common.`;
        }
    }

    private parseSeasonalFruitsResponse(content: string, season: string, source: '智谱AI' | 'DeepSeek AI'): SeasonalFruitsResult {
        try {
            // 尝试解析JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                const fruits = data.fruits?.map((fruit: any) => ({
                    name: fruit.name || '',
                    season: fruit.season || season,
                    source
                })) || [];

                return {
                    fruits,
                    season,
                    lastUpdated: new Date().toISOString(),
                    source
                };
            }
        } catch (parseError) {
            console.warn('JSON解析失败，使用文本解析:', parseError);
        }

        // 如果JSON解析失败，返回空结果，让系统使用本地数据
        return {
            fruits: [],
            season,
            lastUpdated: new Date().toISOString(),
            source
        };
    }
}

export const seasonalFruitsService = new SeasonalFruitsService();
export type { SeasonalFruit, SeasonalFruitsResult };
