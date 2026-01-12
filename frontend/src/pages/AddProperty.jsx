import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
// 1. IMPORT DU TOAST
import toast from 'react-hot-toast';
import { Upload, Home, MapPin, DollarSign, Users, X, Check, Loader2 } from 'lucide-react';

const AMENITIES_LIST = [
  { id: 'wifi', label: 'Wifi Haut Débit' },
  { id: 'ac', label: 'Climatisation' },
  { id: 'pool', label: 'Piscine' },
  { id: 'tv', label: 'TV HD' },
  { id: 'parking', label: 'Parking Gratuit' },
  { id: 'kitchen', label: 'Cuisine Équipée' }
];

const AddProperty = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // On a supprimé 'error' car on utilise toast.error maintenant
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_night: '',
    location: '',
    max_guests: 1,
    amenities: [] 
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'host') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      // 2. ERREUR TOAST
      return toast.error("Vous ne pouvez pas uploader plus de 5 images.");
    }
    
    setSelectedFiles([...selectedFiles, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleAmenityChange = (id) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id) 
        ? prev.amenities.filter(a => a !== id) 
        : [...prev.amenities, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return toast.error("Veuillez ajouter au moins une photo.");
    
    setLoading(true);

    try {
      // 1. Création du bien
      const res = await api.post('/properties', formData);
      const propertyId = res.data.id;

      // 2. Envoi des images
      const imageFormData = new FormData();
      selectedFiles.forEach(file => {
        imageFormData.append('images', file);
      });

      await api.post(`/properties/${propertyId}/images`, imageFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 3. SUCCÈS TOAST
      toast.success("Annonce publiée avec succès ! 🏠");
      
      // Redirection vers le Dashboard Hôte (plus logique pour voir son bien)
      navigate('/host/dashboard');

    } catch (err) {
      // 4. ERREUR TOAST
      console.error(err);
      toast.error(err.response?.data?.error || "Erreur lors de la publication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Home size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Nouvelle annonce</h1>
            <p className="text-gray-500">Remplissez les détails pour attirer vos premiers voyageurs.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Titre & Description */}
          <div className="space-y-4">
            <input
              type="text" required placeholder="Titre accrocheur (ex: Loft moderne avec vue sur mer)"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none text-lg font-semibold"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <textarea
              required rows="4" placeholder="Décrivez l'expérience unique que vous proposez..."
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Localisation, Prix, Voyageurs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
              <input type="text" required placeholder="Ville" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none"
                onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="relative">
              <DollarSign className="absolute left-4 top-4 text-gray-400" size={20} />
              <input type="number" required placeholder="Prix / nuit" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none"
                onChange={(e) => setFormData({...formData, price_per_night: e.target.value})} />
            </div>
            <div className="relative">
              <Users className="absolute left-4 top-4 text-gray-400" size={20} />
              <input type="number" required placeholder="Voyageurs" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none"
                onChange={(e) => setFormData({...formData, max_guests: e.target.value})} />
            </div>
          </div>

          {/* Équipements */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Check size={20} className="mr-2 text-green-500" /> Équipements disponibles
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES_LIST.map(amenity => (
                <button
                  key={amenity.id} type="button"
                  onClick={() => handleAmenityChange(amenity.id)}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 font-medium ${
                    formData.amenities.includes(amenity.id) ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <span>{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* UPLOAD IMAGES MULTIPLES */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Upload size={20} className="mr-2 text-blue-500" /> Photos (1 à 5)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {previews.map((src, index) => (
                <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden shadow-md">
                  <img src={src} className="w-full h-full object-cover" alt="Preview" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-600">
                    <X size={14} />
                  </button>
                  {index === 0 && <span className="absolute bottom-0 inset-x-0 bg-primary text-[10px] text-white text-center py-1 font-bold">Principale</span>}
                </div>
              ))}
              {previews.length < 5 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition text-gray-400 hover:border-primary hover:text-primary">
                  <Upload size={24} />
                  <span className="text-[10px] mt-2 font-bold uppercase">Ajouter</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-rose-600 transition-all transform active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Publication...
              </>
            ) : 'Mettre en ligne mon bien'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;