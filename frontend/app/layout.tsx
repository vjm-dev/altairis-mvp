import './globals.css';

export const metadata = {
  title: 'Altairis Backoffice - Demo',
  description: 'Demo del sistema de gestión hotelera',
};

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
            <h1 className="text-2xl font-bold text-blue-700">
              Altairis Backoffice - DEMO
            </h1>
            <p className="text-gray-600">Gestión hotelera B2B</p>
          </div>
          
          <nav className="bg-blue-700 text-white">
            <div className="container mx-auto px-4">
              <div className="flex space-x-6 py-3">
                <a href="/" className="hover:bg-blue-600 px-3 py-2 rounded">
                  Dashboard
                </a>
                <a href="/hotels" className="hover:bg-blue-600 px-3 py-2 rounded">
                  Hoteles
                </a>
                <a href="/inventory" className="hover:bg-blue-600 px-3 py-2 rounded">
                  Disponibilidad
                </a>
                <a href="/bookings" className="hover:bg-blue-600 px-3 py-2 rounded">
                  Reservas
                </a>
              </div>
            </div>
          </nav>
        </header>
        
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
        
        <footer className="bg-gray-800 text-white py-4 mt-8">
          <div className="container mx-auto px-4 text-center text-sm">
            <p>Viajes Altairis © {new Date().getFullYear()}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}