'use client';

import { useEffect, useState } from 'react';
import { healthCheckService } from '@/shared/utils/health-check';

interface SystemStatusProps {
  autoRefresh?: boolean;
  showLastUpdate?: boolean;
  className?: string;
}

export default function SystemStatus({
  autoRefresh = true,
  showLastUpdate = true,
  className = ''
}: SystemStatusProps) {
  const [status, setStatus] = useState(() => healthCheckService.getCurrentStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (autoRefresh) {
      const unsubscribe = healthCheckService.subscribe((newStatus) => {
        setStatus(newStatus);
      });
      return unsubscribe;
    }
  }, [autoRefresh]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await healthCheckService.performCheck();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const statusColors = {
    connected: 'bg-green-500',
    disconnected: 'bg-yellow-500',
    error: 'bg-red-500',
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    loading: 'bg-gray-400 animate-pulse'
  };

  const statusText = {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    error: 'Error',
    operational: 'Operativa',
    degraded: 'Degradada',
    loading: 'Verificando...'
  };

  const getStatusIcon = (type: 'api' | 'database') => {
    const currentStatus = type === 'api' ? status.api : status.database;
    
    if (isRefreshing) return statusColors.loading;
    
    switch (currentStatus) {
      case 'connected':
        return 'bg-green-500 animate-pulse';
      case 'disconnected':
        return 'bg-yellow-500 animate-pulse';
      case 'error':
        return 'bg-red-500 animate-pulse';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-300">
          Estado del sistema
        </h2>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
        >
          <svg 
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          {isRefreshing ? 'Verificando...' : 'Actualizar'}
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Backend API status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full mr-3 ${getStatusIcon('api')}`}></div>
              {status.api === 'connected' && (
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
              )}
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Backend API
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.api === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            status.api === 'disconnected' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {statusText[status.api] || 'Desconocido'}
          </span>
        </div>

        {/* DB status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full mr-3 ${getStatusIcon('database')}`}></div>
              {status.database === 'connected' && (
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
              )}
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Base de datos
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.database === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            status.database === 'disconnected' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {statusText[status.database] || 'Desconocido'}
          </span>
        </div>

        {/* Last update */}
        {showLastUpdate && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Última verificación
              </span>
              <span className="text-gray-800 dark:text-gray-300 font-mono">
                {status.lastCheck.toLocaleTimeString('es-ES')}
              </span>
            </div>
            
            {/* Status summary */}
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {status.api === 'connected' && status.database === 'connected' ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Todos los sistemas funcionan correctamente
                </div>
              ) : (
                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Hay problemas con algunos servicios
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}