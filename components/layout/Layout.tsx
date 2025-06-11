
import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-neutral-dark py-8 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} CodeTugaBuilds. Todos os direitos reservados.</p>
        <p className="text-sm mt-1">Montador de PCs Inteligente</p>
      </div>
    </footer>
  );
};


const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-primary text-neutral">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
    