import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Camera, Save, ShieldCheck, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // État local pour le formulaire
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: ''
  });

  // Synchronisation du formulaire quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  // --- LOGIQUE D'URL DYNAMIQUE ---
  const getAvatarUrl = (url) => {
    if (!url) return null;
    // Si c'est déjà une URL Cloudinary (commence par http), on l'utilise directement
    if (url.startsWith('http')) return url;
    // Sinon, on utilise l'URL du backend définie dans tes variables d'environnement
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${url}`;
  };

  // Fonction pour mettre à jour le context et le localStorage
  const updateUserContext = (newData) => {
    setUser(newData);
    localStorage.setItem('user', JSON.stringify(newData));
  };

  // Mise à jour des informations textuelles (Bio, Username, Email)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', formData);
      updateUserContext(res.data);
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Erreur lors de la mise à jour.");
    } finally { 
      setLoading(false); 
    }
  };

  // Mise à jour de la photo de profil (Cloudinary via Backend)
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading("Envoi de la photo vers le cloud...");
    const data = new FormData();
    data.append('avatar', file);

    try {
      const res = await api.post('/auth/profile/avatar', data);
      updateUserContext(res.data); // res.data contient maintenant l'URL https://res.cloudinary...
      toast.success("Nouvelle photo enregistrée !", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'upload de la photo", { id: loadingToast });
    }
  };

  if (!user) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header (Bandeau décoratif) */}
        <div className="bg-gray-900 h-32 relative">
          <div className="absolute -bottom-12 left-10">
            <div className="relative group">
              {/* Cercle Avatar Corrigé */}
              <div className="w-24 h-24 bg-white border-4 border-white rounded-3xl flex items-center justify-center overflow-hidden shadow-xl">
                {user.avatar_url ? (
                   <img 
                    src={getAvatarUrl(user.avatar_url)} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                   />
                ) : (
                   <div className="w-full h-full bg-primary flex items-center justify-center">
                      <span className="text-white text-3xl font-black">{user.username[0].toUpperCase()}</span>
                   </div>
                )}
              </div>
              
              {/* Bouton Upload Photo */}
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-xl shadow-lg text-gray-600 hover:text-primary transition cursor-pointer hover:scale-110 border border-gray-100">
                <Camera size={18} />
                <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-16 p-10">
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.username}</h1>
              <div className="flex items-center mt-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase rounded-full">
                  {user.role === 'host' ? 'Hôte NestFlow' : 'Voyageur'}
                </span>
              </div>
              <p className="text-gray-500 font-medium mt-4 max-w-md">
                {user.bio || <span className="italic opacity-50 font-normal">Aucune bio renseignée. Cliquez sur modifier pour vous présenter !</span>}
              </p>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-8 py-3 rounded-full font-bold transition-all ${isEditing ? 'bg-gray-100 text-gray-600' : 'bg-gray-900 text-white shadow-lg hover:bg-gray-800'}`}
            >
              {isEditing ? 'Annuler' : 'Modifier le profil'}
            </button>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <label className="block">
                <span className="text-xs font-black uppercase text-gray-400 ml-1 mb-2 block">Nom d'utilisateur</span>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none disabled:opacity-60 font-bold transition-all"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase text-gray-400 ml-1 mb-2 block">Adresse Email</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    disabled={!isEditing}
                    type="email" 
                    className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none disabled:opacity-60 font-bold transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block">
                <span className="text-xs font-black uppercase text-gray-400 ml-1 mb-2 block">Ma Biographie</span>
                <textarea 
                  disabled={!isEditing}
                  rows="6"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white outline-none disabled:opacity-60 font-medium transition-all resize-none"
                  placeholder="Partagez vos passions ou vos attentes en tant qu'hôte/voyageur..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </label>
            </div>

            {isEditing && (
              <div className="md:col-span-2 pt-6">
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center active:scale-95 disabled:bg-gray-300"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save className="mr-3" size={24} /> Enregistrer les modifications</>}
                </button>
              </div>
            )}
          </form>

          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center text-sm font-bold text-gray-400">
              <ShieldCheck className="mr-2 text-green-500" size={20} /> Compte vérifié NestFlow
            </div>
            <p className="text-xs text-gray-400 font-medium">Membre depuis {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;