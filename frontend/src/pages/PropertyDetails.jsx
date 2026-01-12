import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
// 1. TOAST
import toast from 'react-hot-toast';
import {
  MapPin, Star, Share, Heart, ShieldCheck, 
  MessageSquare, CheckCircle, Loader2
} from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // État réservation
  const [dates, setDates] = useState({ start: '', end: '' });
  const [totalPrice, setTotalPrice] = useState(0);

  // Photos par défaut stylées
  const defaultImages = [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProp = await api.get(`/properties/${id}`);
        setProperty(resProp.data);

        const resReviews = await api.get(`/reviews/${id}`);
        setReviews(resReviews.data);
      } catch (err) {
        console.error("Erreur chargement", err);
        toast.error("Impossible de charger le logement.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Calcul dynamique du prix
  useEffect(() => {
    if (dates.start && dates.end && property) {
      const start = new Date(dates.start);
      const end = new Date(dates.end);
      const days = Math.ceil((end - start) / (1000 * 3600 * 24));
      setTotalPrice(days > 0 ? days * property.price_per_night : 0);
    }
  }, [dates, property]);

  // Action : Réserver
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
        toast("Connectez-vous pour réserver", { icon: '🔒' });
        return navigate('/login');
    }
    
    // Vérification de base
    if (totalPrice <= 0) return toast.error("Veuillez choisir des dates valides.");

    const loadingToast = toast.loading("Traitement de la demande...");
    try {
      await api.post('/reservations', {
        property_id: property.id,
        start_date: dates.start,
        end_date: dates.end
      });
      
      toast.success("Demande envoyée à l'hôte ! ✈️", { id: loadingToast });
      navigate('/my-trips');
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur de réservation", { id: loadingToast });
    }
  };

  // Action : Contacter l'hôte
  const handleContactHost = (e) => {
      e.preventDefault(); // Pour éviter que ça submit le form
      if (!user) {
          toast("Connectez-vous pour discuter", { icon: '💬' });
          return navigate('/login');
      }
      navigate(`/chat/${property.id}/${property.host_id}`);
  };

  if (loading) return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-bold text-gray-500 italic">Chargement de votre prochaine aventure...</p>
      </div>
  );

  if (!property) return <div className="text-center mt-20 text-red-500 font-bold">Oups, ce logement semble avoir disparu.</div>;

  // --- GALERIE INTELLIGENTE ---
  const imagesFromDb = property.images || [];
  const gallery = [];
  const mainImg = imagesFromDb.find(img => img.is_main) || imagesFromDb[0];
  const otherImgs = imagesFromDb.filter(img => img !== mainImg);
  if (mainImg) gallery.push(`http://localhost:5000${mainImg.image_url}`);
  otherImgs.forEach(img => gallery.push(`http://localhost:5000${img.image_url}`));
  while (gallery.length < 5) gallery.push(defaultImages[gallery.length % defaultImages.length]);


  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 mb-2">{property.title}</h1>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center space-x-4 text-sm font-semibold text-gray-700">
            <span className="flex items-center">
              <Star size={16} className="text-primary fill-current mr-1" />
              {property.average_rating > 0 ? property.average_rating : "Nouveau"}
            </span>
            <span className="underline cursor-pointer hover:text-primary transition">{reviews.length} avis</span>
            <span className="hidden md:inline text-gray-400">·</span>
            <span className="flex items-center underline cursor-pointer hover:text-primary transition">
              <MapPin size={16} className="mr-1 text-gray-400" /> {property.location}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center hover:bg-gray-100 px-3 py-2 rounded-lg transition text-sm font-bold">
              <Share size={16} className="mr-2" /> Partager
            </button>
            <button className="flex items-center hover:bg-gray-100 px-3 py-2 rounded-lg transition text-sm font-bold text-rose-500">
              <Heart size={16} className="mr-2" /> Enregistrer
            </button>
          </div>
        </div>
      </div>

      {/* GALERIE PHOTO (GRID BENTO) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-3xl overflow-hidden h-[300px] md:h-[500px] mb-12 shadow-2xl border border-gray-200">
        <div className="md:col-span-2 h-full relative group cursor-pointer">
          <img
            src={gallery[0]}
            className="w-full h-full object-cover group-hover:brightness-90 transition duration-500"
            alt="Main"
          />
        </div>
        <div className="hidden md:grid grid-cols-2 col-span-2 gap-2 h-full">
          {gallery.slice(1, 5).map((img, index) => (
            <div key={index} className="h-full w-full overflow-hidden group cursor-pointer">
              <img
                src={img}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                alt={`Sub ${index}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
        {/* GAUCHE : INFOS */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Logement proposé par {property.host_name || "l'hôte"}</h2>
              <p className="text-gray-500 font-medium">
                {property.max_guests} voyageurs · {property.amenities?.length || 0} équipements · Wifi inclus
              </p>
            </div>
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl uppercase border-4 border-white">
              {property.host_name?.charAt(0) || "U"}
            </div>
          </div>

          <div className="space-y-6 mb-8 py-4">
            <div className="flex items-start">
              <ShieldCheck size={28} className="mr-4 text-primary shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Protection NestCover</h4>
                <p className="text-gray-500 leading-relaxed">Chaque réservation est protégée gratuitement contre les annulations, les inexactitudes et autres problèmes.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-xl font-bold mb-4 text-gray-900">À propos de ce logement</h3>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line font-medium">
              {property.description}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-8 mt-8">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Ce que propose ce logement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
              {property.amenities?.map((item) => (
                <div key={item} className="flex items-center text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition">
                  <CheckCircle size={20} className="mr-4 text-gray-400" />
                  <span className="capitalize font-medium">{item.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DROITE : CARD RESERVATION STICKY */}
        <div className="relative">
          <div className="border rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-8 sticky top-28 bg-white border-gray-100 ring-1 ring-black/5">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-2xl font-black text-gray-900">{property.price_per_night}€</span>
                <span className="text-gray-400 text-sm font-bold"> / nuit</span>
              </div>
              <div className="flex items-center text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-900">
                <Star size={12} className="text-primary fill-current mr-1" />
                {property.average_rating > 0 ? property.average_rating : "Nouveau"} · {reviews.length} avis
              </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 border rounded-2xl overflow-hidden border-gray-300">
                <div className="p-3 border-r border-gray-300 bg-white hover:bg-gray-50 transition cursor-pointer relative">
                  <label className="block text-[9px] font-black uppercase text-gray-800 tracking-wider">Arrivée</label>
                  <input type="date" required className="w-full text-sm outline-none bg-transparent font-medium text-gray-600 cursor-pointer mt-1" onChange={(e) => setDates({ ...dates, start: e.target.value })} />
                </div>
                <div className="p-3 bg-white hover:bg-gray-50 transition cursor-pointer relative">
                  <label className="block text-[9px] font-black uppercase text-gray-800 tracking-wider">Départ</label>
                  <input type="date" required className="w-full text-sm outline-none bg-transparent font-medium text-gray-600 cursor-pointer mt-1" onChange={(e) => setDates({ ...dates, end: e.target.value })} />
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-primary to-rose-600 text-white py-4 rounded-xl font-black text-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 shadow-md">
                Réserver
              </button>
              
              <button
                type="button" // Important pour ne pas submit
                onClick={handleContactHost}
                className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all active:scale-95"
              >
                <MessageSquare size={18} />
                <span>Contacter l'hôte</span>
              </button>
            </form>

            <div className="mt-6 space-y-4 text-sm text-gray-600 font-medium">
              <div className="flex justify-between">
                <span className="underline">{property.price_per_night}€ x {totalPrice / property.price_per_night || 0} nuits</span>
                <span>{totalPrice}€</span>
              </div>
              <div className="flex justify-between font-black text-lg text-gray-900 border-t border-dashed border-gray-200 pt-4">
                <span>Total</span>
                <span>{totalPrice}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION COMMENTAIRES */}
      <div className="border-t border-gray-200 pt-16 mt-16">
        <h2 className="text-2xl font-black flex items-center mb-10 text-gray-900">
          <Star size={24} className="text-primary fill-current mr-3" />
          {property.average_rating > 0 ? property.average_rating : "Nouveau"} · {reviews.length} commentaires
        </h2>

        {reviews.length === 0 ? (
          <div className="bg-gray-50 p-12 rounded-3xl text-center border border-gray-200">
            <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold">Aucun avis pour l'instant.</p>
            <p className="text-gray-400 text-sm mt-1">Soyez le premier à partager votre expérience !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-2xl hover:bg-white hover:shadow-lg transition duration-300 border border-transparent hover:border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-black text-gray-500 uppercase">
                    {review.username.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.username}</h4>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                      {new Date(review.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3 text-xs">
                  {[...Array(review.rating || 5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-gray-600 leading-relaxed font-medium">"{review.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;