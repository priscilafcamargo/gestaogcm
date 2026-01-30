
import { GoogleGenAI, Type } from "@google/genai";

// Always use new GoogleGenAI({apiKey: process.env.API_KEY});

export const analyzeIncident = async (description: string) => {
  try {
    // Create a new GoogleGenAI instance right before making an API call to ensure it uses the up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise o seguinte relato de ocorrência policial e forneça um resumo estruturado em JSON com os seguintes campos: tipo_crime (string), gravidade (baixo, medio, alto), recomendacao_procedimento (string), e palavras_chave (array de strings).
      
      Relato: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tipo_crime: { type: Type.STRING },
            gravidade: { type: Type.STRING },
            recomendacao_procedimento: { type: Type.STRING },
            palavras_chave: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["tipo_crime", "gravidade", "recomendacao_procedimento"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao analisar ocorrência:", error);
    return null;
  }
};

export const refineReportText = async (text: string) => {
  try {
    // Create a new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um revisor técnico de documentos da Guarda Municipal. 
      Melhore o seguinte relato de ocorrência, tornando-o mais profissional, formal, com terminologia técnica adequada e gramaticalmente correto, sem alterar os fatos narrados.
      O texto deve ser direto e impessoal.
      
      Relato Original: "${text}"
      
      Retorne APENAS o texto revisado, sem comentários adicionais.`,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Erro ao refinar texto:", error);
    return text;
  }
};

export const generateDailyReport = async (stats: any) => {
    try {
      // Create a new GoogleGenAI instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Gere um relatório gerencial formal para o Comandante da Guarda Municipal baseado nestes dados: ${JSON.stringify(stats)}. O tom deve ser profissional e militarizado.`
      });
      return response.text;
    } catch (e) {
        return "Erro ao gerar relatório com IA.";
    }
}
