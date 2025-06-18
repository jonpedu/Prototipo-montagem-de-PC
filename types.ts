
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
  id:string;
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

export type MachineType = 
  | 'Computador Pessoal' 
  | 'Servidor' 
  | 'Estação de Trabalho'
  | 'Máquina para Mineração' 
  | 'PC para Streaming'
  | 'Outro'
  | 'Customizado';

export type PurposeType = 
  | 'Jogos' 
  | 'Trabalho/Produtividade' 
  | 'Edição Criativa' 
  | 'Uso Geral' 
  | 'HTPC' 
  | 'Outro';

export type GamingType = 'Competitivos/eSports' | 'AAA/High-End' | 'VR' | 'Casual' | 'Outro';
export type WorkField = 'Desenvolvimento' | 'Design Gráfico' | 'Engenharia/3D' | 'Escritório' | 'Ciência de Dados' | 'Outro';
export type CreativeEditingType = 'Vídeo' | 'Foto' | 'Áudio' | '3D' | 'Outro';
export type CreativeWorkResolution = 'HD' | '4K' | '8K' | 'Outro';
export type ProjectSize = 'Pequeno' | 'Médio' | 'Grande';
export type BuildExperience = 'Montar Sozinho' | 'Pré-configurado';
export type AestheticsImportance = 'Baixa' | 'Média' | 'Alta';
export type ServerType = 'Arquivos' | 'Web' | 'Banco de Dados' | 'Virtualização' | 'Render Farm' | 'Outro';
export type ServerUptime = '99%' | '99.9%' | '99.99%' | 'Outro';
export type ServerScalability = 'Baixa' | 'Média' | 'Alta';
export type EnvTempControlType = 'Ar condicionado' | 'Ventilação natural' | 'Outro';
export type CaseSizeType = 'Mini-ITX' | 'Micro-ATX' | 'ATX' | 'Full Tower' | 'Outro';
export type NoiseLevelType = 'Silencioso' | 'Moderado' | 'Indiferente';


export interface AnamnesisData {
  // Core
  machineType?: MachineType;
  budget?: number; // Stores the final numeric budget
  budgetRange?: 'Econômico [R$2-4k]' | 'Médio [R$4-8k]' | 'High-End [R$8k+]' | 'Personalizar'; // Stores the user's textual choice for budget range

  // Computador Pessoal Details
  purpose?: PurposeType;
  // -- Jogos Sub-flow
  gamingType?: GamingType;
  monitorSpecs?: string; // e.g., "1080p/60Hz, 1440p/144Hz, 4K/60Hz+"
  peripheralsNeeded?: 'Sim' | 'Não' | 'Não especificado';
  // -- Trabalho/Produtividade Sub-flow
  workField?: WorkField;
  softwareUsed?: string; // "Quais softwares principais você usa?" - This was already here, good.
  multipleMonitors?: 'Sim' | 'Não' | 'Não especificado';
  monitorCount?: number;
  // -- Edição Criativa Sub-flow
  creativeEditingType?: CreativeEditingType;
  creativeWorkResolution?: CreativeWorkResolution;
  projectSize?: ProjectSize;
  // -- Experiência do Usuário (Computador Pessoal)
  buildExperience?: BuildExperience;
  brandPreference?: string; // e.g., "AMD/Intel/NVIDIA" or specific brands
  aestheticsImportance?: AestheticsImportance;

  // Servidor Details
  serverType?: ServerType;
  serverUsers?: string; // "Número estimado de usuários/conexões simultâneas?"
  serverRedundancy?: string; // "Necessidade de redundância? (RAID, PSU redundante)"
  serverUptime?: ServerUptime;
  serverScalability?: ServerScalability;

  // Máquina para Mineração Details
  miningCrypto?: string; // "Quais criptomoedas pretende minerar?"
  miningHashrate?: string; // "Hashrate desejado?"
  miningGpuCount?: string; // "Número de GPUs planejado?"
  miningEnergyCost?: string; // "Custo energético na sua região?"
  
  // Estação de Trabalho / PC para Streaming (could leverage existing `preferences` or add specific fields if needed by AI flow)
  // For now, these will likely fall into 'preferences' or share fields with 'Computador Pessoal'

  // Environmental Conditions (refined)
  city?: string;
  countryCode?: string;
  // -- Specific PC Location (already exists, good)
  pcVentilation?: 'Ar Condicionado' | 'Ventilador' | 'Ambiente Externo' | 'Outro'; // From existing
  pcDustLevel?: 'Baixa' | 'Média' | 'Alta'; // Changed from 'Baixo' | 'Médio' | 'Alto'
  pcRoomType?: string; // From existing
  // -- General Environment (if specific not available or for other types)
  envTempControl?: EnvTempControlType; // New: "O ambiente tem controle de temperatura?"
  envDust?: 'Baixa' | 'Média' | 'Alta'; // Existing, good for: "Nível de poeira no ambiente?"

  // General Preferences (can overlap or be used for specific details not covered)
  preferences?: string;
  caseSize?: CaseSizeType;
  noiseLevel?: NoiseLevelType;
  specificPorts?: string;

  // Custom/Unknown Machine Type Fields
  isCustomType?: boolean;
  customDescription?: string;
  criticalComponents?: string;
  usagePatterns?: string;
  physicalConstraints?: string;
  specialRequirements?: string; // May overlap with criticalComponents or customDescription
  referenceSystems?: string;

  // Utility (already exists)
  envTemperature?: 'Baixa' | 'Média' | 'Alta'; // Fallback, less specific
  envHumidity?: 'Baixa' | 'Média' | 'Alta'; // Fallback, less specific
  workType?: string; // Se purpose for 'Trabalho' - can be consolidated into workField potentially or used as more generic input

  [key: string]: any; // For dynamic properties during chat, use 'any' carefully
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

export type BuildMode = 'auto' | null;

// For compatibility checking
export interface CompatibilityRules {
  [key: string]: (component: PCComponent, buildSoFar: SelectedComponent[]) => string | null;
}
