import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, X, Upload, Loader2 } from 'lucide-react';

const AMENITIES_LIST = [
  { id: 'wifi', label: 'Wifi' }, { id: 'ac', label: 'Climatisation' },
  { id: 'pool', label: 'Piscine' }, { id: 'tv', label: 'TV' },
  { id: 'parking', label: 'Parking' }, { id: 'kitchen', label: 'Cuisine' }
];

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [newFiles, setNewFiles] = useState([]); 

  // --- LOGIQUE D'URL DYNAMIQUE (L'anti-bug) ---
  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
    if (url.startsWith('http')) return url; // Cloudinary
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${url}`; // Local
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setFormData(res.data);
      } catch (err) {
        console.error("Erreur de chargement:", err);
        toast.error("Impossible de charger l'annonce.");
        navigate('/host/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, navigate]);

  const handleDeleteExistingImage = (imageId) => {
    if (!imageId) return toast.error("ID de l'image manquant.");

    toast((t) => (
      <div className="flex flex-col items-center space-y-3">
        <span className="font-bold text-gray-800">Supprimer cette photo ?</span>
        <div className="flex space-x-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
          >
            Annuler
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/properties/image/${imageId}`);
                setFormData(prev => ({
                  ...prev,
                  images: prev.images.filter(img => img.id !== imageId)
                }));
                toast.success("Photo supprimée !");
              } catch (err) {
                toast.error("Erreur lors de la suppression.");
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition"
          >
            Supprimer
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleAmenityChange = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await api.put(`/properties/${id}`, formData);
        
        if (newFiles.length > 0) {
            const imageFormData = new FormData();
            newFiles.forEach(file => imageFormData.append('images', file));
            await api.post(`/properties/${id}/images`, imageFormData);
        }

        toast.success("Annonce mise à jour avec succès !");
        navigate('/host/dashboard');
    } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || "Oups, une erreur est survenue.");
    } finally {
        setIsSaving(false);
    }
};

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="font-bold text-gray-500 italic">Chargement de votre annonce...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-black mb-6 transition font-bold group">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
        Retour au Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-black mb-8 text-gray-900 tracking-tight">Configuration de l'annonce</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Titre de l'annonce</label>
              <input type="text" value={formData.title} required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800 transition-all"
                onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Prix par nuit (€)</label>
              <input type="number" value={formData.price_per_night} required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800 transition-all"
                onChange={(e) => setFormData({...formData, price_per_night: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Voyageurs max</label>
              <input type="number" value={formData.max_guests} required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-bold text-gray-800 transition-all"
                onChange={(e) => setFormData({...formData, max_guests: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Description</label>
              <textarea rows="4" value={formData.description} required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-primary font-medium text-gray-700 transition-all"
                onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-4">Photos en ligne</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.images?.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-md bg-gray-100 border border-gray-200">
                  {/* SRC CORRIGÉ ICI */}
                  <img src={getImageUrl(img.image_url)} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Bien" />
                  <button 
                    type="button" 
                    onClick={() => handleDeleteExistingImage(img.id)} 
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-110"
                  >
                    <X size={14} />
                  </button>
                  {img.is_main && (
                    <span className="absolute bottom-2 left-2 bg-primary text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase shadow-sm">
                      Principale
                    </span>
                  )}
                </div>
              ))}

              <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition hover:border-primary group">
                <Upload size={24} className="text-gray-300 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase text-gray-400 mt-2">Ajouter</span>
                <input type="file" multiple className="hidden" onChange={(e) => setNewFiles([...newFiles, ...Array.from(e.target.files)])} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-4">Services inclus</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITIES_LIST.map(amenity => (
                <button key={amenity.id} type="button" onClick={() => handleAmenityChange(amenity.id)}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center space-x-2 font-bold text-sm ${
                    formData.amenities.includes(amenity.id) 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-gray-50 bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}>
                  <span>{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center active:scale-95 disabled:bg-gray-300"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin mr-3" size={24} />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={22} className="mr-3" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;