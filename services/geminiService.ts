
import { GoogleGenAI, GenerateContentResponse, ChatMessage as GeminiChatMessage, Part } from "@google/genai";
import { AnamnesisData, ChatMessage, PCComponent, AIRecommendation } from '../types';
import { MOCK_COMPONENTS } from '../constants/components'; // For providing component list to AI

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please set the process.env.API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "NO_KEY_PROVIDED" }); // Fallback to avoid crash if key missing
const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

const parseJsonFromGeminiResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", e, "\nRaw response:", responseText);
    return null;
  }
};


export const getChatbotResponse = async (
  history: ChatMessage[],
  userInput: string,
  currentAnamnesis: AnamnesisData
): Promise<{ aiResponse: string; updatedAnamnesis: AnamnesisData }> => {
  if (!API_KEY) return { aiResponse: "Desculpe, o serviço de IA não está configurado corretamente (sem API Key).", updatedAnamnesis: currentAnamnesis };

  const chatHistoryForGemini: GeminiChatMessage[] = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  const systemInstruction = `Você é CodeTuga, um assistente amigável e especialista em montagem de PCs. Seu objetivo é coletar os requisitos do usuário para um novo PC.
Faça perguntas uma a uma para entender:
1.  Propósito principal (Ex: jogos, trabalho, edição de vídeo, uso geral).
2.  Orçamento em BRL (Reais).
3.  Condições ambientais: Temperatura (Baixa, Média, Alta), Umidade (Baixa, Média, Alta), Poeira (Baixa, Média, Alta).
4.  Preferências adicionais (Ex: priorizar desempenho, silêncio, marca específica, necessidade de periféricos).
Mantenha as perguntas claras e concisas. Tente extrair uma informação por vez.
Quando tiver coletado uma informação, confirme-a brevemente.
Exemplo de interações:
Usuário: Quero montar um PC.
Você: Olá! Claro, posso te ajudar com isso. Para começar, qual será o propósito principal do seu novo PC? (Ex: jogos, trabalho, edição de vídeo)
Usuário: Para jogos.
Você: Ótimo, um PC para jogos! E qual o seu orçamento aproximado em Reais (BRL) para este projeto?
Usuário: 5000 BRL
Você: Entendido, orçamento de R$5000. Agora, sobre o ambiente onde o PC será usado: como você descreveria a temperatura média? (Baixa, Média ou Alta)
... e assim por diante para umidade e poeira.
Depois de coletar tudo, resuma as informações e pergunte se está tudo correto antes de prosseguir para a recomendação.
O estado atual das informações coletadas é: ${JSON.stringify(currentAnamnesis)}. Tente preencher os campos faltantes.
Responda APENAS com a sua próxima pergunta ou resumo. NÃO inclua saudações repetitivas se a conversa já começou.
Se todos os campos (purpose, budget, envTemperature, envHumidity, envDust) estiverem preenchidos, diga algo como: "Ok, coletei as seguintes informações: [resumo das informações]. Está tudo correto? Se sim, posso prosseguir para gerar uma recomendação."
`;

  try {
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [...chatHistoryForGemini, { role: 'user', parts: [{ text: userInput }] }],
      config: {
        systemInstruction: systemInstruction,
        // thinkingConfig: { thinkingBudget: 0 } // For lower latency if needed, but might reduce quality
      },
    });
    
    const aiText = result.text;
    
    // Simple heuristic to update anamnesis based on keywords. A more robust NLP approach might be needed for production.
    const updatedAnamnesis = { ...currentAnamnesis };
    const lowerInput = userInput.toLowerCase();
    if (!updatedAnamnesis.purpose && (lowerInput.includes("jogos") || lowerInput.includes("game") || lowerInput.includes("gaming"))) updatedAnamnesis.purpose = "Jogos";
    if (!updatedAnamnesis.purpose && (lowerInput.includes("trabalho") || lowerInput.includes("work"))) updatedAnamnesis.purpose = "Trabalho";
    if (!updatedAnamnesis.purpose && (lowerInput.includes("edição") || lowerInput.includes("video") || lowerInput.includes("design"))) updatedAnamnesis.purpose = "Edição/Design";
    
    const budgetMatch = userInput.match(/(\d{3,}(\.\d{1,2})?)/);
    if (!updatedAnamnesis.budget && budgetMatch && budgetMatch[1]) {
      updatedAnamnesis.budget = parseFloat(budgetMatch[1]);
    }

    ['baixa', 'média', 'alta'].forEach(level => {
        if(lowerInput.includes(level)) {
            if((lowerInput.includes("temperatura") || aiText.toLowerCase().includes("temperatura")) && !updatedAnamnesis.envTemperature) updatedAnamnesis.envTemperature = level.charAt(0).toUpperCase() + level.slice(1) as 'Baixa' | 'Média' | 'Alta';
            if((lowerInput.includes("umidade") || aiText.toLowerCase().includes("umidade")) && !updatedAnamnesis.envHumidity) updatedAnamnesis.envHumidity = level.charAt(0).toUpperCase() + level.slice(1) as 'Baixa' | 'Média' | 'Alta';
            if((lowerInput.includes("poeira") || aiText.toLowerCase().includes("poeira")) && !updatedAnamnesis.envDust) updatedAnamnesis.envDust = level.charAt(0).toUpperCase() + level.slice(1) as 'Baixa' | 'Média' | 'Alta';
        }
    });
    
    return { aiResponse: aiText, updatedAnamnesis };

  } catch (error) {
    console.error("Error calling Gemini API (getChatbotResponse):", error);
    return { aiResponse: "Desculpe, ocorreu um erro ao processar sua solicitação.", updatedAnamnesis: currentAnamnesis };
  }
};


export const getBuildRecommendation = async (
  requirements: AnamnesisData,
  availableComponents: PCComponent[]
): Promise<AIRecommendation | null> => {
  if (!API_KEY) {
    console.error("Gemini API Key not configured for getBuildRecommendation");
    return null;
  }

  // Prepare a summarized list of components for the prompt
  const componentSummary = availableComponents.map(c => ({
    id: c.id,
    category: c.category,
    name: c.name,
    price: c.price,
    key_specs: `${c.specs.socket || c.specs.type || ''} ${c.specs.chipset || c.specs.capacity_gb || ''} ${c.specs.tdp || c.specs.wattage_w || ''}`.trim()
  }));

  const prompt = `
Você é um especialista em montagem de PCs. Sua tarefa é recomendar uma build otimizada com base nos seguintes requisitos e componentes disponíveis.

Requisitos do Usuário:
- Propósito: ${requirements.purpose || 'Não especificado'}
- Orçamento (BRL): ${requirements.budget || 'Não especificado, tente o melhor custo-benefício'}
- Temperatura Ambiente: ${requirements.envTemperature || 'Média'}
- Umidade Ambiente: ${requirements.envHumidity || 'Média'}
- Nível de Poeira: ${requirements.envDust || 'Médio'}
- Preferências Adicionais: ${requirements.preferences || 'Nenhuma'}

Componentes Disponíveis (ID, Categoria, Nome, Preço, Especificações Chave):
${JSON.stringify(componentSummary, null, 2)}

Instruções:
1.  Selecione um componente para cada categoria essencial (CPU, Placa-mãe, RAM, Armazenamento, Fonte, Gabinete, Placa de Vídeo se o propósito exigir, Cooler CPU).
2.  Priorize a compatibilidade entre os componentes (ex: socket CPU vs Placa-mãe, tipo de RAM).
3.  Otimize para o propósito do usuário e tente ficar dentro do orçamento.
4.  Considere as condições ambientais:
    -   Alta temperatura: Sugira coolers mais potentes e gabinetes com bom fluxo de ar.
    -   Alta umidade: (Menos crítico para componentes, mas bom airflow ajuda).
    -   Alta poeira: Sugira gabinetes com bons filtros de poeira.
5.  Se o orçamento for insuficiente para os requisitos mínimos, você pode:
    a.  Sugerir um aumento de X no orçamento, explicando o benefício.
    b.  Oferecer uma build alternativa com desempenho inferior, mas dentro do orçamento, detalhando os compromissos.
    c.  Indique esta situação no campo 'budgetNotes'.
6.  Calcule o preço total estimado da build.
7.  Forneça uma breve justificativa para suas escolhas.
8.  Liste quaisquer avisos de compatibilidade importantes, se houver.

Responda OBRIGATORIAMENTE em formato JSON. O JSON deve ter a seguinte estrutura:
{
  "recommendedComponentIds": ["id_cpu", "id_mobo", ...],
  "justification": "Breve explicação das escolhas.",
  "estimatedTotalPrice": 1234.56,
  "budgetNotes": "Notas sobre o orçamento, se aplicável.",
  "compatibilityWarnings": ["Aviso 1", "Aviso 2"]
}

Não inclua nenhum texto fora do bloco JSON.
`;

  try {
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const recommendation = parseJsonFromGeminiResponse<AIRecommendation>(result.text);
    return recommendation;

  } catch (error) {
    console.error("Error calling Gemini API (getBuildRecommendation):", error);
    // Attempt to get text if it's a Gemini error response
    // @ts-ignore
    if (error.response && error.response.text) {
       // @ts-ignore
      console.error("Gemini Error Response Text:", await error.response.text());
    }
    return null;
  }
};

    