// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
// 1. L'import est déjà là, c'est parfait
import { Toaster } from 'react-hot-toast'; 

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetails from './pages/PropertyDetails';
import AddProperty from './pages/AddProperty';
import MyTrips from './pages/MyTrips'; 
import HostDashboard from './pages/HostDashboard';
import AllProperties from './pages/AllProperties';
import Chat from './pages/Chat'; 
import Inbox from './pages/Inbox';
import EditProperty from './pages/EditProperty';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          
          {/* --- 2. CONFIGURATION DU SYSTÈME D'ALERTES (TOAST) --- */}
          <Toaster 
            position="top-center" 
            reverseOrder={false} 
            toastOptions={{
              // Durée par défaut : 4 secondes
              duration: 4000,
              // Style par défaut (pour les messages simples)
              style: {
                background: '#1F2937', // Gris foncé
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '600'
              },
              // Style spécifique pour les SUCCÈS (toast.success)
              success: {
                style: {
                  background: 'white',
                  color: '#1F2937',
                  border: '1px solid #E5E7EB',
                },
                iconTheme: {
                  primary: '#FF385C', // Ta couleur rose/rouge principale
                  secondary: 'white',
                },
              },
              // Style spécifique pour les ERREURS (toast.error)
              error: {
                style: {
                  background: '#FEF2F2', // Fond rouge très clair
                  color: '#991B1B', // Texte rouge foncé
                  border: '1px solid #FECACA',
                },
              },
            }}
          />

          {/* La Navbar reste fixe en haut sur toutes les pages */}
          <Navbar /> 
          
          {/* Zone de contenu principale */}
          <main className="flex-grow">
            <Routes>
              {/* --- 1. Routes Publiques (Accessibles à tous) --- */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/properties" element={<AllProperties />} />

              {/* --- 2. Routes Utilisateur Connecté (Voyageur) --- */}
              <Route path="/my-trips" element={<MyTrips />} />
              <Route path="/profile" element={<Profile />} />

              {/* Route pour la boîte de réception (Liste des discussions) */}
              <Route path="/inbox" element={<Inbox />} />
              
              {/* Route pour le chat direct (Discussion précise sur un bien) */}
              <Route path="/chat/:propertyId/:contactId" element={<Chat />} />

              {/* --- 3. Routes Hôtes (Création et Gestion) --- */}
              <Route path="/host/add" element={<AddProperty />} />
              <Route path="/host/dashboard" element={<HostDashboard />} />
              <Route path="/host/edit/:id" element={<EditProperty />} />

              {/* --- 4. Gestion 404 (Redirection vers Accueil si page inconnue) --- */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;