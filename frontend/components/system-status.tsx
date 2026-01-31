interface SystemStatusProps {
  lastUpdate?: Date;
  apiStatus?: 'connected' | 'disconnected' | 'error';
  dbStatus?: 'operational' | 'degraded' | 'error';
  showLastUpdate?: boolean;
  className?: string;
}

export default function SystemStatus({
  lastUpdate = new Date(),
  apiStatus = 'connected',
  dbStatus = 'operational',
  showLastUpdate = true,
  className = ''
}: SystemStatusProps) {
  const statusColors = {
    connected: 'bg-green-500',
    disconnected: 'bg-yellow-500',
    error: 'bg-red-500',
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500'
  };

  const statusText = {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    error: 'Error',
    operational: 'Operativa',
    degraded: 'Degradada'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-300 mb-4">
        Estado del sistema
      </h2>
      
      <div className="space-y-2">
        {/* Backend API status */}
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <div 
            className={`w-3 h-3 rounded-full mr-2 ${
              statusColors[apiStatus] || 'bg-gray-400'
            }`}
          ></div>
          <span>
            Backend API: {statusText[apiStatus] || 'Desconocido'}
          </span>
        </div>

        {/* DB status */}
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <div 
            className={`w-3 h-3 rounded-full mr-2 ${
              statusColors[dbStatus] || 'bg-gray-400'
            }`}
          ></div>
          <span>
            Base de datos: {statusText[dbStatus] || 'Desconocido'}
          </span>
        </div>

        {/* Last update */}
        {showLastUpdate && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
          </div>
        )}
      </div>
    </div>
  );
}