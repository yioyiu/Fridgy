import { LanguageCode } from '@/utils/i18n';

// AI提示词模板
export const AI_PROMPTS = {
  en: {
    storageAnalysis: (itemName: string) => `What is the best storage time and storage method for "${itemName}"?`,

    cookingAdvice: (ingredients: string[]) => `I have the following ingredients that are about to expire: ${ingredients.join(', ')}. Please suggest 2-3 simple and practical cooking methods or recipes to avoid food waste. Please provide the answer in English with clear cooking steps.`,

    // 结果翻译提示
    translateResult: (result: string) => `Please translate the following storage analysis result to English: ${result}. Keep the format: "item_name" "storage_time" "storage_method"`,
  },

  zh: {
    storageAnalysis: (itemName: string) => `请问 "${itemName}" 最佳储藏时间为多少？最佳储藏方式是什么？`,

    cookingAdvice: (ingredients: string[]) => `我有以下即将过期的食材：${ingredients.join('、')}。请建议2-3种简单实用的烹饪方法或食谱，以避免食物浪费。请用中文回答，并提供清晰的烹饪步骤。`,

    translateResult: (result: string) => `请将以下储藏分析结果翻译为中文：${result}。保持格式："物品名称" "储藏时间" "储藏方式"`,
  },

  es: {
    storageAnalysis: (itemName: string) => `¿Cuál es el mejor tiempo de almacenamiento y método de almacenamiento para "${itemName}"?`,

    cookingAdvice: (ingredients: string[]) => `Tengo los siguientes ingredientes que están a punto de caducar: ${ingredients.join(', ')}. Por favor sugiere 2-3 métodos de cocina simples y prácticos o recetas para evitar el desperdicio de comida. Por favor proporciona la respuesta en español con pasos de cocina claros.`,

    translateResult: (result: string) => `Por favor traduce el siguiente resultado de análisis de almacenamiento al español: ${result}. Mantén el formato: "nombre_artículo" "tiempo_almacenamiento" "método_almacenamiento"`,
  },

  fr: {
    storageAnalysis: (itemName: string) => `Quel est le meilleur temps de stockage et méthode de stockage pour "${itemName}" ?`,

    cookingAdvice: (ingredients: string[]) => `J'ai les ingrédients suivants qui sont sur le point d'expirer : ${ingredients.join(', ')}. Veuillez suggérer 2-3 méthodes de cuisine simples et pratiques ou recettes pour éviter le gaspillage alimentaire. Veuillez fournir la réponse en français avec des étapes de cuisine claires.`,

    translateResult: (result: string) => `Veuillez traduire le résultat d'analyse de stockage suivant en français : ${result}. Gardez le format : "nom_article" "temps_stockage" "méthode_stockage"`,
  },

  de: {
    storageAnalysis: (itemName: string) => `Was ist die beste Lagerzeit und Lagermethode für "${itemName}"?`,

    cookingAdvice: (ingredients: string[]) => `Ich habe folgende Zutaten, die bald ablaufen: ${ingredients.join(', ')}. Bitte schlagen Sie 2-3 einfache und praktische Kochmethoden oder Rezepte vor, um Lebensmittelverschwendung zu vermeiden. Bitte geben Sie die Antwort auf Deutsch mit klaren Kochschritten an.`,

    translateResult: (result: string) => `Bitte übersetzen Sie das folgende Lagerungsanalyseergebnis ins Deutsche: ${result}. Behalten Sie das Format bei: "artikelname" "lagerzeit" "lagermethode"`,
  },

  ja: {
    storageAnalysis: (itemName: string) => `"${itemName}" の最適な保存期間と保存方法は何ですか？`,

    cookingAdvice: (ingredients: string[]) => `以下の賞味期限が近い食材があります：${ingredients.join('、')}。食材の無駄を避けるための2-3つの簡単で実用的な調理方法やレシピを提案してください。明確な調理手順を日本語で答えてください。`,

    translateResult: (result: string) => `次の保存分析結果を日本語に翻訳してください：${result}。フォーマットを保持してください："アイテム名" "保存期間" "保存方法"`,
  },

  ko: {
    storageAnalysis: (itemName: string) => `"${itemName}"의 최적 보관 시간과 보관 방법은 무엇입니까?`,

    cookingAdvice: (ingredients: string[]) => `다음과 같은 유통기한이 임박한 식재료가 있습니다: ${ingredients.join(', ')}. 음식 낭비를 피하기 위한 2-3가지 간단하고 실용적인 요리 방법이나 레시피를 제안해 주세요. 명확한 요리 단계를 한국어로 답변해 주세요.`,

    translateResult: (result: string) => `다음 보관 분석 결과를 한국어로 번역해 주세요: ${result}. 형식을 유지해 주세요: "품목명" "보관_시간" "보관_방법"`,
  },

  it: {
    storageAnalysis: (itemName: string) => `Qual è il tempo di conservazione ottimale e il metodo di conservazione per "${itemName}"?`,

    cookingAdvice: (ingredients: string[]) => `Ho i seguenti ingredienti che stanno per scadere: ${ingredients.join(', ')}. Per favore suggerisci 2-3 metodi di cottura semplici e pratici o ricette per evitare lo spreco di cibo. Per favore fornisci la risposta in italiano con passi di cottura chiari.`,

    translateResult: (result: string) => `Per favore traduci il seguente risultato di analisi di conservazione in italiano: ${result}. Mantieni il formato: "nome_articolo" "tempo_conservazione" "metodo_conservazione"`,
  },
} as const;

// 获取指定语言的提示词
export const getPrompt = (language: LanguageCode, type: 'storageAnalysis' | 'translateResult' | 'cookingAdvice', param: string | string[]): string => {
  const prompts = AI_PROMPTS[language];

  if (!prompts) {
    // 如果语言不支持，回退到英语
    const fallbackPrompts = AI_PROMPTS.en;
    if (type === 'cookingAdvice' && Array.isArray(param)) {
      return fallbackPrompts.cookingAdvice(param);
    } else if ((type === 'storageAnalysis' || type === 'translateResult') && typeof param === 'string') {
      return fallbackPrompts[type](param);
    }
    return '';
  }

  if (type === 'cookingAdvice' && Array.isArray(param)) {
    return prompts.cookingAdvice(param);
  } else if ((type === 'storageAnalysis' || type === 'translateResult') && typeof param === 'string') {
    return prompts[type](param);
  }

  return '';
};

// 本地化储藏方式术语
export const STORAGE_METHODS = {
  en: {
    '冷藏保存': 'Refrigerate',
    '室温保存': 'Room temperature',
    '干燥密封': 'Dry sealed',
    '阴凉密封': 'Cool sealed',
    '通风干燥处': 'Ventilated dry place',
    '阴凉通风处': 'Cool ventilated place',
    '室温密封': 'Room temperature sealed',
    '冷冻保存': 'Freeze',
    '按包装说明': 'Follow package instructions',
  },
  zh: {
    'Refrigerate': '冷藏保存',
    'Room temperature': '室温保存',
    'Dry sealed': '干燥密封',
    'Cool sealed': '阴凉密封',
    'Ventilated dry place': '通风干燥处',
    'Cool ventilated place': '阴凉通风处',
    'Room temperature sealed': '室温密封',
    'Freeze': '冷冻保存',
    'Follow package instructions': '按包装说明',
  },
  es: {
    '冷藏保存': 'Refrigerar',
    '室温保存': 'Temperatura ambiente',
    '干燥密封': 'Sellado seco',
    '阴凉密封': 'Sellado fresco',
    '通风干燥处': 'Lugar seco ventilado',
    '阴凉通风处': 'Lugar fresco ventilado',
    '室温密封': 'Sellado a temperatura ambiente',
    '冷冻保存': 'Congelar',
    '按包装说明': 'Seguir instrucciones del paquete',
  },
  fr: {
    '冷藏保存': 'Réfrigérer',
    '室温保存': 'Température ambiante',
    '干燥密封': 'Scellé sec',
    '阴凉密封': 'Scellé frais',
    '通风干燥处': 'Endroit sec ventilé',
    '阴凉通风处': 'Endroit frais ventilé',
    '室温密封': 'Scellé à température ambiante',
    '冷冻保存': 'Congeler',
    '按包装说明': 'Suivre les instructions du paquet',
  },
  de: {
    '冷藏保存': 'Kühlen',
    '室温保存': 'Raumtemperatur',
    '干燥密封': 'Trocken versiegelt',
    '阴凉密封': 'Kühl versiegelt',
    '通风干燥处': 'Belüfteter trockener Ort',
    '阴凉通风处': 'Kühler belüfteter Ort',
    '室温密封': 'Bei Raumtemperatur versiegelt',
    '冷冻保存': 'Einfrieren',
    '按包装说明': 'Packungsanweisungen befolgen',
  },
  ja: {
    '冷藏保存': '冷蔵保存',
    '室温保存': '常温保存',
    '干燥密封': '乾燥密封',
    '阴凉密封': '冷暗密封',
    '通风干燥处': '通風の良い乾燥した場所',
    '阴凉通风处': '冷暗で通風の良い場所',
    '室温密封': '常温密封',
    '冷冻保存': '冷凍保存',
    '按包装说明': 'パッケージの指示に従う',
  },
  ko: {
    '冷藏保存': '냉장 보관',
    '室温保存': '실온 보관',
    '干燥密封': '건조 밀봉',
    '阴凉密封': '서늘한 곳 밀봉',
    '通风干燥处': '통풍이 잘 되는 건조한 곳',
    '阴凉通风处': '서늘하고 통풍이 잘 되는 곳',
    '室温密封': '실온 밀봉',
    '冷冻保存': '냉동 보관',
    '按包装说明': '포장 지시사항 따르기',
  },
  it: {
    '冷藏保存': 'Refrigerare',
    '室温保存': 'Temperatura ambiente',
    '干燥密封': 'Sigillato asciutto',
    '阴凉密封': 'Sigillato fresco',
    '通风干燥处': 'Luogo asciutto ventilato',
    '阴凉通风处': 'Luogo fresco ventilato',
    '室温密封': 'Sigillato a temperatura ambiente',
    '冷冻保存': 'Congelare',
    '按包装说明': 'Seguire le istruzioni della confezione',
  },
} as const;

// 翻译储藏方式
export const translateStorageMethod = (method: string, targetLanguage: LanguageCode): string => {
  const translations = STORAGE_METHODS[targetLanguage];
  if (translations && method in translations) {
    return translations[method as keyof typeof translations];
  }
  return method; // 如果没有翻译，返回原文
};