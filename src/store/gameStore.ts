import { create } from 'zustand';
import * as THREE from 'three';

export interface PlanetData {
  id: string;
  name: string;
  title: string;
  description: string;
  details: string[];
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  hasRings?: boolean;
  ringData?: string[];
}

export const PLANETS: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    title: 'About Me',
    description: 'Aspiring DevOps Engineer with expertise in cloud computing, automation, and CI/CD pipelines.',
    details: [
      'Megh Vyas',
      'DevOps Engineer',
      'Cloud & Infrastructure Specialist',
      'Bangalore, Karnataka',
      'Passionate about scalable systems & automation'
    ],
    color: '#8C7853',
    size: 2.5,
    orbitRadius: 18,
    orbitSpeed: 0.003,
  },
  {
    id: 'venus',
    name: 'Venus',
    title: 'Tech Stack',
    description: 'Modern technologies powering scalable infrastructure and automation.',
    details: [
      'Python & Node.js',
      'Docker & Container Orchestration',
      'AWS, GCP, Azure',
      'Kubernetes & Terraform',
      'TypeScript & JavaScript',
      'PostgreSQL & MongoDB'
    ],
    color: '#E6C35C',
    size: 3.5,
    orbitRadius: 28,
    orbitSpeed: 0.0025,
  },
  {
    id: 'earth',
    name: 'Earth',
    title: 'Key Projects',
    description: 'DevOps and infrastructure projects demonstrating automation expertise.',
    details: [
      'ZYPHRON - Automated Deployment Platform',
      'Web3 Migration Tool for IPFS',
      'Metrics-Health-Tracker Dashboard',
      'CI/CD Pipeline Automation',
      'Multi-Cloud Orchestration'
    ],
    color: '#4A90D9',
    size: 3.8,
    orbitRadius: 40,
    orbitSpeed: 0.002,
  },
  {
    id: 'mars',
    name: 'Mars',
    title: 'Professional Experience',
    description: 'Journey through cloud computing and DevOps engineering.',
    details: [
      'Salesforce Developer/Admin Intern - Codiot Technologies (Jun-Jul 2025)',
      'Apex & LWC Development',
      'Cloud Deployment Experience',
      'System Management & Automation',
      'Infrastructure Orchestration'
    ],
    color: '#C1440E',
    size: 3.0,
    orbitRadius: 55,
    orbitSpeed: 0.0015,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    title: 'Education & Timeline',
    description: 'Academic foundation and career milestones in technology.',
    details: [
      'BCA Student - IFIM College, Bangalore (2023-2026)',
      'Salesforce Trailhead Certifications (Admin & Developer)',
      'Infosys Springboard - Python & Full Stack',
      '2025 - Salesforce Dev/Admin Intern at Codiot',
      'Continuous Learning & Growth'
    ],
    color: '#D4A574',
    size: 8,
    orbitRadius: 80,
    orbitSpeed: 0.001,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    title: 'Skills & Expertise',
    description: 'Core competencies and technical proficiencies.',
    details: [
      'Python, Node.js, JavaScript',
      'Docker, Kubernetes, Terraform',
      'AWS, GCP, Azure Platforms',
      'CI/CD Pipeline Automation',
      'Linux & Git Version Control'
    ],
    color: '#C9A227',
    size: 7,
    orbitRadius: 110,
    orbitSpeed: 0.0008,
    hasRings: true,
    ringData: [
      'Infrastructure as Code',
      'Multi-Cloud Orchestration',
      'System Management',
      'Problem Solving',
      'Quick Learner'
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    title: 'Contact & Connect',
    description: 'Let\'s collaborate and build scalable solutions together.',
    details: [
      'Email: megh.vyas@yahoo.com',
      'Phone: +91 8866548854',
      'LinkedIn: /in/meghvyas',
      'GitHub: @MeghVyas3132',
      'Location: Bangalore, Karnataka 560100'
    ],
    color: '#4B70DD',
    size: 5,
    orbitRadius: 140,
    orbitSpeed: 0.0005,
  },
];

interface GameState {
  isLoading: boolean;
  loadingProgress: number;
  selectedPlanet: PlanetData | null;
  isWarping: boolean;
  warpTarget: THREE.Vector3 | null;
  shipPosition: THREE.Vector3;
  shipRotation: THREE.Euler;
  showControls: boolean;
  isMobile: boolean;
  
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setSelectedPlanet: (planet: PlanetData | null) => void;
  startWarp: (target: THREE.Vector3) => void;
  endWarp: () => void;
  updateShipPosition: (position: THREE.Vector3) => void;
  updateShipRotation: (rotation: THREE.Euler) => void;
  setShowControls: (show: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isLoading: true,
  loadingProgress: 0,
  selectedPlanet: null,
  isWarping: false,
  warpTarget: null,
  shipPosition: new THREE.Vector3(0, 2, 50),
  shipRotation: new THREE.Euler(0, Math.PI, 0),
  showControls: true,
  isMobile: false,
  
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
  startWarp: (target) => set({ isWarping: true, warpTarget: target }),
  endWarp: () => set({ isWarping: false, warpTarget: null }),
  updateShipPosition: (position) => set({ shipPosition: position }),
  updateShipRotation: (rotation) => set({ shipRotation: rotation }),
  setShowControls: (show) => set({ showControls: show }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
}));
