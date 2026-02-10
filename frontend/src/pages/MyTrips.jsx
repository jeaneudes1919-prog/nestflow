import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, MapPin, DollarSign, Star, MessageSquare, Loader2, Plane, AlertCircle } from 'lucide-react';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ visible: false, propertyId: null, rating: 5, comment: '' });

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get('/reservations/my-trips');
        setTrips(res.data);
      } catch (err) {
        console.error("Erreur", err);
        toast.error("Impossible de charger vos voyages.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // --- LOGIQUE D'URL DYNAMIQUE (L'anti-bug !) ---
  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
    if (url.startsWith('http')) return url; // Cloudinary
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${url}`; // Local
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Envoi de votre avis...");
    try {
      await api.post('/reviews', {
        property_id: reviewForm.propertyId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      toast.success("Avis publié ! Merci ⭐", { id: loadingToast });
      setReviewForm({ visible: false, propertyId: null, rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'envoi", { id: loadingToast });
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed': 
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Confirmé</span>;
      case 'pending': 
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>En attente</span>;
      case 'cancelled': 
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Annulé</span>;
      default: 
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-primary mb-4" size={48} />
      <p className="text-gray-500 font-bold">Récupération de vos billets...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-black text-gray-900">Mes Voyages</h1>
           <p className="text-gray-500 font-medium mt-1">Retrouvez l'historique de vos aventures.</p>
        </div>
        <div className="hidden md:block bg-gray-100 p-3 rounded-full">
            <Plane className="text-gray-400" />
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-gray-300 shadow-sm">
           <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin size={40} className="text-gray-300" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun voyage pour le moment</h3>
           <p className="text-gray-500 mb-8 max-w-md mx-auto">Le monde est vaste et plein de lieux incroyables. Commencez à explorer dès maintenant !</p>
           <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-rose-600 transition">
              Explorer les logements
           </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300 group">
               <div className="flex flex-col md:flex-row">
                   {/* Image Corrigée */}
                   <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden">
                      <img 
                        src={getImageUrl(trip.image_url)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        alt={trip.title}
                      />
                      <div className="absolute top-4 left-4">
                         {getStatusBadge(trip.status)}
                      </div>
                   </div>

                   {/* Contenu */}
                   <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{trip.title}</h2>
                            <span className="font-bold text-lg text-gray-900">{trip.total_price}€</span>
                        </div>
                        <p className="text-gray-500 font-medium flex items-center mb-6">
                            <MapPin size={16} className="mr-1 text-gray-400" /> {trip.location}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400">Arrivée</p>
                                <p className="font-bold text-gray-800 flex items-center">
                                    <Calendar size={14} className="mr-2 text-primary" />
                                    {new Date(trip.start_date).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400">Départ</p>
                                <p className="font-bold text-gray-800 flex items-center">
                                    <Calendar size={14} className="mr-2 text-primary" />
                                    {new Date(trip.end_date).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Link to={`/property/${trip.property_id}`} className="text-gray-600 hover:text-black font-bold text-sm transition">
                          Voir le logement
                        </Link>

                        {trip.status === 'confirmed' && (
                          <button 
                            onClick={() => setReviewForm({ visible: true, propertyId: trip.property_id, rating: 5, comment: '' })}
                            className="flex items-center bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-md"
                          >
                            <Star size={16} className="mr-2" /> Noter ce séjour
                          </button>
                        )}
                        {trip.status === 'pending' && (
                             <span className="text-xs font-bold text-orange-500 flex items-center">
                                <AlertCircle size={14} className="mr-1" /> En attente de validation
                             </span>
                        )}
                      </div>
                   </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL D'AVIS */}
      {reviewForm.visible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
                    <Star size={32} fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Notez votre séjour</h3>
            </div>

            <form onSubmit={submitReview} className="space-y-6">
              <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="group p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        className={`${star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'} transition-colors`} 
                      />
                    </button>
                  ))}
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Votre commentaire</label>
                <textarea 
                  required
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                  placeholder="Qu'avez-vous pensé du logement ?"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setReviewForm({ ...reviewForm, visible: false })}
                  className="py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button type="submit" className="bg-primary text-white py-3 rounded-xl font-bold shadow-lg">
                  Publier l'avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTrips;