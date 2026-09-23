export interface IMemoryUsage {
  rssMB: number;
  heapUsedMB: number;
}

export interface IHealthData {
  service: string;
  status: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  database: string;
  memory: IMemoryUsage;
}

export interface IReadinessData {
  ready: boolean;
  database: string;
  timestamp: string;
}
