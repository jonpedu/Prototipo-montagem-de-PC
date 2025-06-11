
export interface User {
  id: string;
  name: string;
  email: string;
}

export enum ComponentCategory {
  CPU = "Processador",
  MOTHERBOARD = "Placa-mãe",
  RAM = "Memória RAM",
  GPU = "Placa de Vídeo",
  STORAGE = "Armazenamento",
  PSU = "Fonte",
  CASE = "Gabinete",
  COOLER = "Cooler CPU",
}

export interface PCComponent {
  id: string;
  category: ComponentCategory;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  specs: Record<string, string | number | string[]>; // e.g., { socket: "AM4", cores: 8, ram_type: "DDR4" }
  compatibilityKey?: string; // e.g., socket for CPU/Mobo, RAM type
}

export interface SelectedComponent extends PCComponent {}

export interface Build {
  id: string;
  name: string;
  userId?: string;
  components: SelectedComponent[];
  totalPrice: number;
  createdAt: string; // ISO string date
  requirements?: AnamnesisData;
  compatibilityIssues?: string[];
}

export interface AnamnesisData {
  purpose?: string;
  budget?: number;
  envTemperature?: 'Baixa' | 'Média' | 'Alta';
  envHumidity?: 'Baixa' | 'Média' | 'Alta';
  envDust?: 'Baixa' | 'Média' | 'Alta';
  preferences?: string; // e.g., 'Desempenho', 'Silêncio', 'Marca específica'
  [key: string]: string | number | undefined; // For dynamic properties during chat
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: number;
}

// For Gemini AI Recommendation response structure
export interface AIRecommendation {
  recommendedComponentIds: string[];
  justification: string;
  estimatedTotalPrice?: number;
  budgetNotes?: string; // e.g., if budget was adjusted or alternative offered
  compatibilityWarnings?: string[];
}

export type BuildMode = 'auto' | 'manual' | null;

// For compatibility checking
export interface CompatibilityRules {
  [key: string]: (component: PCComponent, buildSoFar: SelectedComponent[]) => string | null;
}
    