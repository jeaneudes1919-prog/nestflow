import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Loader2, Home, Briefcase, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'guest' });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Création du compte...");

    try {
      await register(formData);
      toast.success("Bienvenue sur NestFlow ! 🚀", { id: loadingToast });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row">
        
        {/* IMAGE GAUCHE */}
        <div className="md:w-5/12 bg-primary relative overflow-hidden hidden md:block">
            <img 
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
            />
            <div className="relative z-10 p-12 text-white flex flex-col h-full justify-between">
                <div>
                    <h2 className="text-4xl font-black mb-4">Rejoignez l'aventure.</h2>
                    <p className="opacity-90 text-lg">Débloquez un monde de possibilités et d'expériences uniques.</p>
                </div>
                <div className="space-y-4 font-bold text-sm">
                    <div className="flex items-center"><CheckCircle size={18} className="mr-3"/> Réservation instantanée</div>
                    <div className="flex items-center"><CheckCircle size={18} className="mr-3"/> Paiements sécurisés</div>
                    <div className="flex items-center"><CheckCircle size={18} className="mr-3"/> Support 24/7</div>
                </div>
            </div>
        </div>

        {/* FORMULAIRE DROITE */}
        <div className="md:w-7/12 p-8 md:p-16">
            <h1 className="text-3xl font-black text-gray-900 mb-8">Créer un compte</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Inputs */}
                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-4 text-gray-300" size={20} />
                        <input
                            type="text" placeholder="Nom d'utilisateur" required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700"
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
                        <input
                            type="email" placeholder="Email" required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 text-gray-300" size={20} />
                        <input
                            type="password" placeholder="Mot de passe" required
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                </div>

                {/* SÉLECTION RÔLE STYLE "CARDS" */}
                <div>
                    <label className="text-xs font-black uppercase text-gray-400 ml-1 mb-2 block">Je veux être :</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => setFormData({...formData, role: 'guest'})}
                            className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${formData.role === 'guest' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                        >
                            <Briefcase size={24} className="mb-2" />
                            <span className="font-bold text-sm">Voyageur</span>
                        </div>
                        <div 
                            onClick={() => setFormData({...formData, role: 'host'})}
                            className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${formData.role === 'host' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}
                        >
                            <Home size={24} className="mb-2" />
                            <span className="font-bold text-sm">Hôte</span>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-rose-600 transition flex items-center justify-center active:scale-[0.98]">
                    {loading ? <Loader2 className="animate-spin" /> : "S'inscrire"}
                </button>
            </form>

            <p className="mt-8 text-center text-gray-500 font-medium">
                Déjà membre ? <Link to="/login" className="text-primary font-bold hover:underline">Connexion</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;