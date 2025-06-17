
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnamnesisData, Build, PCComponent, SelectedComponent, AIRecommendation } from '../types';
import ChatbotAnamnesis from '../components/build/ChatbotAnamnesis';
import BuildSummary from '../components/build/BuildSummary';
import LoadingSpinner from '../components/core/LoadingSpinner';
import Button from '../components/core/Button';
import { getBuildRecommendation } from '../services/geminiService';
import { MOCK_COMPONENTS } from '../constants/components';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/core/Modal';

const BuildPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [anamnesisData, setAnamnesisData] = useState<AnamnesisData | null>(null);
  const [currentBuild, setCurrentBuild] = useState<Build | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<string | undefined>(undefined);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportedText, setExportedText] = useState<string>('');

  const [isAuthInfoModalOpen, setIsAuthInfoModalOpen] = useState<boolean>(false);
  const hasProceededAnonymously = useRef<boolean>(false);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const buildIdFromPath = pathParts.length > 2 && pathParts[1] === 'build' ? pathParts[2] : null;

    if (
      !currentUser &&
      !buildIdFromPath && // Only for new builds initiated via /build
      !hasProceededAnonymously.current &&
      !anamnesisData &&
      !currentBuild &&
      !isLoading &&
      !error
    ) {
      setIsAuthInfoModalOpen(true);
    }
  }, [currentUser, location.pathname, anamnesisData, currentBuild, isLoading, error]);


  const handleLoginForBuild = () => {
    setIsAuthInfoModalOpen(false);
    navigate('/login', { state: { from: location } });
  };

  const handleContinueAnonymously = () => {
    setIsAuthInfoModalOpen(false);
    hasProceededAnonymously.current = true;
  };
  
  const handleAnamnesisComplete = useCallback((data: AnamnesisData) => {
    setAnamnesisData(data);
    setIsLoading(true);
    setError(null);
    setAiNotes(undefined);
    setCurrentBuild(null); 
    
    getBuildRecommendation(data, MOCK_COMPONENTS)
      .then(recommendation => {
        if (recommendation) {
          const recommendedComponents = MOCK_COMPONENTS.filter(c => recommendation.recommendedComponentIds.includes(c.id));
          
          const detailedComponents: SelectedComponent[] = recommendedComponents.map(comp => {
            const mockComp = MOCK_COMPONENTS.find(mc => mc.id === comp.id);
            return {
                ...comp, 
                name: mockComp?.name || "Componente Desconhecido",
                brand: mockComp?.brand || "Marca Desconhecida",
                price: mockComp?.price || 0,
                category: mockComp?.category || "Categoria Desconhecida",
                imageUrl: mockComp?.imageUrl,
                specs: mockComp?.specs || {},
            } as SelectedComponent;
          });

          const totalPrice = detailedComponents.reduce((sum, comp) => sum + comp.price, 0);

          setCurrentBuild({
            id: Date.now().toString(),
            name: `Build IA para ${data.purpose || 'Uso Geral'}`,
            components: detailedComponents,
            totalPrice: recommendation.estimatedTotalPrice !== undefined ? recommendation.estimatedTotalPrice : totalPrice,
            createdAt: new Date().toISOString(),
            requirements: data,
            compatibilityIssues: recommendation.compatibilityWarnings || []
          });
          setAiNotes(`${recommendation.justification}${recommendation.budgetNotes ? `\n\nNotas sobre o orçamento: ${recommendation.budgetNotes}` : ''}`);
        } else {
          setError('Não foi possível gerar uma recomendação. Tente ajustar seus requisitos ou tente novamente mais tarde.');
          setCurrentBuild(null);
        }
      })
      .catch(err => {
        console.error("Error fetching build recommendation:", err);
        setError('Ocorreu um erro ao contatar o serviço de IA. Por favor, tente novamente.');
        setCurrentBuild(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveBuild = (buildToSave: Build) => {
    if (!currentUser) {
      // Instead of alert, could re-trigger a login prompt or the same auth info modal
      // For now, keeping original alert and navigate for simplicity if they bypassed initial modal.
      alert("Faça login para salvar suas builds!");
      navigate('/login', { state: { from: location } });
      return;
    }
    const savedBuildsStr = localStorage.getItem(`savedBuilds_${currentUser.id}`);
    const savedBuilds: Build[] = savedBuildsStr ? JSON.parse(savedBuildsStr) : [];
    const existingBuildIndex = savedBuilds.findIndex(b => b.id === buildToSave.id);
    if (existingBuildIndex > -1) {
        savedBuilds[existingBuildIndex] = { ...buildToSave, userId: currentUser.id };
    } else {
        savedBuilds.push({ ...buildToSave, userId: currentUser.id });
    }
    localStorage.setItem(`savedBuilds_${currentUser.id}`, JSON.stringify(savedBuilds));
    alert(`Build "${buildToSave.name}" salva com sucesso!`);
  };

  const handleExportBuild = (buildToExport: Build) => {
    if (!currentUser && !hasProceededAnonymously.current) {
        // If they try to export without logging in and didn't see/dismiss the initial modal.
        // This scenario is less likely if the initial modal works correctly.
        setIsAuthInfoModalOpen(true); // Re-show the modal.
        return;
    }
    if (!currentUser && hasProceededAnonymously.current) {
        alert("Faça login para exportar sua build.");
        navigate('/login', { state: { from: location }});
        return;
    }

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
  
  const handleTryAgain = () => {
    setError(null);
    setCurrentBuild(null);
    setAnamnesisData(null); 
    hasProceededAnonymously.current = false; // Reset this so modal can show again if still not logged in
    // This will re-render ChatbotAnamnesis as currentBuild, isLoading and error are null/false
    // and potentially re-trigger the auth modal effect.
  };


  return (
    <div className="container mx-auto p-4">
      {isAuthInfoModalOpen ? (
        <Modal
          isOpen={isAuthInfoModalOpen}
          onClose={handleContinueAnonymously} // Closing via 'X' is like continuing anonymously
          title="Aviso: Montagem Anônima"
          size="md"
        >
          <p className="text-neutral-dark mb-6">
            Você pode iniciar a montagem do seu PC agora. No entanto, para salvar sua build no perfil ou exportá-la, será necessário fazer login.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleLoginForBuild} variant="primary" className="flex-1">
              Fazer Login
            </Button>
            <Button onClick={handleContinueAnonymously} variant="secondary" className="flex-1">
              Continuar sem Login
            </Button>
          </div>
        </Modal>
      ) : (
        <>
          {!currentBuild && !isLoading && !error && (
            <ChatbotAnamnesis onAnamnesisComplete={handleAnamnesisComplete} initialAnamnesisData={anamnesisData || {}} />
          )}

          {isLoading && (
            <div className="text-center py-10">
              <LoadingSpinner size="lg" text={'IA está pensando na sua build...'} />
            </div>
          )}

          {error && !isLoading && (
            <div className="my-6 p-6 bg-red-800/90 text-red-100 rounded-lg text-center shadow-xl">
              <h3 className="text-2xl font-semibold mb-3">Oops! Algo deu errado.</h3>
              <p className="mb-4">{error}</p>
              <Button onClick={handleTryAgain} variant="secondary" size="lg">
                Tentar Novamente com a IA
              </Button>
            </div>
          )}
          
          {!isLoading && !error && currentBuild && (
            <BuildSummary
                build={currentBuild}
                isLoading={isLoading} 
                onSaveBuild={handleSaveBuild}
                onExportBuild={handleExportBuild}
                aiRecommendationNotes={aiNotes}
              />
          )}
        </>
      )}

      <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Exportar Build" size="lg">
        <textarea
          readOnly
          value={exportedText}
          className="w-full h-64 p-3 bg-primary border border-neutral-dark rounded-md text-neutral text-xs whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Texto da Build Exportada"
        ></textarea>
        <div className="mt-4 flex gap-3">
            <Button 
                onClick={() => {
                    navigator.clipboard.writeText(exportedText)
                        .then(() => alert("Copiado para a área de transferência!"))
                        .catch(() => alert("Falha ao copiar."));
                }}
                variant="primary"
                className="flex-1"
            >
                Copiar para Área de Transferência
            </Button>
            <Button 
                onClick={() => setIsExportModalOpen(false)} 
                variant="secondary"
                className="flex-1"
            >
                Fechar
            </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BuildPage;
