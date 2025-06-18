
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnamnesisData, ChatMessage } from '../../types';
import { getChatbotResponse } from '../../services/geminiService';
import { getUserLocation, GeoLocation } from '../../services/geoService';
import Button from '../core/Button';
import LoadingSpinner from '../core/LoadingSpinner';

interface ChatbotAnamnesisProps {
  onAnamnesisComplete: (data: AnamnesisData) => void;
  initialAnamnesisData?: AnamnesisData;
}

const LOCATION_PERMISSION_QUESTION = "você permite que detectemos sua localização automaticamente?";
// Updated initial message to match new system instruction
const INITIAL_AI_MESSAGE = "Que tipo de máquina você deseja montar? (Computador Pessoal, Servidor, Estação de Trabalho, Máquina para Mineração, PC para Streaming, Outro)";


const ChatbotAnamnesis: React.FC<ChatbotAnamnesisProps> = ({ onAnamnesisComplete, initialAnamnesisData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anamnesisData, setAnamnesisData] = useState<AnamnesisData>(initialAnamnesisData || {});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [awaitingLocationPermission, setAwaitingLocationPermission] = useState<boolean>(false);
  const [locationProcessed, setLocationProcessed] = useState<boolean>(false); 

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const addMessage = useCallback((sender: 'user' | 'ai' | 'system', text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender, text, timestamp: Date.now() }]);
  }, []);

  useEffect(() => {
    // Add greeting and then the first question, or just the first question if history is being restored.
    if (messages.length === 0 && (!initialAnamnesisData || Object.keys(initialAnamnesisData).length === 0)) {
       addMessage('ai', "Olá! Sou o CodeTuga, seu assistente especializado em montagem de PCs. Vamos começar!");
       // Delay the first actual question slightly to make the greeting feel more natural
       setTimeout(() => addMessage('ai', INITIAL_AI_MESSAGE), 500);
    } else if (messages.length === 0 && initialAnamnesisData && Object.keys(initialAnamnesisData).length > 0) {
      // If there's initial data, perhaps the conversation is being resumed.
      // The AI should ask the next logical question based on this data.
      // For simplicity now, we'll let the user initiate or rely on the AI's first turn based on currentAnamnesis.
      // This might need a "resume" call to Gemini. For now, if data exists, no initial message.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  const processAiResponse = useCallback((aiResponse: string, updatedAnamnesisFromAI: AnamnesisData) => {
    addMessage('ai', aiResponse);
    setAnamnesisData(updatedAnamnesisFromAI);

    if (aiResponse.toLowerCase().includes(LOCATION_PERMISSION_QUESTION.toLowerCase()) && !locationProcessed) {
      setAwaitingLocationPermission(true);
    } else if (aiResponse.toLowerCase().includes("posso prosseguir para gerar uma recomendação") || aiResponse.toLowerCase().includes("podemos prosseguir para gerar uma recomendação")) {
      addMessage('system', 'Coleta de requisitos concluída! Clique em "Gerar Recomendação" para continuar.');
    }
  }, [addMessage, locationProcessed]);


  const callGeminiChat = async (input: string, currentData: AnamnesisData) => {
    setIsLoading(true);
    try {
      // If it's the very first user message after initial greeting, ensure the AI uses the initial question.
      // The systemInstruction now handles the first question based on !currentAnamnesis.machineType.
      const { aiResponse, updatedAnamnesis } = await getChatbotResponse(messages, input, currentData);
      processAiResponse(aiResponse, updatedAnamnesis);
    } catch (error) {
      console.error("Error in chat:", error);
      addMessage('system', 'Desculpe, ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isLoading || awaitingLocationPermission) return;

    const userMsgText = userInput;
    addMessage('user', userMsgText);
    setUserInput('');
    await callGeminiChat(userMsgText, anamnesisData);
  };

  const handleLocationPermission = async (allow: boolean) => {
    setAwaitingLocationPermission(false);
    setLocationProcessed(true); // Mark that user has responded to location permission
    setIsLoading(true);
    let systemMessageForGemini = "";

    if (allow) {
      addMessage('system', 'Você permitiu a detecção. Tentando obter sua localização...');
      try {
        const loc = await getUserLocation();
        if (loc && loc.city) {
          const newAnamnesis = { ...anamnesisData, city: loc.city, countryCode: loc.country_code3 };
          setAnamnesisData(newAnamnesis); // Update state immediately for next AI call
          const successMsg = `Localização detectada: ${loc.city}${loc.country_code3 ? ', '+loc.country_code3 : ''}.`;
          addMessage('system', successMsg);
          systemMessageForGemini = `Informação do sistema: ${successMsg} Prossiga com as perguntas sobre o ambiente específico do PC.`;
          await callGeminiChat(systemMessageForGemini, newAnamnesis);
        } else {
          addMessage('system', 'Não foi possível detectar sua localização automaticamente ou a cidade não foi retornada.');
          systemMessageForGemini = "Informação do sistema: Detecção de localização automática falhou. Prossiga para perguntas manuais de ambiente geral.";
          await callGeminiChat(systemMessageForGemini, anamnesisData);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        addMessage('system', 'Erro ao tentar detectar localização.');
        systemMessageForGemini = "Informação do sistema: Erro na detecção de localização. Prossiga para perguntas manuais de ambiente geral.";
        await callGeminiChat(systemMessageForGemini, anamnesisData);
      }
    } else {
      addMessage('system', 'Você não permitiu a detecção automática. Vamos prosseguir com perguntas manuais sobre o ambiente.');
      systemMessageForGemini = "Informação do sistema: Usuário não permitiu detecção automática. Prossiga para perguntas manuais de ambiente geral.";
      await callGeminiChat(systemMessageForGemini, anamnesisData);
    }
    setIsLoading(false);
  };
  
  const isAnamnesisConsideredCompleteByAI = messages.some(msg => msg.sender === 'ai' && (msg.text.toLowerCase().includes("posso prosseguir para gerar uma recomendação") || msg.text.toLowerCase().includes("podemos prosseguir para gerar uma recomendação")));
  
  // Basic check, AI confirmation is primary
  const preliminaryCheck = !!(anamnesisData.machineType && (anamnesisData.budget || anamnesisData.budgetRange));
  const canGenerateRecommendation = isAnamnesisConsideredCompleteByAI && preliminaryCheck;

  const getDisplayKey = (key: string): string => {
    const map: Record<string, string> = {
        machineType: 'Tipo de Máquina', purpose: 'Propósito Principal', gamingType: 'Tipo de Jogos',
        monitorSpecs: 'Especificações do Monitor', peripheralsNeeded: 'Periféricos Necessários',
        workField: 'Área de Trabalho', softwareUsed: 'Softwares Utilizados',
        multipleMonitors: 'Múltiplos Monitores', monitorCount: 'Contagem de Monitores',
        creativeEditingType: 'Tipo de Edição Criativa', creativeWorkResolution: 'Resolução de Trabalho (Edição)',
        projectSize: 'Tamanho dos Projetos (Edição)', buildExperience: 'Experiência de Montagem',
        brandPreference: 'Preferência de Marcas', aestheticsImportance: 'Importância da Estética',
        serverType: 'Tipo de Servidor', serverUsers: 'Usuários/Conexões (Servidor)',
        serverRedundancy: 'Redundância (Servidor)', serverUptime: 'Uptime (Servidor)',
        serverScalability: 'Escalabilidade (Servidor)', miningCrypto: 'Criptomoedas (Mineração)',
        miningHashrate: 'Hashrate (Mineração)', miningGpuCount: 'GPUs (Mineração)',
        miningEnergyCost: 'Custo Energia (Mineração)', budget: 'Orçamento (Valor)', budgetRange: 'Faixa de Orçamento',
        city: 'Cidade (Localização)', countryCode: 'País (Código)',
        pcVentilation: 'Ventilação Específica do Local do PC', pcDustLevel: 'Poeira Específica no Local do PC',
        pcRoomType: 'Cômodo Específico do PC', envTempControl: 'Controle de Temp. Ambiente Geral',
        envDust: 'Poeira Ambiente Geral', caseSize: 'Tamanho do Gabinete',
        noiseLevel: 'Nível de Ruído Aceitável', specificPorts: 'Portas Específicas Necessárias',
        preferences: 'Preferências Adicionais', isCustomType: 'É Tipo Customizado?',
        customDescription: 'Descrição (Custom)', criticalComponents: 'Componentes Críticos (Custom)',
        usagePatterns: 'Padrões de Uso (Custom)', physicalConstraints: 'Restrições Físicas (Custom)',
        specialRequirements: 'Requisitos Especiais (Custom)', referenceSystems: 'Sistemas de Referência (Custom)',
        envTemperature: 'Temperatura Ambiente (Legado)', envHumidity: 'Umidade Ambiente (Legado)', workType: 'Tipo de Trabalho (Legado)'
    };
    if (map[key]) return map[key];
    let display = key.replace(/([A-Z])/g, ' $1');
    return display.charAt(0).toUpperCase() + display.slice(1);
  };


  return (
    <div className="bg-secondary p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-accent mb-4 text-center">Converse Comigo para Montar seu PC</h2>
      <div className="h-96 overflow-y-auto p-4 border border-neutral-dark rounded-md mb-4 bg-primary space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow ${
                msg.sender === 'user' ? 'bg-accent text-primary' : 
                msg.sender === 'ai' ? 'bg-neutral-dark text-neutral' : 
                'bg-yellow-500 text-black text-sm italic text-center w-full' 
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-right text-primary/70' : 'text-left text-neutral/70'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length -1].sender !== 'ai' && (
             <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow bg-neutral-dark text-neutral">
                    <LoadingSpinner size="sm" text="Digitando..." />
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {awaitingLocationPermission ? (
        <div className="my-4 p-4 border border-accent rounded-md bg-primary">
          <p className="text-neutral mb-3 text-center">
            {messages.find(m => m.text.toLowerCase().includes(LOCATION_PERMISSION_QUESTION.toLowerCase()))?.text || "Gostaria de permitir a detecção de localização?"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => handleLocationPermission(true)} variant="primary" isLoading={isLoading} className="flex-1">
              Permitir Detecção Automática
            </Button>
            <Button onClick={() => handleLocationPermission(false)} variant="secondary" isLoading={isLoading} className="flex-1">
              Não Permitir / Informar Manualmente
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-grow p-3 bg-primary border border-neutral-dark rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none text-neutral placeholder-neutral-dark"
            disabled={isLoading || canGenerateRecommendation}
            aria-label="Sua mensagem para o chatbot"
          />
          <Button type="submit" isLoading={isLoading} disabled={!userInput.trim() || canGenerateRecommendation}>
            Enviar
          </Button>
        </form>
      )}

      {canGenerateRecommendation && !awaitingLocationPermission && (
        <div className="mt-6 text-center">
            <p className="text-green-400 mb-3">Coleta de requisitos concluída!</p>
            <Button onClick={() => onAnamnesisComplete(anamnesisData)} variant="primary" size="lg">
                Gerar Recomendação de Build
            </Button>
        </div>
      )}
      <div className="mt-4 p-3 bg-primary/50 border border-neutral-dark/50 rounded-md text-xs max-h-48 overflow-y-auto">
        <h4 className="font-semibold text-accent mb-1">Dados Coletados:</h4>
        <ul className="list-disc list-inside">
            {Object.entries(anamnesisData).map(([key, value]) => {
                if (value === undefined || value === null || value === '' || (typeof value === 'boolean' && !value)) return null;
                // Skip empty objects or arrays if necessary, though most values are primitives/strings here
                if (typeof value === 'object' && Object.keys(value).length === 0) return null;

                const displayValue = typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value);
                return <li key={key}><span className="font-medium">{getDisplayKey(key)}:</span> {displayValue}</li> 
            })}
        </ul>
      </div>
    </div>
  );
};

export default ChatbotAnamnesis;
