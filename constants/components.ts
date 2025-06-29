
import { PCComponent, ComponentCategory } from '../types';

export const MOCK_COMPONENTS: PCComponent[] = [
  // CPUs
  {
    id: 'cpu1',
    category: ComponentCategory.CPU,
    name: 'AMD Ryzen 5 5600X',
    brand: 'AMD',
    price: 1200,
    imageUrl: 'https://picsum.photos/seed/cpu1/200/200',
    specs: { socket: 'AM4', cores: 6, threads: 12, base_clock: '3.7GHz', boost_clock: '4.6GHz', tdp: 65 },
    compatibilityKey: 'AM4',
  },
  {
    id: 'cpu2',
    category: ComponentCategory.CPU,
    name: 'Intel Core i5-12400F',
    brand: 'Intel',
    price: 1000,
    imageUrl: 'https://picsum.photos/seed/cpu2/200/200',
    specs: { socket: 'LGA1700', cores: 6, threads: 12, base_clock: '2.5GHz', boost_clock: '4.4GHz', tdp: 65 },
    compatibilityKey: 'LGA1700',
  },
  {
    id: 'cpu3',
    category: ComponentCategory.CPU,
    name: 'AMD Ryzen 7 7700X',
    brand: 'AMD',
    price: 2200,
    imageUrl: 'https://picsum.photos/seed/cpu3/200/200',
    specs: { socket: 'AM5', cores: 8, threads: 16, base_clock: '4.5GHz', boost_clock: '5.4GHz', tdp: 105 },
    compatibilityKey: 'AM5',
  },
  {
    id: 'cpu4',
    category: ComponentCategory.CPU,
    name: 'Intel Core i7-13700K',
    brand: 'Intel',
    price: 2800,
    imageUrl: 'https://picsum.photos/seed/cpu4/200/200',
    specs: { socket: 'LGA1700', cores: 16, threads: 24, base_clock: '3.4GHz', boost_clock: '5.4GHz', tdp: 125 },
    compatibilityKey: 'LGA1700',
  },
  {
    id: 'cpu5',
    category: ComponentCategory.CPU,
    name: 'AMD Ryzen 9 7900X',
    brand: 'AMD',
    price: 3200,
    imageUrl: 'https://picsum.photos/seed/cpu5/200/200',
    specs: { socket: 'AM5', cores: 12, threads: 24, base_clock: '4.7GHz', boost_clock: '5.6GHz', tdp: 170 },
    compatibilityKey: 'AM5',
  },
  {
    id: 'cpu6',
    category: ComponentCategory.CPU,
    name: 'Intel Core i3-12100F',
    brand: 'Intel',
    price: 600,
    imageUrl: 'https://picsum.photos/seed/cpu6/200/200',
    specs: { socket: 'LGA1700', cores: 4, threads: 8, base_clock: '3.3GHz', boost_clock: '4.3GHz', tdp: 58 },
    compatibilityKey: 'LGA1700',
  },

  // Motherboards
  {
    id: 'mobo1',
    category: ComponentCategory.MOTHERBOARD,
    name: 'MSI B550 TOMAHAWK',
    brand: 'MSI',
    price: 900,
    imageUrl: 'https://picsum.photos/seed/mobo1/200/200',
    specs: { socket: 'AM4', chipset: 'B550', ram_type: 'DDR4', form_factor: 'ATX' },
    compatibilityKey: 'AM4_DDR4',
  },
  {
    id: 'mobo2',
    category: ComponentCategory.MOTHERBOARD,
    name: 'ASUS ROG STRIX B660-F GAMING WIFI',
    brand: 'ASUS',
    price: 1300,
    imageUrl: 'https://picsum.photos/seed/mobo2/200/200',
    specs: { socket: 'LGA1700', chipset: 'B660', ram_type: 'DDR5', form_factor: 'ATX' },
    compatibilityKey: 'LGA1700_DDR5',
  },
  {
    id: 'mobo3',
    category: ComponentCategory.MOTHERBOARD,
    name: 'Gigabyte X670 AORUS ELITE AX',
    brand: 'Gigabyte',
    price: 1800,
    imageUrl: 'https://picsum.photos/seed/mobo3/200/200',
    specs: { socket: 'AM5', chipset: 'X670', ram_type: 'DDR5', form_factor: 'ATX' },
    compatibilityKey: 'AM5_DDR5',
  },
  {
    id: 'mobo4',
    category: ComponentCategory.MOTHERBOARD,
    name: 'ASUS TUF GAMING Z790-PLUS WIFI',
    brand: 'ASUS',
    price: 2000,
    imageUrl: 'https://picsum.photos/seed/mobo4/200/200',
    specs: { socket: 'LGA1700', chipset: 'Z790', ram_type: 'DDR5', form_factor: 'ATX' },
    compatibilityKey: 'LGA1700_DDR5',
  },
  {
    id: 'mobo5',
    category: ComponentCategory.MOTHERBOARD,
    name: 'MSI MAG B650 TOMAHAWK WIFI',
    brand: 'MSI',
    price: 1500,
    imageUrl: 'https://picsum.photos/seed/mobo5/200/200',
    specs: { socket: 'AM5', chipset: 'B650', ram_type: 'DDR5', form_factor: 'ATX' },
    compatibilityKey: 'AM5_DDR5',
  },
  {
    id: 'mobo6',
    category: ComponentCategory.MOTHERBOARD,
    name: 'Gigabyte H610M S2H DDR4',
    brand: 'Gigabyte',
    price: 550,
    imageUrl: 'https://picsum.photos/seed/mobo6/200/200',
    specs: { socket: 'LGA1700', chipset: 'H610', ram_type: 'DDR4', form_factor: 'Micro-ATX' },
    compatibilityKey: 'LGA1700_DDR4',
  },


  // RAM
  {
    id: 'ram1',
    category: ComponentCategory.RAM,
    name: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
    brand: 'Corsair',
    price: 400,
    imageUrl: 'https://picsum.photos/seed/ram1/200/200',
    specs: { type: 'DDR4', capacity_gb: 16, speed_mhz: 3200, modules: 2 },
    compatibilityKey: 'DDR4',
  },
  {
    id: 'ram2',
    category: ComponentCategory.RAM,
    name: 'Kingston Fury Beast 32GB (2x16GB) DDR5 5200MHz',
    brand: 'Kingston',
    price: 800,
    imageUrl: 'https://picsum.photos/seed/ram2/200/200',
    specs: { type: 'DDR5', capacity_gb: 32, speed_mhz: 5200, modules: 2 },
    compatibilityKey: 'DDR5',
  },
  {
    id: 'ram3',
    category: ComponentCategory.RAM,
    name: 'G.Skill Ripjaws V 16GB (2x8GB) DDR4 3600MHz',
    brand: 'G.Skill',
    price: 450,
    imageUrl: 'https://picsum.photos/seed/ram3/200/200',
    specs: { type: 'DDR4', capacity_gb: 16, speed_mhz: 3600, modules: 2 },
    compatibilityKey: 'DDR4',
  },
  {
    id: 'ram4',
    category: ComponentCategory.RAM,
    name: 'Corsair Dominator Platinum RGB 32GB (2x16GB) DDR5 6000MHz',
    brand: 'Corsair',
    price: 1200,
    imageUrl: 'https://picsum.photos/seed/ram4/200/200',
    specs: { type: 'DDR5', capacity_gb: 32, speed_mhz: 6000, modules: 2 },
    compatibilityKey: 'DDR5',
  },
  {
    id: 'ram5',
    category: ComponentCategory.RAM,
    name: 'Crucial Ballistix 8GB (1x8GB) DDR4 3200MHz',
    brand: 'Crucial',
    price: 200,
    imageUrl: 'https://picsum.photos/seed/ram5/200/200',
    specs: { type: 'DDR4', capacity_gb: 8, speed_mhz: 3200, modules: 1 },
    compatibilityKey: 'DDR4',
  },

  // GPUs
  {
    id: 'gpu1',
    category: ComponentCategory.GPU,
    name: 'NVIDIA GeForce RTX 3060 12GB',
    brand: 'NVIDIA',
    price: 2000,
    imageUrl: 'https://picsum.photos/seed/gpu1/200/200',
    specs: { memory_gb: 12, recommended_psu_w: 550 },
  },
  {
    id: 'gpu2',
    category: ComponentCategory.GPU,
    name: 'AMD Radeon RX 6700 XT 12GB',
    brand: 'AMD',
    price: 2500,
    imageUrl: 'https://picsum.photos/seed/gpu2/200/200',
    specs: { memory_gb: 12, recommended_psu_w: 650 },
  },
  {
    id: 'gpu3',
    category: ComponentCategory.GPU,
    name: 'NVIDIA GeForce RTX 4070 12GB',
    brand: 'NVIDIA',
    price: 4000,
    imageUrl: 'https://picsum.photos/seed/gpu3n/200/200',
    specs: { memory_gb: 12, recommended_psu_w: 650 },
  },
  {
    id: 'gpu4',
    category: ComponentCategory.GPU,
    name: 'AMD Radeon RX 7800 XT 16GB',
    brand: 'AMD',
    price: 3800,
    imageUrl: 'https://picsum.photos/seed/gpu4a/200/200',
    specs: { memory_gb: 16, recommended_psu_w: 700 },
  },
  {
    id: 'gpu5',
    category: ComponentCategory.GPU,
    name: 'NVIDIA GeForce GTX 1650 4GB',
    brand: 'NVIDIA',
    price: 900,
    imageUrl: 'https://picsum.photos/seed/gpu5n/200/200',
    specs: { memory_gb: 4, recommended_psu_w: 300 },
  },

  // Storage
  {
    id: 'storage1',
    category: ComponentCategory.STORAGE,
    name: 'Kingston NV2 1TB NVMe PCIe 4.0 SSD',
    brand: 'Kingston',
    price: 450,
    imageUrl: 'https://picsum.photos/seed/storage1/200/200',
    specs: { type: 'NVMe SSD', capacity_tb: 1, interface: 'PCIe 4.0' },
  },
  {
    id: 'storage2',
    category: ComponentCategory.STORAGE,
    name: 'Samsung 970 EVO Plus 2TB NVMe PCIe 3.0 SSD',
    brand: 'Samsung',
    price: 900,
    imageUrl: 'https://picsum.photos/seed/storage2/200/200',
    specs: { type: 'NVMe SSD', capacity_tb: 2, interface: 'PCIe 3.0' },
  },
  {
    id: 'storage3',
    category: ComponentCategory.STORAGE,
    name: 'Western Digital Black SN850X 2TB NVMe PCIe 4.0 SSD',
    brand: 'Western Digital',
    price: 1200,
    imageUrl: 'https://picsum.photos/seed/storage3/200/200',
    specs: { type: 'NVMe SSD', capacity_tb: 2, interface: 'PCIe 4.0', speed_mbps: 7300 },
  },
  {
    id: 'storage4',
    category: ComponentCategory.STORAGE,
    name: 'Crucial MX500 500GB SATA SSD',
    brand: 'Crucial',
    price: 250,
    imageUrl: 'https://picsum.photos/seed/storage4/200/200',
    specs: { type: 'SATA SSD', capacity_gb: 500, interface: 'SATA III' },
  },
  {
    id: 'storage5',
    category: ComponentCategory.STORAGE,
    name: 'Seagate Barracuda 4TB HDD',
    brand: 'Seagate',
    price: 400,
    imageUrl: 'https://picsum.photos/seed/storage5/200/200',
    specs: { type: 'HDD', capacity_tb: 4, interface: 'SATA III', rpm: 5400 },
  },


  // PSUs
  {
    id: 'psu1',
    category: ComponentCategory.PSU,
    name: 'Corsair RM750x 750W 80+ Gold',
    brand: 'Corsair',
    price: 700,
    imageUrl: 'https://picsum.photos/seed/psu1/200/200',
    specs: { wattage_w: 750, efficiency: '80+ Gold', modular: 'Full' },
  },
  {
    id: 'psu2',
    category: ComponentCategory.PSU,
    name: 'Cooler Master MWE 650 Bronze V2',
    brand: 'Cooler Master',
    price: 400,
    imageUrl: 'https://picsum.photos/seed/psu2/200/200',
    specs: { wattage_w: 650, efficiency: '80+ Bronze', modular: 'Non-Modular' },
  },
  {
    id: 'psu3',
    category: ComponentCategory.PSU,
    name: 'Seasonic FOCUS GX-850 850W 80+ Gold',
    brand: 'Seasonic',
    price: 850,
    imageUrl: 'https://picsum.photos/seed/psu3s/200/200',
    specs: { wattage_w: 850, efficiency: '80+ Gold', modular: 'Full' },
  },
  {
    id: 'psu4',
    category: ComponentCategory.PSU,
    name: 'EVGA 550 B5 550W 80+ Bronze',
    brand: 'EVGA',
    price: 350,
    imageUrl: 'https://picsum.photos/seed/psu4e/200/200',
    specs: { wattage_w: 550, efficiency: '80+ Bronze', modular: 'Full' }, // Changed to Full for variety
  },
   {
    id: 'psu5',
    category: ComponentCategory.PSU,
    name: 'Corsair HX1000i 1000W 80+ Platinum',
    brand: 'Corsair',
    price: 1500,
    imageUrl: 'https://picsum.photos/seed/psu5c/200/200',
    specs: { wattage_w: 1000, efficiency: '80+ Platinum', modular: 'Full' },
  },

  // Cases
  {
    id: 'case1',
    category: ComponentCategory.CASE,
    name: 'NZXT H510 Flow',
    brand: 'NZXT',
    price: 500,
    imageUrl: 'https://picsum.photos/seed/case1/200/200',
    specs: { type: 'Mid Tower', color: 'Black', mobo_support: ['ATX', 'Micro-ATX', 'Mini-ITX'], dust_filters: 'Yes' },
  },
  {
    id: 'case2',
    category: ComponentCategory.CASE,
    name: 'Lian Li Lancool II Mesh',
    brand: 'Lian Li',
    price: 650,
    imageUrl: 'https://picsum.photos/seed/case2/200/200',
    specs: { type: 'Mid Tower', color: 'White', mobo_support: ['ATX', 'Micro-ATX', 'Mini-ITX'], dust_filters: 'Yes', airflow: 'High' },
  },
  {
    id: 'case3',
    category: ComponentCategory.CASE,
    name: 'Fractal Design Meshify 2 Compact',
    brand: 'Fractal Design',
    price: 700,
    imageUrl: 'https://picsum.photos/seed/case3f/200/200',
    specs: { type: 'Mid Tower', color: 'Black', mobo_support: ['ATX', 'Micro-ATX', 'Mini-ITX'], dust_filters: 'Full', airflow: 'High' },
  },
  {
    id: 'case4',
    category: ComponentCategory.CASE,
    name: 'Cooler Master MasterBox Q300L',
    brand: 'Cooler Master',
    price: 300,
    imageUrl: 'https://picsum.photos/seed/case4cm/200/200',
    specs: { type: 'Micro-ATX Tower', color: 'Black', mobo_support: ['Micro-ATX', 'Mini-ITX'], dust_filters: 'Top, Bottom' },
  },
  {
    id: 'case5',
    category: ComponentCategory.CASE,
    name: 'Corsair 7000D Airflow',
    brand: 'Corsair',
    price: 1200,
    imageUrl: 'https://picsum.photos/seed/case5c/200/200',
    specs: { type: 'Full Tower', color: 'Black', mobo_support: ['E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX'], dust_filters: 'Full', airflow: 'Extreme' },
  },


  // Coolers
  {
    id: 'cooler1',
    category: ComponentCategory.COOLER,
    name: 'Cooler Master Hyper 212 Black Edition',
    brand: 'Cooler Master',
    price: 250,
    imageUrl: 'https://picsum.photos/seed/cooler1/200/200',
    specs: { type: 'Air Cooler', tdp_rating_w: 150, socket_support: ['AM4', 'AM5', 'LGA1700', 'LGA1200'] },
  },
  {
    id: 'cooler2',
    category: ComponentCategory.COOLER,
    name: 'Noctua NH-D15',
    brand: 'Noctua',
    price: 600,
    imageUrl: 'https://picsum.photos/seed/cooler2/200/200',
    specs: { type: 'Air Cooler', tdp_rating_w: 220, socket_support: ['AM4', 'AM5', 'LGA1700', 'LGA1200'], noise_level: 'Low' },
  },
  {
    id: 'cooler3',
    category: ComponentCategory.COOLER,
    name: 'Arctic Liquid Freezer II 240',
    brand: 'Arctic',
    price: 700,
    imageUrl: 'https://picsum.photos/seed/cooler3a/200/200',
    specs: { type: 'AIO Liquid Cooler', radiator_size_mm: 240, tdp_rating_w: 250, socket_support: ['AM4', 'AM5', 'LGA1700', 'LGA1200'] },
  },
  {
    id: 'cooler4',
    category: ComponentCategory.COOLER,
    name: 'Noctua NH-L9i',
    brand: 'Noctua',
    price: 300,
    imageUrl: 'https://picsum.photos/seed/cooler4n/200/200',
    specs: { type: 'Low Profile Air Cooler', tdp_rating_w: 95, socket_support: ['LGA1700', 'LGA1200', 'LGA115x'], noise_level: 'Very Low' },
  },
  {
    id: 'cooler5',
    category: ComponentCategory.COOLER,
    name: 'Deepcool AK620',
    brand: 'Deepcool',
    price: 450,
    imageUrl: 'https://picsum.photos/seed/cooler5d/200/200',
    specs: { type: 'Air Cooler', tdp_rating_w: 260, socket_support: ['AM4', 'AM5', 'LGA1700', 'LGA1200', 'LGA2066'], noise_level: 'Moderate' },
  },
];
