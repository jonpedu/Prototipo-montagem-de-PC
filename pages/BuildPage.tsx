
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnamnesisData, Build, BuildMode, PCComponent, SelectedComponent, AIRecommendation } from '../types';
import ChatbotAnamnesis from '../components/build/ChatbotAnamnesis';
import BuildSummary from '../components/build/BuildSummary';
import LoadingSpinner from '../components/core/LoadingSpinner';
import Button from '../components/core/Button';
import { getBuildRecommendation } from '../services/geminiService';
import { MOCK_COMPONENTS } from '../constants/components';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/core/Modal';

// Dummy compatibility check function for manual mode (very basic)
const checkCompatibility = (component: PCComponent, currentBuildComponents: SelectedComponent[]): string[] => {
  const issues: string[] = [];
  const motherboard = currentBuildComponents.find(c => c.category === 'Placa-mãe');
  const cpu = currentBuildComponents.find(c => c.category === 'Processador');
  const ram = currentBuildComponents.find(c => c.category === 'Memória RAM');

  if (component.category === 'Placa-mãe') {
    if (cpu && cpu.specs.socket !== component.specs.socket) {
      issues.push(`CPU ${cpu.name} (socket ${cpu.specs.socket}) não é compatível com Placa-mãe ${component.name} (socket ${component.specs.socket}).`);
    }
    if (ram && ram.specs.type !== component.specs.ram_type) {
      issues.push(`RAM ${ram.name} (tipo ${ram.specs.type}) não é compatível com Placa-mãe ${component.name} (tipo RAM ${component.specs.ram_type}).`);
    }
  } else if (component.category === 'Processador') {
    if (motherboard && motherboard.specs.socket !== component.specs.socket) {
      issues.push(`Placa-mãe ${motherboard.name} (socket ${motherboard.specs.socket}) não é compatível com CPU ${component.name} (socket ${component.specs.socket}).`);
    }
  } else if (component.category === 'Memória RAM') {
    if (motherboard && motherboard.specs.ram_type !== component.specs.type) {
       issues.push(`Placa-mãe ${motherboard.name} (tipo RAM ${motherboard.specs.ram_type}) não é compatível com RAM ${component.name} (tipo ${component.specs.type}).`);
    }
  }
  // Add more checks for PSU, Case size etc. for a real app
  return issues;
};


const BuildPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [buildMode, setBuildMode] = useState<BuildMode>(null);
  const [anamnesisData, setAnamnesisData] = useState<AnamnesisData | null>(null);
  const [currentBuild, setCurrentBuild] = useState<Build | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<string | undefined>(undefined);
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportedText, setExportedText] = useState<string>('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode') as BuildMode;
    if (mode === 'auto' || mode === 'manual') {
      setBuildMode(mode);
    } else {
      // Default or show selection if no mode is specified
      setBuildMode(null); // This will show the mode selector
    }
  }, [location.search]);
  
  const handleAnamnesisComplete = useCallback((data: AnamnesisData) => {
    setAnamnesisData(data);
    setIsLoading(true);
    setError(null);
    setAiNotes(undefined);
    getBuildRecommendation(data, MOCK_COMPONENTS)
      .then(recommendation => {
        if (recommendation) {
          const recommendedComponents = MOCK_COMPONENTS.filter(c => recommendation.recommendedComponentIds.includes(c.id));
          const totalPrice = recommendedComponents.reduce((sum, comp) => sum + comp.price, 0);
          setCurrentBuild({
            id: Date.now().toString(),
            name: `Build IA para ${data.purpose || 'Uso Geral'}`,
            components: recommendedComponents,
            totalPrice: recommendation.estimatedTotalPrice || totalPrice,
            createdAt: new Date().toISOString(),
            requirements: data,
            compatibilityIssues: recommendation.compatibilityWarnings
          });
          setAiNotes(`${recommendation.justification}${recommendation.budgetNotes ? `\n\nNotas sobre o orçamento: ${recommendation.budgetNotes}` : ''}`);
        } else {
          setError('Não foi possível gerar uma recomendação. Tente ajustar seus requisitos.');
          setCurrentBuild(null);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Ocorreu um erro ao contatar o serviço de IA.');
        setCurrentBuild(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveBuild = (buildToSave: Build) => {
    if (!currentUser) {
      alert("Faça login para salvar suas builds!");
      navigate('/login', { state: { from: location } });
      return;
    }
    // In a real app, this would call a service to save to backend.
    // For now, we'll use localStorage for demonstration or just log.
    const savedBuildsStr = localStorage.getItem(`savedBuilds_${currentUser.id}`);
    const savedBuilds: Build[] = savedBuildsStr ? JSON.parse(savedBuildsStr) : [];
    localStorage.setItem(`savedBuilds_${currentUser.id}`, JSON.stringify([...savedBuilds, { ...buildToSave, userId: currentUser.id }]));
    alert(`Build "${buildToSave.name}" salva com sucesso!`);
  };

  const handleExportBuild = (buildToExport: Build) => {
    let text = `Build: ${buildToExport.name}\n`;
    text += `Data: ${new Date(buildToExport.createdAt).toLocaleDateString()}\n`;
    text += `Preço Total Estimado: R$ ${buildToExport.totalPrice.toFixed(2)}\n\n`;
    text += `Componentes:\n`;
    buildToExport.components.forEach(c => {
      text += `- ${c.category}: ${c.name} (${c.brand}) - R$ ${c.price.toFixed(2)}\n`;
    });
    if(buildToExport.requirements){
      text += `\nRequisitos:\n`;
      Object.entries(buildToExport.requirements).forEach(([key, value]) => {
        if(value) text += `- ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}\n`;
      });
    }
    if(aiNotes) text += `\nNotas da IA:\n${aiNotes}\n`;
    if(buildToExport.compatibilityIssues && buildToExport.compatibilityIssues.length > 0){
      text += `\nAvisos de Compatibilidade:\n`;
      buildToExport.compatibilityIssues.forEach(issue => text += `- ${issue}\n`);
    }
    setExportedText(text);
    setIsExportModalOpen(true);
  };
  
  // Manual Mode Functions
  const handleAddComponentManual = (component: PCComponent) => {
    setCurrentBuild(prevBuild => {
      const newComponents = prevBuild ? [...prevBuild.components, component] : [component];
      const issues = checkCompatibility(component, prevBuild?.components || []);
      setCompatibilityIssues(prev => [...prev, ...issues]);
      
      const totalPrice = newComponents.reduce((sum, c) => sum + c.price, 0);
      return {
        id: prevBuild?.id || Date.now().toString(),
        name: prevBuild?.name || 'Minha Build Manual',
        components: newComponents,
        totalPrice: totalPrice,
        createdAt: prevBuild?.createdAt || new Date().toISOString(),
        compatibilityIssues: prevBuild?.compatibilityIssues ? [...prevBuild.compatibilityIssues, ...issues] : issues,
      };
    });
  };

  const renderModeSelector = () => (
    <div className="text-center max-w-md mx-auto bg-secondary p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-semibold text-accent mb-6">Como você quer montar seu PC?</h2>
      <div className="space-y-4">
        <Button onClick={() => { setBuildMode('auto'); navigate('/build?mode=auto', {replace: true}); }} variant="primary" size="lg" className="w-full">
          Modo Automático (Recomendação por IA)
        </Button>
        <Button onClick={() => { setBuildMode('manual'); navigate('/build?mode=manual', {replace: true}); }} variant="secondary" size="lg" className="w-full">
          Modo Manual (Escolher Peças)
        </Button>
      </div>
    </div>
  );

  const renderManualMode = () => {
    // Basic manual mode UI
    const categories = Array.from(new Set(MOCK_COMPONENTS.map(c => c.category)));
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-secondary p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-accent mb-4">Escolha seus Componentes</h2>
          {categories.map(category => (
            <div key={category} className="mb-4">
              <h3 className="text-xl text-neutral-dark mb-2">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_COMPONENTS.filter(c => c.category === category).map(comp => (
                  <div key={comp.id} className="bg-primary p-3 rounded-md hover:shadow-lg transition-shadow">
                    <img src={comp.imageUrl || `https://picsum.photos/seed/${comp.id}/100/100`} alt={comp.name} className="w-full h-24 object-cover rounded mb-2"/>
                    <h4 className="text-sm font-semibold text-accent">{comp.name}</h4>
                    <p className="text-xs text-neutral-dark">R$ {comp.price.toFixed(2)}</p>
                    <Button size="sm" variant="ghost" onClick={() => handleAddComponentManual(comp)} className="mt-2 w-full text-xs">Adicionar</Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-1">
         {currentBuild && currentBuild.components.length > 0 ? (
            <BuildSummary
                build={currentBuild}
                onSaveBuild={handleSaveBuild}
                onExportBuild={handleExportBuild}
            />
            ) : (
            <div className="bg-secondary p-6 rounded-lg shadow-xl text-center">
                <h3 className="text-xl font-semibold text-neutral-dark">Sua build aparecerá aqui.</h3>
                <p className="text-sm text-neutral-dark mt-2">Adicione componentes para começar.</p>
            </div>
            )}
        </div>
      </div>
    );
  };


  if (buildMode === null) {
    return renderModeSelector();
  }

  return (
    <div className="container mx-auto p-4">
      {buildMode === 'auto' && !currentBuild && !isLoading && !error && (
        <ChatbotAnamnesis onAnamnesisComplete={handleAnamnesisComplete} />
      )}

      {isLoading && (
        <div className="text-center py-10">
          <LoadingSpinner size="lg" text={buildMode === 'auto' ? 'IA está pensando na sua build...' : 'Carregando...'} />
        </div>
      )}

      {error && (
        <div className="my-6 p-4 bg-red-800 text-red-100 rounded-lg text-center">
          <p className="font-semibold">Erro!</p>
          <p>{error}</p>
          <Button onClick={() => {setError(null); setCurrentBuild(null); setAnamnesisData(null); setBuildMode(null); navigate('/build', {replace: true});}} className="mt-4">Tentar Novamente</Button>
        </div>
      )}
      
      {buildMode === 'auto' && !isLoading && !error && currentBuild && (
         <BuildSummary
            build={currentBuild}
            isLoading={isLoading}
            onSaveBuild={handleSaveBuild}
            onExportBuild={handleExportBuild}
            aiRecommendationNotes={aiNotes}
          />
      )}
      
      {buildMode === 'manual' && (
        renderManualMode()
      )}

      <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Exportar Build" size="lg">
        <textarea
          readOnly
          value={exportedText}
          className="w-full h-64 p-2 bg-primary border border-neutral-dark rounded-md text-neutral text-xs whitespace-pre-wrap"
        ></textarea>
        <Button onClick={() => navigator.clipboard.writeText(exportedText)} className="mt-4 mr-2">Copiar para Área de Transferência</Button>
        <Button onClick={() => setIsExportModalOpen(false)} variant="secondary" className="mt-4">Fechar</Button>
      </Modal>
    </div>
  );
};

export default BuildPage;
    