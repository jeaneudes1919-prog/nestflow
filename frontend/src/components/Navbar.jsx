import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// Ajout de Menu et X pour le burger menu
import { 
  LogOut, MapPin, LayoutDashboard, PlusCircle, 
  Briefcase, MessageSquare, Menu, X, User 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, unreadCount } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fonction pour fermer le menu quand on clique sur un lien
  const closeMenu = () => setIsMobileMenuOpen(false);

  // Redirection logout
  const handleLogout = () => {
    closeMenu();
    logout();
  };

  // --- LOGIQUE D'ADAPTATION DE L'URL IMAGE ---
  const getAvatarUrl = (url) => {
    if (!url) return null;
    // Si c'est déjà une URL Cloudinary (commence par http), on l'utilise direct
    if (url.startsWith('http')) return url;
    // Sinon, c'est un ancien fichier local, on utilise l'URL de ton API Render
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${url}`;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* --- LOGO --- */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary font-bold text-2xl tracking-tighter">
              <MapPin className="mr-1" strokeWidth={3} /> NestFlow
            </Link>
          </div>

          {/* --- MENU DESKTOP (Caché sur mobile) --- */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {/* Lien Profil (Nom + Avatar) */}
                <Link to="/profile" className="flex items-center group cursor-pointer">
                   <div className="flex flex-col items-end leading-tight mr-3">
                    <span className="text-gray-900 font-bold text-sm group-hover:text-primary transition">{user.username}</span>
                    <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest">
                      {user.role === 'host' ? 'Hôte' : 'Voyageur'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-transparent group-hover:border-primary overflow-hidden transition">
                    {user.avatar_url ? (
                      <img src={getAvatarUrl(user.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Onglet Messages */}
                <Link to="/inbox" className="relative text-gray-600 hover:text-primary transition" title="Messages">
                  <MessageSquare size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Menu Hôte */}
                {user.role === 'host' && (
                  <>
                    <Link to="/host/dashboard" className="text-gray-600 hover:text-primary transition" title="Dashboard">
                      <LayoutDashboard size={20} />
                    </Link>
                    <Link to="/host/add" className="flex items-center bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 text-xs font-bold transition shadow-lg">
                      <PlusCircle size={16} className="mr-2"/> Louer
                    </Link>
                  </>
                )}

                {/* Menu Voyageur */}
                <Link to="/my-trips" className="text-gray-600 hover:text-primary transition" title="Mes Voyages">
                  <Briefcase size={20} />
                </Link>

                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-primary font-bold text-sm">Connexion</Link>
                <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-full hover:bg-rose-600 transition shadow-md text-sm font-bold">Inscription</Link>
              </div>
            )}
          </div>

          {/* --- BOUTON BURGER MOBILE --- */}
          <div className="md:hidden flex items-center space-x-4">
            {user && (
              <Link to="/inbox" className="relative text-gray-600">
                <MessageSquare size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-primary focus:outline-none">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU MOBILE --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl animate-fade-in-down">
          <div className="px-4 pt-4 pb-6 space-y-2">
            
            {user ? (
              <>
                <Link to="/profile" onClick={closeMenu} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-4 border border-gray-100">
                   <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      {user.avatar_url ? (
                        <img src={getAvatarUrl(user.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                   </div>
                   <div>
                     <p className="font-bold text-gray-900">{user.username}</p>
                     <p className="text-xs text-gray-500">Voir mon profil</p>
                   </div>
                </Link>

                {user.role === 'host' && (
                  <>
                    <Link to="/host/dashboard" onClick={closeMenu} className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                      <LayoutDashboard size={20} /> <span>Tableau de bord Hôte</span>
                    </Link>
                    <Link to="/host/add" onClick={closeMenu} className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                      <PlusCircle size={20} /> <span>Mettre en location</span>
                    </Link>
                  </>
                )}

                <Link to="/my-trips" onClick={closeMenu} className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                  <Briefcase size={20} /> <span>Mes Voyages</span>
                </Link>

                <Link to="/inbox" onClick={closeMenu} className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                  <MessageSquare size={20} /> 
                  <span className="flex-1">Messages</span>
                  {unreadCount > 0 && <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                </Link>

                <div className="border-t border-gray-100 my-2"></div>

                <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-lg font-bold">
                  <LogOut size={20} /> <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3 mt-2">
                <Link to="/login" onClick={closeMenu} className="w-full text-center py-3 font-bold text-gray-700 bg-gray-100 rounded-xl">Connexion</Link>
                <Link to="/register" onClick={closeMenu} className="w-full text-center py-3 font-bold text-white bg-primary rounded-xl shadow-md">Inscription</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;