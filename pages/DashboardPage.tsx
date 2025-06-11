
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Build } from '../types';
import Button from '../components/core/Button';
import LoadingSpinner from '../components/core/LoadingSpinner';

const SavedBuildCard: React.FC<{ build: Build; onDelete: (buildId: string) => void }> = ({ build, onDelete }) => {
  return (
    <div className="bg-primary p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-accent mb-2">{build.name}</h3>
      <p className="text-sm text-neutral-dark mb-1">Criada em: {new Date(build.createdAt).toLocaleDateString()}</p>
      <p className="text-sm text-neutral-dark mb-1">Componentes: {build.components.length}</p>
      <p className="text-lg font-medium text-neutral mb-4">Total: R$ {build.totalPrice.toFixed(2)}</p>
      <div className="flex space-x-2">
        <Link to={`/build/${build.id}`}> {/*  Actual view/edit page for build not implemented, placeholder */}
          <Button size="sm" variant="ghost">Ver/Editar</Button>
        </Link>
        <Button size="sm" variant="danger" onClick={() => onDelete(build.id)}>Excluir</Button>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [savedBuilds, setSavedBuilds] = useState<Build[]>([]);
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsLoadingBuilds(true);
      // Simulate fetching builds
      setTimeout(() => {
        const buildsStr = localStorage.getItem(`savedBuilds_${currentUser.id}`);
        setSavedBuilds(buildsStr ? JSON.parse(buildsStr) : []);
        setIsLoadingBuilds(false);
      }, 500);
    }
  }, [currentUser]);

  const handleDeleteBuild = (buildId: string) => {
    if (!currentUser) return;
    const updatedBuilds = savedBuilds.filter(b => b.id !== buildId);
    setSavedBuilds(updatedBuilds);
    localStorage.setItem(`savedBuilds_${currentUser.id}`, JSON.stringify(updatedBuilds));
    alert("Build excluída.");
  };

  if (!currentUser) {
    return <div className="text-center p-8"><p>Por favor, faça login para ver seu painel.</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-accent mb-2">Bem-vindo, {currentUser.name}!</h1>
        <p className="text-lg text-neutral-dark">Gerencie suas montagens e explore novas possibilidades.</p>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-neutral mb-6 pb-2 border-b border-neutral-dark/30">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/build" className="block bg-secondary p-6 rounded-lg shadow-lg hover:bg-opacity-80 transition-colors text-center">
            <div className="text-5xl mb-3 text-accent">🖥️</div>
            <h3 className="text-xl font-semibold text-neutral">Iniciar Nova Montagem</h3>
            <p className="text-sm text-neutral-dark mt-1">Use nossa IA ou monte manualmente.</p>
          </Link>
          <Link to="/profile" className="block bg-secondary p-6 rounded-lg shadow-lg hover:bg-opacity-80 transition-colors text-center"> {/* Profile page not implemented */}
             <div className="text-5xl mb-3 text-accent">👤</div>
            <h3 className="text-xl font-semibold text-neutral">Meu Perfil</h3>
            <p className="text-sm text-neutral-dark mt-1">Veja e edite suas informações.</p>
          </Link>
           <div className="bg-secondary p-6 rounded-lg shadow-lg text-center opacity-50 cursor-not-allowed">
             <div className="text-5xl mb-3 text-accent">💡</div>
            <h3 className="text-xl font-semibold text-neutral">Dicas e Recomendações</h3>
            <p className="text-sm text-neutral-dark mt-1">(Em breve)</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-neutral mb-6 pb-2 border-b border-neutral-dark/30">Minhas Builds Salvas</h2>
        {isLoadingBuilds ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando suas builds..." />
          </div>
        ) : savedBuilds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBuilds.map(build => (
              <SavedBuildCard key={build.id} build={build} onDelete={handleDeleteBuild} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-primary/50 rounded-lg">
            <p className="text-xl text-neutral-dark">Você ainda não tem nenhuma build salva.</p>
            <Link to="/build">
              <Button variant="primary" className="mt-4">Comece a Montar Agora</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
    