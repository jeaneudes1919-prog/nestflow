import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
// 1. IMPORT DU TOAST
import toast from 'react-hot-toast';
import { User, Mail, Camera, Save, ShieldCheck, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  // Fonction utilitaire pour mettre à jour le context + localStorage
  const updateUserContext = (newData) => {
    setUser(newData);
    localStorage.setItem('user', JSON.stringify(newData));
  };

  // Gestion de la modification texte
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', formData);
      
      updateUserContext(res.data);
      setIsEditing(false);
      
      // SUCCÈS
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      console.error(err);
      // ERREUR
      toast.error(err.response?.data?.error || "Erreur lors de la mise à jour.");
    } finally { 
      setLoading(false); 
    }
  };

  // Gestion de l'upload d'avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Petit toast de chargement pendant l'upload
    const loadingToast = toast.loading("Envoi de la photo...");

    const data = new FormData();
    data.append('avatar', file);

    try {
      const res = await api.post('/auth/profile/avatar', data);
      updateUserContext(res.data);
      
      // On transforme le toast de chargement en succès
      toast.success("Nouvelle photo de profil enregistrée !", { id: loadingToast });
    } catch (err) {
      // Ou en erreur
      toast.error("Erreur lors de l'upload de la photo", { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header (Bandeau noir) */}
        <div className="bg-gray-900 h-32 relative">
          <div className="absolute -bottom-12 left-10">
            <div className="relative group">
              {/* Cercle Avatar */}
              <div className="w-24 h-24 bg-primary border-4 border-white rounded-3xl flex items-center justify-center overflow-hidden shadow-xl bg-white">
                {user.avatar_url ? (
                   <img src={`http://localhost:5000${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   <span className="text-gray-900 text-3xl font-black">{user.username[0].toUpperCase()}</span>
                )}
              </div>
              
              {/* Bouton Upload (Appareil photo) */}
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-xl shadow-lg text-gray-600 hover:text-primary transition cursor-pointer hover:scale-110">
                <Camera size={16} />
                <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-16 p-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{user.username}</h1>
              <p className="text-gray-400 font-medium mt-1">
                {user.bio || <span className="italic opacity-50">Aucune bio renseignée pour le moment.</span>}
              </p>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2 border-2 border-gray-900 rounded-full font-bold hover:bg-gray-900 hover:text-white transition"
            >
              {isEditing ? 'Annuler' : 'Modifier le profil'}
            </button>
          </div>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black uppercase text-gray-400 ml-1">Nom d'utilisateur</span>
                <div className="relative">
                  <User className="absolute left-4 top-4 text-gray-300" size={20} />
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 font-bold transition-colors"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase text-gray-400 ml-1">Email</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
                  <input 
                    disabled={!isEditing}
                    type="email" 
                    className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 font-bold transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black uppercase text-gray-400 ml-1">Ma Bio</span>
                <textarea 
                  disabled={!isEditing}
                  rows="5"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                  placeholder="Dites-en plus sur vous..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </label>
            </div>

            {isEditing && (
              <div className="md:col-span-2 pt-4">
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-rose-600 transition flex items-center justify-center active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" size={20} /> Enregistrer les modifications</>}
                </button>
              </div>
            )}
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="flex items-center text-lg font-black text-gray-900 mb-4">
              <ShieldCheck className="mr-2 text-green-500" /> Sécurité du compte
            </h3>
            <p className="text-sm text-gray-400">Pour changer votre mot de passe, veuillez contacter le support ou utiliser la procédure de récupération.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;