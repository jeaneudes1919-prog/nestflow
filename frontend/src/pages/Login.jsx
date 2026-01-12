import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
// Imports Premium
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, ArrowRight, MapPin } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Petit toast de chargement
    const loadingToast = toast.loading("Connexion en cours...");

    try {
      await login(formData.email, formData.password);
      
      toast.success("Ravi de vous revoir ! 👋", { id: loadingToast });
      navigate('/'); 
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email ou mot de passe incorrect', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* CÔTÉ GAUCHE : FORMULAIRE */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20 py-12 relative">
        
        {/* Logo Mobile */}
        <div className="flex items-center text-primary font-black text-2xl mb-12 md:hidden">
            <MapPin className="mr-2" /> NestFlow
        </div>

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Bon retour !</h1>
          <p className="text-gray-500 mb-10">Entrez vos coordonnées pour accéder à votre espace.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-400 ml-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
                    <input
                        type="email"
                        placeholder="exemple@email.com"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700 transition"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-400 ml-1">Mot de passe</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-4 text-gray-300" size={20} />
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700 transition"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />
                </div>
                <div className="text-right">
                    <a href="#" className="text-xs font-bold text-gray-400 hover:text-primary transition">Mot de passe oublié ?</a>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-rose-600 transition flex items-center justify-center active:scale-[0.98]"
            >
                {loading ? <Loader2 className="animate-spin" /> : <>Se connecter <ArrowRight size={20} className="ml-2" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 font-medium">
            Pas encore de compte ? <Link to="/register" className="text-primary font-bold hover:underline">Créer un compte</Link>
          </p>
        </div>

        {/* Footer simple */}
        <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-300 font-medium">
            © 2025 NestFlow Inc.
        </div>
      </div>

      {/* CÔTÉ DROIT : IMAGE (Caché sur mobile) */}
      <div className="hidden md:block md:w-1/2 bg-gray-900 relative overflow-hidden">
        <img 
            src="https://images.unsplash.com/photo-1600596542815-e32c21596211?auto=format&fit=crop&w=1600&q=80" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt="Login Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute bottom-20 left-12 right-12 text-white">
            <h2 className="text-5xl font-black mb-6 leading-tight">La beauté du voyage,<br/>le confort de la maison.</h2>
            <div className="flex items-center text-yellow-400 font-bold">
                ★★★★★ <span className="text-white ml-2 text-sm font-medium">Rejoint par +10,000 voyageurs</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;