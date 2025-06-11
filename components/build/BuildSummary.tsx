
import React from 'react';
import { Build, SelectedComponent, PCComponent } from '../../types';
import Button from '../core/Button';
import { MOCK_COMPONENTS } from '../../constants/components';

interface BuildSummaryProps {
  build: Build | null;
  isLoading?: boolean;
  onSaveBuild?: (build: Build) => void;
  onExportBuild?: (build: Build) => void;
  aiRecommendationNotes?: string;
}

const ComponentItem: React.FC<{ component: SelectedComponent }> = ({ component }) => (
  <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-3 bg-primary rounded-lg hover:bg-primary/80 transition-colors duration-150">
    <div className="flex items-center mb-2 sm:mb-0">
      <img src={component.imageUrl || `https://picsum.photos/seed/${component.id}/50/50`} alt={component.name} className="w-12 h-12 object-cover rounded-md mr-4" />
      <div>
        <h4 className="font-semibold text-accent text-md">{component.name}</h4>
        <p className="text-xs text-neutral-dark">{component.category} - {component.brand}</p>
      </div>
    </div>
    <p className="font-medium text-neutral text-sm sm:text-base self-end sm:self-center">R$ {component.price.toFixed(2)}</p>
  </li>
);

const BuildSummary: React.FC<BuildSummaryProps> = ({ build, isLoading, onSaveBuild, onExportBuild, aiRecommendationNotes }) => {
  if (isLoading) {
    return (
      <div className="bg-secondary p-6 rounded-lg shadow-xl text-center">
        <h3 className="text-2xl font-semibold text-accent mb-4">Gerando sua build...</h3>
        {/* You can use LoadingSpinner here if you have one */}
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-dark rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-6 bg-neutral-dark rounded w-1/2 mx-auto mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-primary rounded-lg mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!build || build.components.length === 0) {
    return (
      <div className="bg-secondary p-6 rounded-lg shadow-xl text-center">
        <h3 className="text-xl font-semibold text-neutral-dark">Nenhuma build para exibir.</h3>
        <p className="text-sm text-neutral-dark mt-2">Inicie uma nova montagem ou selecione componentes.</p>
      </div>
    );
  }
  
  const getFullComponentDetails = (componentId: string): PCComponent | undefined => {
    return MOCK_COMPONENTS.find(c => c.id === componentId);
  };

  // Ensure components in the build have full details if they were stored as IDs
  const detailedComponents = build.components.map(c => {
    if (c.name && c.price) return c; // Already detailed
    const fullDetails = getFullComponentDetails(c.id);
    return fullDetails || c; // Fallback to c if not found, though it should be
  }) as SelectedComponent[];

  const totalPrice = detailedComponents.reduce((sum, component) => sum + component.price, 0);


  return (
    <div className="bg-secondary p-6 rounded-lg shadow-xl">
      <h3 className="text-3xl font-bold text-accent mb-6 pb-3 border-b border-neutral-dark/30">
        Resumo da Build: <span className="text-neutral">{build.name || 'Minha Nova Build'}</span>
      </h3>
      
      {aiRecommendationNotes && (
        <div className="mb-6 p-4 bg-primary/70 border border-accent/30 rounded-lg">
          <h4 className="font-semibold text-accent mb-2">Notas da IA:</h4>
          <p className="text-sm text-neutral whitespace-pre-wrap">{aiRecommendationNotes}</p>
        </div>
      )}

      {build.compatibilityIssues && build.compatibilityIssues.length > 0 && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <h4 className="font-semibold text-red-400 mb-2">Avisos de Compatibilidade:</h4>
          <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
            {build.compatibilityIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <ul className="space-y-3 mb-6">
        {detailedComponents.map((component) => (
          <ComponentItem key={component.id} component={component} />
        ))}
      </ul>

      <div className="mt-8 pt-6 border-t border-neutral-dark/30">
        <div className="flex justify-between items-center mb-6">
          <p className="text-2xl font-semibold text-neutral">Total Estimado:</p>
          <p className="text-3xl font-bold text-accent">R$ {totalPrice.toFixed(2)}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {onSaveBuild && (
            <Button onClick={() => onSaveBuild(build)} variant="primary" size="lg" className="flex-1">
              Salvar Build
            </Button>
          )}
          {onExportBuild && (
            <Button onClick={() => onExportBuild(build)} variant="secondary" size="lg" className="flex-1">
              Exportar Build
            </Button>
          )}
        </div>
      </div>
       {build.requirements && (
         <div className="mt-6 p-4 bg-primary/50 border border-neutral-dark/50 rounded-md text-xs">
            <h4 className="font-semibold text-accent mb-1">Requisitos Usados para esta Build:</h4>
            <ul className="list-disc list-inside">
                {Object.entries(build.requirements).map(([key, value]) => value ? <li key={key}><span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {value}</li> : null )}
            </ul>
        </div>
       )}
    </div>
  );
};

export default BuildSummary;
    