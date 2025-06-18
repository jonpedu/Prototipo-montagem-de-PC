
import { CityWeatherData } from '../types';

// ATENÇÃO: A API Key deve ser configurada na sua variável de ambiente.
// Em um app de produção, esta chave NUNCA deve ser exposta no frontend.
// Use um backend ou função serverless como proxy.
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const OPENWEATHERMAP_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface OpenWeatherMapResponse {
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  name: string; // City name from API
}

export const getCityWeather = async (city: string, countryCode?: string): Promise<CityWeatherData | null> => {
  if (!OPENWEATHERMAP_API_KEY) {
    console.warn("OpenWeatherMap API Key não está configurada. Não é possível buscar dados climáticos.");
    return null;
  }

  const queryParams = new URLSearchParams({
    q: countryCode ? `${city},${countryCode}` : city,
    appid: OPENWEATHERMAP_API_KEY,
    units: 'metric', // Para temperaturas em Celsius
    lang: 'pt_br',   // Para descrições em português
  });

  try {
    const response = await fetch(`${OPENWEATHERMAP_API_URL}?${queryParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Falha ao buscar dados da OpenWeatherMap:', response.status, errorData.message || response.statusText);
      return null;
    }

    const data: OpenWeatherMapResponse = await response.json();

    if (!data.main || !data.weather || data.weather.length === 0) {
      console.error('Resposta da OpenWeatherMap incompleta:', data);
      return null;
    }
    
    // Para "current weather", temp_min e temp_max podem ser muito próximos de temp.
    // Usaremos 'temp' como a média e 'temp_max' como a máxima do dia (aproximação).
    return {
      avgTemp: Math.round(data.main.temp),
      maxTemp: Math.round(data.main.temp_max),
      minTemp: Math.round(data.main.temp_min),
      description: data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1),
      iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    };

  } catch (error) {
    console.error('Erro ao conectar com a API OpenWeatherMap:', error);
    return null;
  }
};
