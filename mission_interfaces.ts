/**
 * @file mission_interfaces.ts
 * @description Programmatic enforcement of the Cadillac F1 Hub Mission Brief.
 * Translates Natural Language directives from index.html into strict technical contracts.
 */

/**
 * Valid Telemetry Providers as identified in the Mission Brief.
 */
export type TelemetryProvider = 'OpenF1' | 'FastF1' | 'Ergast' | 'F1-Telemetry-Client';

/**
 * Design Tokens for the Cadillac V-Series aesthetic.
 */
export interface BrandingConfig {
  primaryColor: '#dc2626'; // V-Red
  accentColors: {
    obsidian: '#000000';
    silver: '#C0C0C0';
    vBlue: '#2563eb';
    vYellow: '#eab308';
  };
  typography: 'Inter, sans-serif';
  theme: 'dark' | 'light';
}

/**
 * Radar metrics for evaluating API capability.
 */
export interface PerformanceMetrics {
  liveLatency: number;    // 0-100
  dataDepth: number;      // 0-100
  historicalRange: number; // 0-100
  apiUptime: number;      // 0-100
}

/**
 * Contract for any Telemetry Service implementation.
 */
export interface ITelemetryService {
  readonly provider: TelemetryProvider;
  readonly goal: string;
  readonly implementationPlan: string;
  metrics: PerformanceMetrics;
  
  /** * @requirement Defensive Programming
   * Handles API failures without crashing the UI.
   */
  handleConnectionGuard(): void;
  
  /** * @requirement Stale Data Logic
   * Checks if data age exceeds the 30s threshold defined in the brief.
   */
  isDataStale(lastUpdate: Date): boolean;
}

/**
 * Data structure for the High-Fidelity Interactive Lab (Plotly).
 */
export interface TelemetryStream {
  timestamp: number[];
  speedKmh: number[];
  throttlePercentage: number[];
  drsActive: boolean[];
}

/**
 * Defines the Execution Protocol for the Claude CLI Agent.
 */
export interface ExecutionPhase {
  phaseNumber: 1 | 2 | 3 | 4;
  title: string;
  terminalCommand: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  
  /** * @requirement Accuracy & Robustness
   * Must pass these checks before moving to the next phase.
   */
  validationCriteria: string[];
}

/**
 * The Global Mission State.
 * Reference this to mitigate LLM memory drift.
 */
export interface F1HubMissionProfile {
  appTitle: "Cadillac F1 Hub";
  version: "1.1.0-rigor";
  branding: BrandingConfig;
  activeServices: ITelemetryService[];
  executionProtocol: ExecutionPhase[];
  
  /**
   * @requirement Technical Requirements
   * Enforcement of specific constraints from the Brief.
   */
  constraints: {
    noSVG: true;
    noMermaid: true;
    useTailwind: true;
    usePlotly: true;
    mobileFirst: true;
  };
}