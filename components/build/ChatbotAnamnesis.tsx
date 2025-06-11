
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnamnesisData, ChatMessage } from '../../types';
import { getChatbotResponse } from '../../services/geminiService';
import Button from '../core/Button';
import LoadingSpinner from '../core/LoadingSpinner';

interface ChatbotAnamnesisProps {
  onAnamnesisComplete: (data: AnamnesisData) => void;
  initialAnamnesisData?: AnamnesisData;
}

const ChatbotAnamnesis: React.FC<ChatbotAnamnesisProps> = ({ onAnamnesisComplete, initialAnamnesisData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anamnesisData, setAnamnesisData] = useState<AnamnesisData>(initialAnamnesisData || {});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const addMessage = useCallback((sender: 'user' | 'ai' | 'system', text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender, text, timestamp: Date.now() }]);
  }, []);

  useEffect(() => {
    addMessage('ai', 'Olá! Sou o CodeTuga, seu assistente para montar o PC ideal. Para começarmos, qual será o propósito principal do seu novo computador? (Ex: jogos, trabalho, edição de vídeo, uso geral)');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMsgText = userInput;
    addMessage('user', userMsgText);
    setUserInput('');
    setIsLoading(true);

    try {
      const { aiResponse, updatedAnamnesis } = await getChatbotResponse(messages, userMsgText, anamnesisData);
      addMessage('ai', aiResponse);
      setAnamnesisData(updatedAnamnesis);

      // Check if anamnesis is complete (simple check, AI response should guide this)
      if (aiResponse.toLowerCase().includes("posso prosseguir para gerar uma recomendação")) {
         // Or a more robust check:
         // if (updatedAnamnesis.purpose && updatedAnamnesis.budget && updatedAnamnesis.envTemperature && updatedAnamnesis.envHumidity && updatedAnamnesis.envDust) {
        addMessage('system', 'Coleta de requisitos concluída! Clique em "Gerar Recomendação" para continuar.');
        // Potentially disable chat input here or show a button to proceed
      }
    } catch (error) {
      console.error("Error in chat:", error);
      addMessage('system', 'Desculpe, ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const allFieldsCollected = !!(anamnesisData.purpose && anamnesisData.budget && anamnesisData.envTemperature && anamnesisData.envHumidity && anamnesisData.envDust);


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
        {isLoading && messages.length > 0 && messages[messages.length -1].sender === 'user' && (
             <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow bg-neutral-dark text-neutral">
                    <LoadingSpinner size="sm" text="Digitando..." />
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-3">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-grow p-3 bg-primary border border-neutral-dark rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none text-neutral placeholder-neutral-dark"
          disabled={isLoading || allFieldsCollected}
        />
        <Button type="submit" isLoading={isLoading} disabled={!userInput.trim() || allFieldsCollected}>
          Enviar
        </Button>
      </form>
      {allFieldsCollected && (
        <div className="mt-6 text-center">
            <p className="text-green-400 mb-3">Coleta de requisitos concluída!</p>
            <Button onClick={() => onAnamnesisComplete(anamnesisData)} variant="primary" size="lg">
                Gerar Recomendação de Build
            </Button>
        </div>
      )}
      <div className="mt-4 p-3 bg-primary/50 border border-neutral-dark/50 rounded-md text-xs">
        <h4 className="font-semibold text-accent mb-1">Dados Coletados:</h4>
        <ul className="list-disc list-inside">
            {Object.entries(anamnesisData).map(([key, value]) => value ? <li key={key}><span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {value}</li> : null )}
        </ul>
      </div>
    </div>
  );
};

export default ChatbotAnamnesis;
    