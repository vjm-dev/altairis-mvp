export interface HealthStatus {
  api: 'connected' | 'disconnected' | 'error';
  database: 'connected' | 'disconnected' | 'error';
  lastCheck: Date;
}