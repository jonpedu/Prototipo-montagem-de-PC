
import React, { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import { getUserLocation, GeoLocation } from '../../services/geoService'; // Importar o novo serviço

interface LayoutProps {
  children: ReactNode;
}

const Footer: React.FC = () => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      setLoadingLocation(true);
      setLocationError(null);
      try {
        const loc = await getUserLocation();
        if (loc) {
          setLocation(loc);
        } else {
          setLocationError('Não foi possível obter dados de localização.');
        }
      } catch (error) {
        console.error("Error in fetchLocation useEffect:", error);
        setLocationError('Erro ao buscar localização.');
      } finally {
        setLoadingLocation(false);
      }
    };
    fetchLocation();
  }, []);

  return (
    <footer className="bg-secondary text-neutral-dark py-8 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} CodeTugaBuilds. Todos os direitos reservados.</p>
        <p className="text-sm mt-1">Montador de PCs Inteligente</p>
        <div className="mt-4 text-xs">
          {loadingLocation && <p>Detectando localização...</p>}
          {locationError && <p>{locationError}</p>}
          {location && !loadingLocation && (
            <p>
              Localização aproximada: {location.city || 'N/A'}, {location.country || 'N/A'}.
              {/* Para obter o clima, você usaria esta cidade/país com outra API de clima. */}
            </p>
          )}
        </div>
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
