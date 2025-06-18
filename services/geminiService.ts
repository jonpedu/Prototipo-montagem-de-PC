
import { GoogleGenAI, GenerateContentResponse, Part, Content } from "@google/genai";
import { AnamnesisData, ChatMessage, PCComponent, AIRecommendation, MachineType, PurposeType, GamingType, WorkField, CreativeEditingType, CreativeWorkResolution, ProjectSize, BuildExperience, AestheticsImportance, ServerType, ServerUptime, ServerScalability, EnvTempControlType, CaseSizeType, NoiseLevelType } from '../types';
import { MOCK_COMPONENTS } from '../constants/components'; // For providing component list to AI

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is não está configurada. Por favor, defina a variável de ambiente process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "NO_KEY_PROVIDED" }); 
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
    console.error("Falha ao analisar resposta JSON do Gemini:", e, "\nResposta Bruta:", responseText);
    return null;
  }
};


export const getChatbotResponse = async (
  history: ChatMessage[],
  userInput: string,
  currentAnamnesis: AnamnesisData
): Promise<{ aiResponse: string; updatedAnamnesis: AnamnesisData }> => {
  if (!API_KEY) return { aiResponse: "Desculpe, o serviço de IA não está configurado corretamente (sem API Key).", updatedAnamnesis: currentAnamnesis };

  const chatHistoryForGemini: Content[] = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : (msg.sender === 'ai' ? 'model' : 'user'),
    parts: [{ text: msg.text }],
  }));

  const systemInstruction = `Você é CodeTuga, um assistente especializado em montagem de PCs. Siga este fluxo inteligente para coleta de requisitos:

ESTADO ATUAL DA COLETA: ${JSON.stringify(currentAnamnesis)}

FLUXO DE PERGUNTAS INTELIGENTE:

1.  **Identificação do Tipo de Máquina** (se \`!currentAnamnesis.machineType\`):
    Pergunte: "Que tipo de máquina você deseja montar? (Computador Pessoal, Servidor, Estação de Trabalho, Máquina para Mineração, PC para Streaming, Outro)"

2.  **Fluxos Específicos por Tipo** (após \`machineType\` ser definido):

    ### Para Computador Pessoal (\`currentAnamnesis.machineType === 'Computador Pessoal'\`):
    a.  **Propósito Principal** (se \`!currentAnamnesis.purpose\`):
        Pergunte: "Qual será o uso principal? (Jogos, Trabalho/Produtividade, Edição Criativa, Uso Geral, HTPC)"
    
    b.  **Sub-fluxos por Propósito**:
        
        #### Jogos (\`currentAnamnesis.purpose === 'Jogos'\`):
        -   Se \`!currentAnamnesis.gamingType\`: "Que tipo de jogos você pretende jogar? (Competitivos/eSports, AAA/High-End, VR, Casual)"
        -   Se \`currentAnamnesis.gamingType\` e \`!currentAnamnesis.monitorSpecs\`: "Qual resolução e taxa de atualização do seu monitor? (Ex: 1080p/60Hz, 1440p/144Hz, 4K/60Hz+)"
        -   Se \`currentAnamnesis.monitorSpecs\` e \`!currentAnamnesis.peripheralsNeeded\`: "Precisa de periféricos específicos para jogos incluídos no orçamento? (Sim/Não)"
        
        #### Trabalho/Produtividade (\`currentAnamnesis.purpose === 'Trabalho/Produtividade'\`):
        -   Se \`!currentAnamnesis.workField\`: "Qual sua área de trabalho? (Desenvolvimento, Design Gráfico, Engenharia/3D, Escritório, Ciência de Dados)"
        -   Se \`currentAnamnesis.workField\` e \`!currentAnamnesis.softwareUsed\`: "Quais softwares principais você usa ou pretende usar? (Liste os mais exigentes que impactam a escolha de hardware)"
        -   Se \`currentAnamnesis.softwareUsed\` e \`!currentAnamnesis.multipleMonitors\`: "Precisa de suporte para múltiplos monitores? (Sim/Não)"
        -   Se \`currentAnamnesis.multipleMonitors === 'Sim'\` e \`!currentAnamnesis.monitorCount\`: "Quantos monitores você pretende usar?"

        #### Edição Criativa (\`currentAnamnesis.purpose === 'Edição Criativa'\`):
        -   Se \`!currentAnamnesis.creativeEditingType\`: "Qual tipo de edição criativa você fará principalmente? (Vídeo, Foto, Áudio, Modelagem 3D)"
        -   Se \`currentAnamnesis.creativeEditingType\` e \`!currentAnamnesis.creativeWorkResolution\`: "Qual a resolução de trabalho principal para seus projetos de edição? (Ex: HD, 4K, 8K)"
        -   Se \`currentAnamnesis.creativeWorkResolution\` e \`!currentAnamnesis.projectSize\`: "Qual o tamanho médio dos seus projetos? (Pequeno, Médio, Grande - isso ajuda a estimar RAM e armazenamento)"

    c.  **Experiência do Usuário e Estética** (após sub-fluxos de propósito, se ainda não perguntado para Computador Pessoal):
        -   Se \`!currentAnamnesis.buildExperience\`: "Você prefere montar o PC sozinho ou gostaria de um sistema já montado/pré-configurado (se disponível)?"
        -   Se \`currentAnamnesis.buildExperience\` e \`!currentAnamnesis.brandPreference\`: "Tem preferência por marcas específicas de componentes, como AMD, Intel, NVIDIA, ou outras?"
        -   Se \`currentAnamnesis.brandPreference\` e \`!currentAnamnesis.aestheticsImportance\`: "Qual a importância da estética para você? (Ex: RGB, design do gabinete, cabos organizados - Baixa, Média, Alta)"

    ### Para Servidores (\`currentAnamnesis.machineType === 'Servidor'\`):
    a.  **Tipo de Servidor** (se \`!currentAnamnesis.serverType\`):
        Pergunte: "Qual o propósito principal do servidor? (Arquivos, Web, Banco de Dados, Virtualização, Render Farm, Outro)"
    
    b.  **Requisitos Técnicos** (após \`serverType\`):
        -   Se \`!currentAnamnesis.serverUsers\`: "Número estimado de usuários ou conexões simultâneas?"
        -   Se \`currentAnamnesis.serverUsers\` e \`!currentAnamnesis.serverRedundancy\`: "Há necessidade de redundância de componentes? (Ex: RAID para discos, fonte redundante)"
        -   Se \`currentAnamnesis.serverRedundancy\` e \`!currentAnamnesis.serverUptime\`: "Qual o nível de uptime (tempo online) requerido? (Ex: 99%, 99.9%, 99.99%)"
        -   Se \`currentAnamnesis.serverUptime\` e \`!currentAnamnesis.serverScalability\`: "Qual a necessidade de capacidade de expansão futura para este servidor? (Baixa, Média, Alta)"

    ### Para Estação de Trabalho (\`currentAnamnesis.machineType === 'Estação de Trabalho'\`):
    (Similar ao Computador Pessoal com propósito de Trabalho/Produtividade ou Edição Criativa, mas talvez com foco em componentes de nível profissional/ECC RAM etc. O fluxo pode adaptar as perguntas de "Trabalho/Produtividade" e "Edição Criativa".)
    -   Se \`!currentAnamnesis.workField\` e \`!currentAnamnesis.creativeEditingType\`: "Qual será a principal carga de trabalho desta Estação de Trabalho? (Ex: CAD/Engenharia, Análise de Dados Pesada, Renderização 3D Profissional, Desenvolvimento com VMs)"
    -   (Siga com perguntas de software, monitores, etc., similar ao 'Trabalho/Produtividade' ou 'Edição Criativa', adaptando conforme a resposta)

    ### Para Máquinas de Mineração (\`currentAnamnesis.machineType === 'Máquina para Mineração'\`):
    a.  **Detalhes de Mineração**:
        -   Se \`!currentAnamnesis.miningCrypto\`: "Quais criptomoedas você pretende minerar?"
        -   Se \`currentAnamnesis.miningCrypto\` e \`!currentAnamnesis.miningHashrate\`: "Qual o hashrate (poder de mineração) desejado ou que você espera alcançar?"
        -   Se \`currentAnamnesis.miningHashrate\` e \`!currentAnamnesis.miningGpuCount\`: "Quantas GPUs você planeja usar inicialmente?"
        -   Se \`currentAnamnesis.miningGpuCount\` e \`!currentAnamnesis.miningEnergyCost\`: "Você sabe o custo da energia na sua região? (Isso pode influenciar a escolha de GPUs mais eficientes)"

    ### Para PC para Streaming (\`currentAnamnesis.machineType === 'PC para Streaming'\`):
    (Pode ser um PC dedicado para streaming ou um PC de jogos/trabalho que também fará streaming)
    -   Se \`!currentAnamnesis.purpose\`: "Este PC será exclusivamente para streaming ou também para jogar/trabalhar enquanto faz stream? (Dedicado para Stream, Jogos+Stream, Trabalho+Stream)"
    -   (Se Jogos+Stream, siga o fluxo de Jogos, adicionando perguntas sobre qualidade de stream. Se Trabalho+Stream, siga o fluxo de Trabalho)
    -   Se \`!currentAnamnesis.preferences\` (ou se precisa de mais detalhes): "Qual a qualidade e resolução de stream que você almeja? (Ex: 720p/30fps, 1080p/60fps) Precisa de placa de captura?"

    ### Para Tipos Não Previstos/Customizados (\`currentAnamnesis.isCustomType === true\`):
    (Este fluxo é ativado se o machineType inicial não for reconhecido e for marcado como customizado)
    1.  Se \`!currentAnamnesis.customDescription\`: "Você pode descrever com mais detalhes o que essa máquina precisa fazer de especial?"
    2.  Se \`currentAnamnesis.customDescription\` e \`!currentAnamnesis.referenceSystems\`: "Existe algum sistema similar no mercado que sirva de referência ou inspiração?"
    3.  Se \`currentAnamnesis.referenceSystems\` e \`!currentAnamnesis.criticalComponents\`: "Quais são os componentes ou características mais críticos para esse tipo de máquina?"
    4.  Se \`currentAnamnesis.criticalComponents\` e \`!currentAnamnesis.usagePatterns\`: "Como você pretende usar essa máquina no dia a dia? (Ex: horas de operação, carga de trabalho, usuários)"
    5.  Se \`currentAnamnesis.usagePatterns\` e \`!currentAnamnesis.physicalConstraints\`: "Existem restrições físicas ou de compatibilidade importantes? (Tamanho, peso, ruído, consumo)"
    6.  Se \`currentAnamnesis.physicalConstraints\` e \`!currentAnamnesis.specialRequirements\`: "Algum outro requisito especializado, software específico ou periférico incomum?"


3.  **Orçamento** (coletar após entender as necessidades principais do tipo de máquina, se \`!currentAnamnesis.budget\` e \`!currentAnamnesis.budgetRange\`):
    Pergunte: "Com base no que conversamos, qual faixa de orçamento você tem em mente para esta máquina em BRL (Reais)? (Ex: Econômico [até R$4000], Médio [R$4000-R$8000], High-End [R$8000+], ou se preferir, diga um valor específico para 'Personalizar')"

4.  **Permissão de Localização** (após orçamento, se \`!currentAnamnesis.city\` E a pergunta ainda não foi feita):
    Pergunte EXATAMENTE: "Para ajudar com as condições climáticas e otimizar as sugestões de refrigeração e gabinete, você permite que detectemos sua localização automaticamente?" 
    (O frontend tratará a resposta. Não processe diretamente. Espere a próxima entrada do usuário que será uma mensagem do sistema.)

5.  **Condições Ambientais Específicas do Local do PC** (se \`currentAnamnesis.city\` existe E os detalhes do local do PC ainda não foram coletados):
    *   Se \`!currentAnamnesis.pcVentilation\`: "Sobre o local específico onde a máquina será usada: ele possui ar condicionado, ventilador, ou a ventilação depende principalmente da temperatura externa? (Responda com 'Ar Condicionado', 'Ventilador', 'Temperatura Externa' ou 'Outro')"
    *   Se \`currentAnamnesis.pcVentilation\` E \`!currentAnamnesis.pcDustLevel\`: "E quanto ao nível de poeira nesse local específico onde a máquina ficará? (Responda com Baixa, Média ou Alta)"
    *   Se \`currentAnamnesis.pcVentilation\` E \`currentAnamnesis.pcDustLevel\` E \`!currentAnamnesis.pcRoomType\`: "Em qual cômodo a máquina será utilizada principalmente? (Ex: Quarto, Sala, Escritório)"

6.  **Condições Ambientais Gerais** (se permissão de localização foi negada/falhou, \`!currentAnamnesis.city\`, OU para tipos como Servidor/Mineração se não perguntado antes, E as condições gerais ainda não foram coletadas):
    *   Se \`!currentAnamnesis.envTempControl\`: "O ambiente geral onde a máquina ficará tem algum controle de temperatura, como ar condicionado ou é mais dependente da ventilação natural?"
    *   Se \`currentAnamnesis.envTempControl\` E \`!currentAnamnesis.envDust\`: "Qual o nível de poeira geral nesse ambiente? (Baixa, Média, Alta)"
    *   Para Mineração (se não perguntado e relevante): "O local de mineração é bem ventilado, especialmente para as GPUs?" (Pode ir para \`preferences\` ou \`pcVentilation\`)

7.  **Preferências Adicionais Gerais** (após as etapas anteriores, se algo ainda pode ser relevante ou se \`!currentAnamnesis.preferences\` para coletar gostos gerais):
    - Se \`!currentAnamnesis.caseSize\`: "Você tem preferência pelo tamanho do gabinete? (Ex: Mini-ITX para compacto, Micro-ATX, ATX padrão, Full Tower para máximo espaço)"
    - Se \`currentAnamnesis.caseSize\` e \`!currentAnamnesis.noiseLevel\`: "Qual o nível de ruído aceitável para você? (Silencioso, Moderado, Indiferente)"
    - Se \`currentAnamnesis.noiseLevel\` e \`!currentAnamnesis.specificPorts\`: "Há necessidade de portas específicas em grande quantidade ou tipo? (Ex: Thunderbolt, muitas USB-A, USB-C frontal)"
    - Se todos acima preenchidos ou se um campo genérico \`preferences\` ainda não foi tocado ou precisa de mais: "Alguma outra preferência ou detalhe importante que não cobrimos? (Pode ser sobre Wi-Fi, Bluetooth, sistema operacional desejado, etc.)" (Armazenar em \`preferences\`)

8.  **Validação Final e Conclusão**:
    Se todos os campos CRÍTICOS para o \`machineType\` e seu fluxo parecerem preenchidos (Orçamento é quase sempre crítico. Detalhes de propósito/trabalho para PCs são chave.), resuma brevemente:
    "Ok, coletei as seguintes informações principais: [Liste 2-3 pontos chave de \`currentAnamnesis\` como machineType, purpose/serverType, budgetRange]. Está tudo correto e podemos prosseguir para gerar uma recomendação de build com base nisso e nos outros detalhes que você me passou?"

REGRAS DE INTERAÇÃO:
- Faça UMA pergunta por vez.
- Adapte o vocabulário ao nível técnico aparente do usuário. Se o usuário usar termos técnicos, você pode usar também. Se parecer leigo, simplifique.
- Confirme informações importantes brevemente se o usuário der uma resposta ambígua.
- Ofereça exemplos curtos entre parênteses quando apropriado para clarificar a pergunta.
- Mantenha o foco no fluxo lógico. Não pule etapas a menos que o estado atual (\`currentAnamnesis\`) já tenha a informação.
- Responda APENAS com a sua próxima pergunta ou a validação final. Evite saudações repetitivas.
- Se o usuário fornecer múltiplas informações de uma vez, tente processá-las para os campos correspondentes em \`currentAnamnesis\` e então faça a PRÓXIMA pergunta do fluxo que ainda não foi respondida.
`;

  try {
    const userMessageContent: Content = { role: 'user', parts: [{ text: userInput }] };
    const contents: Content[] = [...chatHistoryForGemini, userMessageContent];
    
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    
    const aiText = result.text;
    const updatedAnamnesis = { ...currentAnamnesis };
    const lowerInput = userInput.toLowerCase();
    
    let lastAiQuestionText = "";
    if (history.length > 0) {
        const lastMessage = history[history.length -1];
        if (lastMessage.sender === 'ai') {
            lastAiQuestionText = lastMessage.text.toLowerCase();
        } else if (history.length > 1) { 
            const secondLastMessage = history[history.length -2];
            if(secondLastMessage.sender === 'ai') {
                 lastAiQuestionText = secondLastMessage.text.toLowerCase();
            }
        }
    }
     // Centralized parsing logic based on last AI question
    const parseGenericOptions = (input: string, options: Record<string, string>): string | undefined => {
      for (const [key, value] of Object.entries(options)) {
        if (input.includes(key)) return value;
      }
      return undefined;
    };

    const FEMININE_DUST_LEVEL_MAP: Record<string, 'Baixa' | 'Média' | 'Alta'> = {
      'baixo': 'Baixa', 'baixa': 'Baixa',
      'médio': 'Média', 'media': 'Média',
      'alto': 'Alta', 'alta': 'Alta'
    };

    // 1. Machine Type
    if (lastAiQuestionText.includes("que tipo de máquina você deseja montar?") && !updatedAnamnesis.machineType) {
        const typeMap: Record<string, MachineType> = {
            'pessoal': 'Computador Pessoal', 'pc': 'Computador Pessoal', 'desktop': 'Computador Pessoal',
            'servidor': 'Servidor', 'server': 'Servidor',
            'estação de trabalho': 'Estação de Trabalho', 'workstation': 'Estação de Trabalho',
            'mineração': 'Máquina para Mineração', 'mining': 'Máquina para Mineração', 'cripto': 'Máquina para Mineração',
            'streaming': 'PC para Streaming', 'stream': 'PC para Streaming',
            'outro': 'Outro'
        };
        updatedAnamnesis.machineType = parseGenericOptions(lowerInput, typeMap) as MachineType;
        if (lowerInput.length > 2 && !updatedAnamnesis.machineType) { // If not mapped, but user provided something
            const customTypes: Record<string, MachineType> = {
                'hackintosh': 'Customizado', 'media center': 'Customizado', 'roteador': 'Customizado', 'firewall': 'Customizado', 'retro': 'Customizado', 'teste': 'Customizado', 'ia': 'Customizado', 'emulador': 'Customizado'
            };
            updatedAnamnesis.machineType = parseGenericOptions(lowerInput, customTypes) as MachineType || 'Customizado';
            updatedAnamnesis.isCustomType = true;
            if(!updatedAnamnesis.customDescription) updatedAnamnesis.customDescription = userInput; // Capture initial description
        }
    }

    // 2. Fluxos Específicos
    // Computador Pessoal
    if (updatedAnamnesis.machineType === 'Computador Pessoal') {
        if (lastAiQuestionText.includes("qual será o uso principal?") && !updatedAnamnesis.purpose) {
            const purposeMap: Record<string, PurposeType> = {
                'jogos': 'Jogos', 'game': 'Jogos',
                'trabalho': 'Trabalho/Produtividade', 'produtividade': 'Trabalho/Produtividade',
                'edição criativa': 'Edição Criativa', 'edição': 'Edição Criativa', 'video': 'Edição Criativa', 'foto': 'Edição Criativa', 'design': 'Edição Criativa',
                'uso geral': 'Uso Geral', 'geral': 'Uso Geral', 'básico': 'Uso Geral',
                'htpc': 'HTPC', 'media center': 'HTPC',
                'outro': 'Outro'
            };
            updatedAnamnesis.purpose = parseGenericOptions(lowerInput, purposeMap) as PurposeType;
        }
        // Jogos Sub-flow
        if (updatedAnamnesis.purpose === 'Jogos') {
            if (lastAiQuestionText.includes("que tipo de jogos você pretende jogar?") && !updatedAnamnesis.gamingType) {
                const gameTypeMap: Record<string, GamingType> = { 'competitivo': 'Competitivos/eSports', 'esports': 'Competitivos/eSports', 'aaa': 'AAA/High-End', 'high-end': 'AAA/High-End', 'vr': 'VR', 'casual': 'Casual', 'outro': 'Outro'};
                updatedAnamnesis.gamingType = parseGenericOptions(lowerInput, gameTypeMap) as GamingType;
            }
            if (lastAiQuestionText.includes("qual resolução e taxa de atualização do seu monitor?") && !updatedAnamnesis.monitorSpecs) {
                updatedAnamnesis.monitorSpecs = userInput;
            }
            if (lastAiQuestionText.includes("precisa de periféricos específicos?") && !updatedAnamnesis.peripheralsNeeded) {
                const peripheralMap: Record<string, 'Sim' | 'Não'> = { 'sim': 'Sim', 'preciso': 'Sim', 'não': 'Não', 'nao': 'Não'};
                updatedAnamnesis.peripheralsNeeded = parseGenericOptions(lowerInput, peripheralMap) as 'Sim' | 'Não' || 'Não especificado';
            }
        }
        // Trabalho/Produtividade Sub-flow
        if (updatedAnamnesis.purpose === 'Trabalho/Produtividade') {
            if (lastAiQuestionText.includes("qual sua área de trabalho?") && !updatedAnamnesis.workField) {
                 const workFieldMap: Record<string, WorkField> = {'desenvolvimento': 'Desenvolvimento', 'design gráfico': 'Design Gráfico', 'engenharia': 'Engenharia/3D', '3d': 'Engenharia/3D', 'escritório': 'Escritório', 'ciência de dados': 'Ciência de Dados', 'outro': 'Outro'};
                 updatedAnamnesis.workField = parseGenericOptions(lowerInput, workFieldMap) as WorkField;
                 if (!updatedAnamnesis.workField && userInput.length > 3) updatedAnamnesis.workField = userInput as WorkField; // Capture if not mapped
            }
            if (lastAiQuestionText.includes("quais softwares principais você usa?") && !updatedAnamnesis.softwareUsed && userInput.length > 3) {
                updatedAnamnesis.softwareUsed = userInput;
            }
            if (lastAiQuestionText.includes("precisa de suporte para múltiplos monitores?") && !updatedAnamnesis.multipleMonitors) {
                const multiMonitorMap: Record<string, 'Sim' | 'Não'> = { 'sim': 'Sim', 'preciso': 'Sim', 'não': 'Não', 'nao': 'Não' };
                updatedAnamnesis.multipleMonitors = parseGenericOptions(lowerInput, multiMonitorMap) as 'Sim' | 'Não' || 'Não especificado';
            }
            if (lastAiQuestionText.includes("quantos monitores você pretende usar?") && updatedAnamnesis.multipleMonitors === 'Sim' && !updatedAnamnesis.monitorCount) {
                const countMatch = userInput.match(/\d+/);
                if (countMatch) updatedAnamnesis.monitorCount = parseInt(countMatch[0], 10);
            }
        }
        // Edição Criativa Sub-flow
        if (updatedAnamnesis.purpose === 'Edição Criativa') {
            if (lastAiQuestionText.includes("qual tipo de edição criativa") && !updatedAnamnesis.creativeEditingType) {
                const creativeTypeMap: Record<string, CreativeEditingType> = {'vídeo': 'Vídeo', 'foto': 'Foto', 'áudio': 'Áudio', '3d': '3D', 'modelagem 3d': '3D', 'outro': 'Outro'};
                updatedAnamnesis.creativeEditingType = parseGenericOptions(lowerInput, creativeTypeMap) as CreativeEditingType;
            }
            if (lastAiQuestionText.includes("qual a resolução de trabalho principal") && !updatedAnamnesis.creativeWorkResolution) {
                const resolutionMap: Record<string, CreativeWorkResolution> = {'hd': 'HD', 'fullhd': 'HD', '1080': 'HD', '4k': '4K', '8k': '8K', 'outro': 'Outro'};
                updatedAnamnesis.creativeWorkResolution = parseGenericOptions(lowerInput, resolutionMap) as CreativeWorkResolution;
                 if (!updatedAnamnesis.creativeWorkResolution && userInput.length > 1) updatedAnamnesis.creativeWorkResolution = userInput as CreativeWorkResolution;
            }
            if (lastAiQuestionText.includes("qual o tamanho médio dos seus projetos?") && !updatedAnamnesis.projectSize) {
                const projectSizeMap: Record<string, ProjectSize> = {'pequeno': 'Pequeno', 'médio': 'Médio', 'grande': 'Grande'};
                updatedAnamnesis.projectSize = parseGenericOptions(lowerInput, projectSizeMap) as ProjectSize;
            }
        }
        // Experiência do Usuário (Computador Pessoal)
        if (lastAiQuestionText.includes("prefere montar o pc sozinho") && !updatedAnamnesis.buildExperience) {
            const buildExpMap: Record<string, BuildExperience> = {'sozinho': 'Montar Sozinho', 'montar': 'Montar Sozinho', 'pré-configurado': 'Pré-configurado', 'pronto': 'Pré-configurado'};
            updatedAnamnesis.buildExperience = parseGenericOptions(lowerInput, buildExpMap) as BuildExperience;
        }
        if (lastAiQuestionText.includes("preferência por marcas específicas") && !updatedAnamnesis.brandPreference) {
            if (userInput.length > 2) updatedAnamnesis.brandPreference = userInput;
        }
        if (lastAiQuestionText.includes("importância da estética") && !updatedAnamnesis.aestheticsImportance) {
            const aestheticsMap: Record<string, AestheticsImportance> = {'baixa': 'Baixa', 'média': 'Média', 'alta': 'Alta'};
            updatedAnamnesis.aestheticsImportance = parseGenericOptions(lowerInput, aestheticsMap) as AestheticsImportance;
        }
    }
    // Servidor
    else if (updatedAnamnesis.machineType === 'Servidor') {
        if (lastAiQuestionText.includes("propósito principal do servidor?") && !updatedAnamnesis.serverType) {
            const serverTypeMap: Record<string, ServerType> = {'arquivos': 'Arquivos', 'web': 'Web', 'banco de dados': 'Banco de Dados', 'bd': 'Banco de Dados', 'virtualização': 'Virtualização', 'vm': 'Virtualização', 'render farm': 'Render Farm', 'render': 'Render Farm', 'outro': 'Outro'};
            updatedAnamnesis.serverType = parseGenericOptions(lowerInput, serverTypeMap) as ServerType;
        }
        if (lastAiQuestionText.includes("número estimado de usuários") && !updatedAnamnesis.serverUsers && userInput.length > 0) {
            updatedAnamnesis.serverUsers = userInput;
        }
        if (lastAiQuestionText.includes("necessidade de redundância") && !updatedAnamnesis.serverRedundancy && userInput.length > 2) {
            updatedAnamnesis.serverRedundancy = userInput;
        }
        if (lastAiQuestionText.includes("nível de uptime") && !updatedAnamnesis.serverUptime) {
            const uptimeMap: Record<string, ServerUptime> = {'99%': '99%', '99.9%': '99.9%', '99.99%': '99.99%', 'outro': 'Outro'};
            updatedAnamnesis.serverUptime = parseGenericOptions(lowerInput, uptimeMap) as ServerUptime;
             if (!updatedAnamnesis.serverUptime && userInput.length > 1) updatedAnamnesis.serverUptime = userInput as ServerUptime;
        }
        if (lastAiQuestionText.includes("capacidade de expansão futura") && !updatedAnamnesis.serverScalability) {
            const scalabilityMap: Record<string, ServerScalability> = {'baixa': 'Baixa', 'média': 'Média', 'alta': 'Alta'};
            updatedAnamnesis.serverScalability = parseGenericOptions(lowerInput, scalabilityMap) as ServerScalability;
        }
    }
    // Estação de Trabalho - might share logic with PC/Trabalho or Edição Criativa
    else if (updatedAnamnesis.machineType === 'Estação de Trabalho') {
        if (lastAiQuestionText.includes("principal carga de trabalho desta estação de trabalho") && !updatedAnamnesis.workField && !updatedAnamnesis.creativeEditingType) {
            // This is a bit complex as it can map to either workField or creativeEditingType
            // For simplicity, let's try to map to workField first or store in preferences
            const workFieldMap: Record<string, WorkField> = {'cad': 'Engenharia/3D', 'engenharia': 'Engenharia/3D', 'análise de dados': 'Ciência de Dados', 'renderização 3d': 'Engenharia/3D', 'desenvolvimento com vms': 'Desenvolvimento', 'outro': 'Outro'};
            updatedAnamnesis.workField = parseGenericOptions(lowerInput, workFieldMap) as WorkField;
            if (!updatedAnamnesis.workField) updatedAnamnesis.preferences = (updatedAnamnesis.preferences ? updatedAnamnesis.preferences + "; " : "") + `Carga Estação de Trabalho: ${userInput}`;
        }
        // Subsequent questions for software, monitors for Estação de Trabalho would follow similar parsing to PC/Trabalho.
        if (lastAiQuestionText.includes("quais softwares principais você usa?") && !updatedAnamnesis.softwareUsed && userInput.length > 3) {
            updatedAnamnesis.softwareUsed = userInput;
        }
    }
    // Máquina para Mineração
    else if (updatedAnamnesis.machineType === 'Máquina para Mineração') {
        if (lastAiQuestionText.includes("quais criptomoedas você pretende minerar?") && !updatedAnamnesis.miningCrypto && userInput.length > 1) {
            updatedAnamnesis.miningCrypto = userInput;
        }
        if (lastAiQuestionText.includes("hashrate (poder de mineração) desejado") && !updatedAnamnesis.miningHashrate && userInput.length > 1) {
            updatedAnamnesis.miningHashrate = userInput;
        }
        if (lastAiQuestionText.includes("quantas gpus você planeja usar") && !updatedAnamnesis.miningGpuCount && userInput.length > 0) {
            updatedAnamnesis.miningGpuCount = userInput;
        }
        if (lastAiQuestionText.includes("custo da energia na sua região") && !updatedAnamnesis.miningEnergyCost && userInput.length > 1) {
            updatedAnamnesis.miningEnergyCost = userInput;
        }
    }
    // PC para Streaming
    else if (updatedAnamnesis.machineType === 'PC para Streaming') {
         if (lastAiQuestionText.includes("exclusivamente para streaming ou também para jogar/trabalhar") && !updatedAnamnesis.purpose) {
            // For simplicity, store this specific input in preferences for now, or create a new 'streamingFocus' field
            updatedAnamnesis.preferences = (updatedAnamnesis.preferences ? updatedAnamnesis.preferences + "; " : "") + `Foco Streaming: ${userInput}`;
            if(lowerInput.includes("jogos") || lowerInput.includes("game")) updatedAnamnesis.purpose = "Jogos"; // To guide subsequent questions
            else if(lowerInput.includes("trabalho")) updatedAnamnesis.purpose = "Trabalho/Produtividade";
        }
        if (lastAiQuestionText.includes("qualidade e resolução de stream") && (!updatedAnamnesis.preferences || !updatedAnamnesis.preferences.toLowerCase().includes("qualidade de stream"))) {
             updatedAnamnesis.preferences = (updatedAnamnesis.preferences ? updatedAnamnesis.preferences + "; " : "") + `Qualidade Stream: ${userInput}`;
        }
    }
    // Custom/Unknown Machine Type Flow
    if (updatedAnamnesis.isCustomType) {
        if (lastAiQuestionText.includes("descrever com mais detalhes") && !updatedAnamnesis.customDescription) {
            updatedAnamnesis.customDescription = userInput;
        } else if (lastAiQuestionText.includes("sistema similar no mercado") && !updatedAnamnesis.referenceSystems) {
            updatedAnamnesis.referenceSystems = userInput;
        } else if (lastAiQuestionText.includes("componentes ou características mais críticos") && !updatedAnamnesis.criticalComponents) {
            updatedAnamnesis.criticalComponents = userInput;
        } else if (lastAiQuestionText.includes("como você pretende usar essa máquina no dia a dia") && !updatedAnamnesis.usagePatterns) {
            updatedAnamnesis.usagePatterns = userInput;
        } else if (lastAiQuestionText.includes("restrições físicas ou de compatibilidade") && !updatedAnamnesis.physicalConstraints) {
            updatedAnamnesis.physicalConstraints = userInput;
        } else if (lastAiQuestionText.includes("requisito especializado, software específico ou periférico incomum") && !updatedAnamnesis.specialRequirements) {
            updatedAnamnesis.specialRequirements = userInput;
        }
    }
    
    // 3. Orçamento
    if (lastAiQuestionText.includes("faixa de orçamento") && (!updatedAnamnesis.budget && !updatedAnamnesis.budgetRange)) {
        const budgetRangesMap: Record<string, { range: AnamnesisData['budgetRange'], value?: number }> = {
            'econômico': { range: 'Econômico [R$2-4k]', value: 3000 }, // representative value
            'medio': { range: 'Médio [R$4-8k]', value: 6000 }, // representative value
            'médio': { range: 'Médio [R$4-8k]', value: 6000 },
            'high-end': { range: 'High-End [R$8k+]', value: 10000 }, // representative value
            'high end': { range: 'High-End [R$8k+]', value: 10000 },
            'personalizar': { range: 'Personalizar' }
        };
        let matched = false;
        for (const [key, val] of Object.entries(budgetRangesMap)) {
            if (lowerInput.includes(key)) {
                updatedAnamnesis.budgetRange = val.range;
                if (val.value) updatedAnamnesis.budget = val.value;
                matched = true;
                break;
            }
        }
        if (!matched || updatedAnamnesis.budgetRange === 'Personalizar') {
            const numMatch = userInput.match(/(\d[\d.,]*\d|\d+)/g); // More robust regex for numbers like 2.500,00 or 2500
            if (numMatch) {
                const cleanedNumber = parseFloat(numMatch[0].replace(/\./g, '').replace(',', '.'));
                if (!isNaN(cleanedNumber)) {
                     updatedAnamnesis.budget = cleanedNumber;
                     if(!updatedAnamnesis.budgetRange) updatedAnamnesis.budgetRange = 'Personalizar'; // Assume Personalizar if direct number given
                }
            }
        }
         if(!updatedAnamnesis.budget && updatedAnamnesis.budgetRange !== 'Personalizar' && !matched){ // If no keyword match and no number, maybe it's a specific value
            const numMatch = userInput.match(/(\d[\d.,]*\d|\d+)/g); 
            if (numMatch) {
                const cleanedNumber = parseFloat(numMatch[0].replace(/\./g, '').replace(',', '.'));
                 if (!isNaN(cleanedNumber)) updatedAnamnesis.budget = cleanedNumber;
            }
         }
    }

    // 4. Localização (handled by frontend, system message updates anamnesis.city)

    // 5. Condições Ambientais Específicas (pcVentilation, pcDustLevel, pcRoomType already covered by existing logic)
     if (lastAiQuestionText.includes("ar condicionado") || lastAiQuestionText.includes("ventilador") || lastAiQuestionText.includes("ventilação")) {
        if (lowerInput.includes("ar condicionado")) updatedAnamnesis.pcVentilation = "Ar Condicionado";
        else if (lowerInput.includes("ventilador")) updatedAnamnesis.pcVentilation = "Ventilador";
        else if (lowerInput.includes("temperatura externa") || lowerInput.includes("ambiente externo")) updatedAnamnesis.pcVentilation = "Ambiente Externo";
        else if (lowerInput.includes("outro") && !updatedAnamnesis.pcVentilation) updatedAnamnesis.pcVentilation = "Outro";
    }
    if (lastAiQuestionText.includes("nível de poeira nesse local específico")) {
        updatedAnamnesis.pcDustLevel = parseGenericOptions(lowerInput, FEMININE_DUST_LEVEL_MAP) as 'Baixa' | 'Média' | 'Alta';
    }
    if (lastAiQuestionText.includes("qual cômodo a máquina será utilizada") && !updatedAnamnesis.pcRoomType && userInput.trim().length > 2) {
        updatedAnamnesis.pcRoomType = userInput.trim().charAt(0).toUpperCase() + userInput.trim().slice(1);
    }


    // 6. Condições Ambientais Gerais
    if (lastAiQuestionText.includes("ambiente geral") && lastAiQuestionText.includes("controle de temperatura") && !updatedAnamnesis.envTempControl) {
        const tempControlMap: Record<string, EnvTempControlType> = {'ar condicionado': 'Ar condicionado', 'ventilação natural': 'Ventilação natural', 'natural': 'Ventilação natural', 'outro': 'Outro'};
        updatedAnamnesis.envTempControl = parseGenericOptions(lowerInput, tempControlMap) as EnvTempControlType;
    }
    if (lastAiQuestionText.includes("nível de poeira geral nesse ambiente") && !updatedAnamnesis.envDust) {
        updatedAnamnesis.envDust = parseGenericOptions(lowerInput, FEMININE_DUST_LEVEL_MAP) as 'Baixa' | 'Média' | 'Alta';
    }
     if (lastAiQuestionText.includes("local de mineração é bem ventilado") && (!updatedAnamnesis.preferences || !updatedAnamnesis.preferences.toLowerCase().includes("ventilação mineração"))) {
        updatedAnamnesis.preferences = (updatedAnamnesis.preferences ? updatedAnamnesis.preferences + "; " : "") + `Ventilação Mineração: ${userInput}`;
    }


    // 7. Preferências Adicionais Gerais
    if (lastAiQuestionText.includes("tamanho do gabinete") && !updatedAnamnesis.caseSize) {
        const caseSizeMap: Record<string, CaseSizeType> = {'mini-itx': 'Mini-ITX', 'micro-atx': 'Micro-ATX', 'atx': 'ATX', 'full tower': 'Full Tower', 'outro': 'Outro'};
        updatedAnamnesis.caseSize = parseGenericOptions(lowerInput, caseSizeMap) as CaseSizeType;
    }
    if (lastAiQuestionText.includes("nível de ruído aceitável") && !updatedAnamnesis.noiseLevel) {
        const noiseLevelMap: Record<string, NoiseLevelType> = {'silencioso': 'Silencioso', 'moderado': 'Moderado', 'indiferente': 'Indiferente'};
        updatedAnamnesis.noiseLevel = parseGenericOptions(lowerInput, noiseLevelMap) as NoiseLevelType;
    }
    if (lastAiQuestionText.includes("necessidade de portas específicas") && !updatedAnamnesis.specificPorts && userInput.length > 3) {
        updatedAnamnesis.specificPorts = userInput;
    }
    // General preferences catch-all (also used by some specific flows if no dedicated field)
    if (lastAiQuestionText.includes("outra preferência ou detalhe importante") || lastAiQuestionText.includes("preferência adicional")) {
       if (!updatedAnamnesis.preferences || userInput.trim().length > 3 ) { 
             updatedAnamnesis.preferences = (updatedAnamnesis.preferences ? updatedAnamnesis.preferences + "; " : "") + userInput.trim();
        }
    }
    
    // Fallback for older env questions if new ones not explicitly asked yet (less likely with new flow)
    if (!updatedAnamnesis.city && !updatedAnamnesis.envTempControl && (lastAiQuestionText.includes("temperatura ambiente") || aiText.toLowerCase().includes("temperatura ambiente")) ) {
        ['baixa', 'média', 'alta'].forEach(level => {
            if(lowerInput.includes(level)) {
                if(!updatedAnamnesis.envTemperature) updatedAnamnesis.envTemperature = level.charAt(0).toUpperCase() + level.slice(1) as 'Baixa' | 'Média' | 'Alta';
            }
        });
    }
     if (!updatedAnamnesis.city && !updatedAnamnesis.envDust && (lastAiQuestionText.includes("poeira geral no ambiente") || aiText.toLowerCase().includes("poeira geral no ambiente") )) {
         ['baixa', 'média', 'alta'].forEach(level => { // This was using masculine 'Baixo', 'Medio', 'Alto', but envDust expects feminine
            if(lowerInput.includes(level)) { // 'level' here is 'baixa', 'média', 'alta'
                if(!updatedAnamnesis.envDust) { // If envDust is not already set by FEMININE_DUST_LEVEL_MAP
                    const feminineLevel = FEMININE_DUST_LEVEL_MAP[level];
                    if (feminineLevel) {
                        updatedAnamnesis.envDust = feminineLevel;
                    }
                }
            }
        });
    }


    return { aiResponse: aiText, updatedAnamnesis };

  } catch (error) {
    console.error("Erro ao chamar API Gemini (getChatbotResponse):", error);
    return { aiResponse: "Desculpe, ocorreu um erro ao processar sua solicitação.", updatedAnamnesis: currentAnamnesis };
  }
};


export const getBuildRecommendation = async (
  requirements: AnamnesisData,
  availableComponents: PCComponent[]
): Promise<AIRecommendation | null> => {
  if (!API_KEY) {
    console.error("API Key do Gemini não configurada para getBuildRecommendation");
    return null;
  }

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
- Tipo de Máquina: ${requirements.machineType || 'Não especificado'}
  - É tipo customizado?: ${requirements.isCustomType ? 'Sim' : 'Não'}
  - Descrição Customizada: ${requirements.customDescription || 'N/A'}
  - Componentes Críticos (Custom): ${requirements.criticalComponents || 'N/A'}
  - Padrões de Uso (Custom): ${requirements.usagePatterns || 'N/A'}
  - Restrições Físicas (Custom): ${requirements.physicalConstraints || 'N/A'}
  - Requisitos Especiais (Custom): ${requirements.specialRequirements || 'N/A'}
  - Sistemas de Referência (Custom): ${requirements.referenceSystems || 'N/A'}

- Detalhes para 'Computador Pessoal':
  - Propósito Principal: ${requirements.purpose || 'Não especificado'}
  - Tipo de Jogos: ${requirements.gamingType || 'Não especificado'}
  - Especificações do Monitor (Jogos): ${requirements.monitorSpecs || 'Não especificado'}
  - Necessidade de Periféricos (Jogos): ${requirements.peripheralsNeeded || 'Não especificado'}
  - Área de Trabalho (Produtividade): ${requirements.workField || 'Não especificado'}
  - Softwares Principais (Produtividade): ${requirements.softwareUsed || 'Não especificado'}
  - Múltiplos Monitores (Produtividade): ${requirements.multipleMonitors || 'Não especificado'} (Quantidade: ${requirements.monitorCount || 'N/A'})
  - Tipo de Edição Criativa: ${requirements.creativeEditingType || 'Não especificado'}
  - Resolução de Trabalho (Edição): ${requirements.creativeWorkResolution || 'Não especificado'}
  - Tamanho dos Projetos (Edição): ${requirements.projectSize || 'Não especificado'}
  - Experiência de Montagem: ${requirements.buildExperience || 'Não especificado'}
  - Preferência de Marcas: ${requirements.brandPreference || 'Nenhuma'}
  - Importância da Estética: ${requirements.aestheticsImportance || 'Não especificada'}

- Detalhes para 'Servidor':
  - Tipo de Servidor: ${requirements.serverType || 'Não especificado'}
  - Usuários/Conexões: ${requirements.serverUsers || 'Não especificado'}
  - Necessidade de Redundância: ${requirements.serverRedundancy || 'Não especificado'}
  - Uptime Requerido: ${requirements.serverUptime || 'Não especificado'}
  - Capacidade de Expansão: ${requirements.serverScalability || 'Não especificado'}

- Detalhes para 'Máquina para Mineração':
  - Criptomoedas Alvo: ${requirements.miningCrypto || 'Não especificado'}
  - Hashrate Desejado: ${requirements.miningHashrate || 'Não especificado'}
  - Número de GPUs: ${requirements.miningGpuCount || 'Não especificado'}
  - Custo da Energia: ${requirements.miningEnergyCost || 'Não especificado'}

- Detalhes para 'Estação de Trabalho': (Pode usar campos de Produtividade/Edição Criativa ou \`preferences\`)
  - Carga Principal (Estação de Trab.): ${requirements.workField && requirements.machineType === 'Estação de Trabalho' ? requirements.workField : (requirements.preferences || 'Não especificado')}

- Detalhes para 'PC para Streaming': (Pode usar campos de Jogos/Produtividade ou \`preferences\`)
  - Foco Principal (Streaming): ${requirements.preferences && requirements.preferences.includes("Foco Streaming:") ? requirements.preferences : (requirements.purpose || 'Não especificado')}

- Orçamento:
  - Faixa Escolhida: ${requirements.budgetRange || 'Não especificado'}
  - Valor Numérico (BRL): ${requirements.budget ? requirements.budget.toFixed(2) : 'Não especificado, otimizar custo-benefício'}

- Localização (Cidade): ${requirements.city ? `${requirements.city}${requirements.countryCode ? ', ' + requirements.countryCode : ''}` : 'Não detectada/informada'}

- Condições Ambientais:
  --- Detalhes do Ambiente Específico do PC (priorizar estes se informados) ---
  - Ventilação no Local do PC: ${requirements.pcVentilation || 'Não especificado'}
  - Nível de Poeira no Local do PC: ${requirements.pcDustLevel || 'Não especificado'}
  - Cômodo do PC: ${requirements.pcRoomType || 'Não especificado'}
  --- Condições Ambientais Gerais (fallback ou para tipos específicos) ---
  - Controle de Temperatura (Geral): ${requirements.envTempControl || (requirements.city ? 'Inferir da cidade' : 'Ventilação natural')}
  - Nível de Poeira (Geral): ${requirements.envDust || (requirements.city ? 'Inferir da cidade' : 'Média')}
  - (Fallback Temp/Umidade legados): ${requirements.envTemperature || ''} ${requirements.envHumidity || ''}

- Preferências Gerais Adicionais:
  - Tamanho do Gabinete: ${requirements.caseSize || 'Não especificado'}
  - Nível de Ruído: ${requirements.noiseLevel || 'Indiferente'}
  - Portas Específicas: ${requirements.specificPorts || 'Nenhuma'}
  - Outras Preferências (texto livre): ${requirements.preferences || 'Nenhuma'}

Componentes Disponíveis (ID, Categoria, Nome, Preço, Especificações Chave):
${JSON.stringify(componentSummary, null, 2)}

Instruções:
1.  Selecione um componente para cada categoria essencial (CPU, Placa-mãe, RAM, Armazenamento, Fonte, Gabinete).
2.  Placa de Vídeo é essencial para 'Computador Pessoal' (Jogos, Edição Criativa, alguns Trabalhos), 'Estação de Trabalho' (dependendo da carga), 'Máquina para Mineração' e 'PC para Streaming' (se envolver jogos). Para outros usos, pode ser opcional/integrada (assuma que CPUs não têm gráficos integrados potentes unless specified).
3.  Cooler CPU é essencial.
4.  Priorize compatibilidade e otimize para o \`machineType\` e seus sub-detalhes. Use o \`budget\` como guia forte.
5.  Para 'Computador Pessoal', use \`purpose\`, \`gamingType\`, \`workField\`, \`softwareUsed\`, \`creativeEditingType\` para guiar CPU, GPU, RAM.
6.  Para 'Servidor', foque em \`serverType\`, \`serverUsers\`, \`serverRedundancy\`, \`serverUptime\`, \`serverScalability\`.
7.  Para 'Máquina para Mineração', foque em \`miningGpuCount\`, PSU, e ventilação (gabinete).
8.  Para 'Estação de Trabalho', considere softwares em \`softwareUsed\` ou \`workField\` para CPU/GPU/RAM de nível profissional se o orçamento permitir.
9.  Para 'PC para Streaming', considere se é dedicado ou multiuso. CPU com mais núcleos é bom. GPU decente se for para jogos+stream.
10. Para tipos 'Customizado', use \`customDescription\`, \`criticalComponents\`, \`usagePatterns\` como guias principais.
11. Considere as condições ambientais (priorize \`pcVentilation\`/\`pcDustLevel\`, depois \`envTempControl\`/\`envDust\`). Ambientes quentes/empoeirados pedem melhor refrigeração/filtros. Cômodo como 'Quarto' pode pedir silêncio (\`noiseLevel\`).
12. Se o orçamento for insuficiente, explique no 'budgetNotes' e sugira alternativas ou ajuste de orçamento.
13. Calcule o preço total. Forneça justificativa e avisos de compatibilidade.

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
    console.error("Erro ao chamar API Gemini (getBuildRecommendation):", error);
    // @ts-ignore
    if (error.response && error.response.text) {
       // @ts-ignore
      console.error("Resposta de Erro do Gemini:", await error.response.text());
    }
    return null;
  }
};
