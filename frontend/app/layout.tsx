import { HOTEL_SYS_NAME, METADATA, COPYRIGHT_BANNER, SERVER_URL } from '@/data/content';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-blue-700">
                  {HOTEL_SYS_NAME} - DEMO
                </h1>
                <p className="text-gray-600">{METADATA.description}</p>
              </div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
          
          <nav className="bg-blue-700 text-white">
            <div className="container mx-auto px-4">
              <div className="flex space-x-6 py-3">
                <a href="/" className="hover:bg-blue-600 px-3 py-2 rounded flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </a>
                <a href="/hotels" className="hover:bg-blue-600 px-3 py-2 rounded flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Hoteles
                </a>
                <a href="/inventory" className="hover:bg-blue-600 px-3 py-2 rounded flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Disponibilidad
                </a>
                <a href="/bookings" className="hover:bg-blue-600 px-3 py-2 rounded flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Reservas
                </a>
              </div>
            </div>
          </nav>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-gray-800 text-white py-6 mt-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{COPYRIGHT_BANNER.title}</p>
                <p className="text-sm text-gray-400 mt-1">{COPYRIGHT_BANNER.description}</p>
              </div>
              <div className="text-sm text-gray-400">
                <p>Backend: {SERVER_URL.backend}</p>
                <p>Frontend: {SERVER_URL.frontend}</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}