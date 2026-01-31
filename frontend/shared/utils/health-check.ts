import { fetchApi } from "@/shared/utils/api";

interface HealthStatus {
  api: 'connected' | 'disconnected' | 'error';
  database: 'connected' | 'disconnected' | 'error';
  lastCheck: Date;
}

class HealthCheckService {
  private checkInterval: number = 30000;
  private currentStatus: HealthStatus = {
    api: 'disconnected',
    database: 'disconnected',
    lastCheck: new Date()
  };
  private listeners: Array<(status: HealthStatus) => void> = [];

  constructor() {
    this.startMonitoring();
  }

  async checkBackend(): Promise<'connected' | 'disconnected' | 'error'> {
    try {
      const data = await fetchApi('/health');
      
      console.log('Backend health response:', data);
      
      if (data && data.status === 'Healthy') {
        return 'connected';
      }
      return 'disconnected';
    } catch (error) {
      console.error('Backend health check failed:', error);
      return 'error';
    }
  }

  async checkDatabase(): Promise<'connected' | 'disconnected' | 'error'> {
    try {
      const data = await fetchApi('/health/database');
      
      console.log('Database health response:', data);
      
      if (data && data.connected) {
        return 'connected';
      }
      return 'disconnected';
    } catch (error) {
      console.error('Database health check failed:', error);
      return 'error';
    }
  }

  async performCheck() {
    try {
      console.log('Performing health check...');
      
      const [apiStatus, dbStatus] = await Promise.all([
        this.checkBackend(),
        this.checkDatabase()
      ]);

      console.log('Health check results:', { apiStatus, dbStatus });

      this.currentStatus = {
        api: apiStatus,
        database: dbStatus,
        lastCheck: new Date()
      };

      this.notifyListeners();
    } catch (error) {
      console.error('Health check failed:', error);
      this.currentStatus = {
        api: 'error',
        database: 'error',
        lastCheck: new Date()
      };
      this.notifyListeners();
    }
  }

  startMonitoring() {
    this.performCheck();
    setInterval(() => this.performCheck(), this.checkInterval);
  }

  subscribe(listener: (status: HealthStatus) => void) {
    this.listeners.push(listener);
    listener(this.currentStatus);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentStatus));
  }

  getCurrentStatus(): HealthStatus {
    return this.currentStatus;
  }
}

export const healthCheckService = new HealthCheckService();