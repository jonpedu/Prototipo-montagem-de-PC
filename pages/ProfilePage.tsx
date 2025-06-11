
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/core/Button';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return <p className="text-center text-neutral-dark py-10">Carregando perfil...</p>;
  }

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <div className="max-w-2xl mx-auto bg-secondary p-8 sm:p-10 rounded-xl shadow-2xl">
      <h1 className="text-3xl sm:text-4xl font-bold text-accent mb-8 text-center">
        Meu Perfil
      </h1>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-1">Nome</label>
          <div className="mt-1 text-lg text-neutral p-4 bg-primary rounded-lg shadow-sm">
            {currentUser.name}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-1">Email</label>
          <div className="mt-1 text-lg text-neutral p-4 bg-primary rounded-lg shadow-sm">
            {currentUser.email}
          </div>
        </div>
        
        <div className="pt-6 border-t border-neutral-dark/30">
          <h2 className="text-xl font-semibold text-accent mb-4">Configurações da Conta</h2>
          <div className="bg-primary p-4 rounded-lg shadow-sm">
            <p className="text-neutral-dark">
              Funcionalidades como alterar senha, gerenciar preferências de notificação e outras configurações de conta estarão disponíveis aqui em breve.
            </p>
          </div>
        </div>

        <div className="pt-8 mt-4 text-center">
          <Button onClick={handleLogout} variant="danger" size="lg">
            Sair da Conta (Logout)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
