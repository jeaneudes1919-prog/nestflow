import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MapPin, Star, Share, Heart, ShieldCheck, 
  MessageSquare, CheckCircle, Loader2, Maximize2, X, ChevronLeft
} from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // État réservation
  const [dates, setDates] = useState({ start: '', end: '' });
  const [totalPrice, setTotalPrice] = useState(0);

  // --- LOGIQUE D'URL DYNAMIQUE ---
  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";
    if (url.startsWith('http')) return url; // Cloudinary
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${url}`; // Local
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProp, resReviews] = await Promise.all([
          api.get(`/properties/${id}`),
          api.get(`/reviews/${id}`)
        ]);
        setProperty(resProp.data);
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

  useEffect(() => {
    if (dates.start && dates.end && property) {
      const start = new Date(dates.start);
      const end = new Date(dates.end);
      const days = Math.ceil((end - start) / (1000 * 3600 * 24));
      setTotalPrice(days > 0 ? days * property.price_per_night : 0);
    }
  }, [dates, property]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
        toast("Connectez-vous pour réserver", { icon: '🔒' });
        return navigate('/login');
    }
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

  const handleContactHost = (e) => {
      e.preventDefault();
      if (!user) {
          toast("Connectez-vous pour discuter", { icon: '💬' });
          return navigate('/login');
      }
      navigate(`/chat/${property.id}/${property.host_id}`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="text-primary mb-4"
      >
        <Loader2 size={48} />
      </motion.div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Préparation de votre séjour...</p>
    </div>
  );

  if (!property) return <div className="text-center mt-20 text-red-500 font-bold">Oups, ce logement semble avoir disparu.</div>;

  // --- LOGIQUE GALERIE ADAPTATIVE CORRIGÉE ---
  const images = property.images?.map(img => getImageUrl(img.image_url)) || [];
  const imgClass = "w-full h-full object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-700 ease-in-out";

  const renderGallery = () => {
    const count = images.length;
    if (count === 0) return <div className="h-[400px] bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 font-bold">Aucune photo</div>;

    return (
      <div className={`grid gap-2 md:gap-4 rounded-[2.5rem] overflow-hidden h-[350px] md:h-[550px] relative ${
        count === 1 ? 'grid-cols-1' : 
        count === 2 ? 'grid-cols-2' : 
        count === 3 ? 'grid-cols-2 grid-rows-2' : 
        'grid-cols-4 grid-rows-2'
      }`}>
        {count === 1 && <img src={images[0]} className={imgClass} onClick={() => setIsModalOpen(true)} alt="Property" />}
        {count === 2 && images.map((img, i) => <img key={i} src={img} className={imgClass} onClick={() => setIsModalOpen(true)} alt="Property" />)}
        {count === 3 && (
          <>
            <div className="row-span-2"><img src={images[0]} className={imgClass} onClick={() => setIsModalOpen(true)} alt="Property" /></div>
            <div><img src={images[1]} className={imgClass} onClick={() => setIsModalOpen(true)} alt="Property" /></div>
            <div><img src={images[2]} className={imgClass} onClick={() => setIsModalOpen(true)} alt="Property" /></div>
          </>
        )}
        {count >= 4 && (
          <>
            <div className="col-span-2 row-span-2"><img src={images[0]} className={imgClass} onClick={() => setIsModalOpen(true)} alt="Property" /></div>
            <div className={count === 4 ? 'col-span-2' : ''}><img src={images[1]} className={imgClass} onClick={() => setIsModalOpen(true)} alt="Property" /></div>
            <div className={count === 4 ? 'col-span-1' : ''}><img src={images[2]} className={imgClass} onClick={() => setIsModalOpen(true)} alt="Property" /></div>
            {images[3] && <div className="relative">
                <img src={images[3]} className={imgClass} onClick={() => setIsModalOpen(true)} alt="Property" />
                {count > 4 && (
                    <div onClick={() => setIsModalOpen(true)} className="absolute inset-0 bg-black/30 flex items-center justify-center text-white font-black text-xl cursor-pointer">+{count - 4}</div>
                )}
            </div>}
          </>
        )}
        <button onClick={() => setIsModalOpen(true)} className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-black text-sm border border-gray-100 hover:bg-white transition-all">
          <Maximize2 size={16} /> Afficher {count} photos
        </button>
      </div>
    );
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* HEADER SECTION */}
        <div className="mb-8">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4">
                <Star size={14} className="fill-current" /> Logement d'Exception
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">{property.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-slate-900">
                            <Star size={16} className="text-primary fill-current" /> {property.average_rating || "Nouveau"} · {reviews.length} avis
                        </span>
                        <span className="flex items-center gap-1 underline cursor-pointer">
                            <MapPin size={16} /> {property.location}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 font-bold text-sm hover:bg-slate-50 transition"><Share size={18}/> Partager</button>
                    <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 font-bold text-sm text-rose-500 hover:bg-rose-50 transition"><Heart size={18}/> Enregistrer</button>
                </div>
            </div>
        </div>

        {/* DYNAMIC GALLERY */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {renderGallery()}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-16 relative">
          
          {/* GAUCHE : INFOS */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between py-8 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Chez {property.host_name || "l'hôte"}</h2>
                    <p className="text-slate-500 font-bold">{property.max_guests} voyageurs · {property.amenities?.length || 0} équipements</p>
                </div>
                {/* AVATAR HÔTE DYNAMIQUE */}
                <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] overflow-hidden flex items-center justify-center text-white font-black text-2xl uppercase shadow-xl">
                    {property.host_avatar ? (
                      <img src={getImageUrl(property.host_avatar)} className="w-full h-full object-cover" alt="Host" />
                    ) : (
                      <span>{property.host_name?.[0]}</span>
                    )}
                </div>
            </div>

            <div className="py-10 space-y-10">
                <div className="flex gap-6">
                    <ShieldCheck size={32} className="text-primary shrink-0" />
                    <div>
                        <h4 className="font-black text-lg text-slate-900">NestCover Protection</h4>
                        <p className="text-slate-500 font-medium leading-relaxed">Nous protégeons chaque séjour. Si le logement ne correspond pas, on vous reloge ou on vous rembourse.</p>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-2xl font-black mb-6">À propos du logement</h3>
                    <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line">
                        {property.description}
                    </p>
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-2xl font-black mb-8">Ce que propose ce lieu</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {property.amenities?.map((item) => (
                            <div key={item} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm font-bold text-slate-700">
                                <CheckCircle size={20} className="text-green-500" />
                                <span className="capitalize">{item.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* DROITE : CARD RESERVATION */}
          <div className="relative">
            <div className="sticky top-32 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <span className="text-3xl font-black text-slate-900">{property.price_per_night}€</span>
                        <span className="text-slate-400 font-bold italic"> / nuit</span>
                    </div>
                    <div className="text-xs font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {reviews.length} avis
                    </div>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                    <div className="grid grid-cols-2 border-2 border-gray-100 rounded-3xl overflow-hidden focus-within:border-primary transition-colors">
                        <div className="p-4 border-r border-gray-100">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Arrivée</label>
                            <input type="date" required className="w-full font-bold outline-none bg-transparent" onChange={(e) => setDates({ ...dates, start: e.target.value })} />
                        </div>
                        <div className="p-4">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Départ</label>
                            <input type="date" required className="w-full font-bold outline-none bg-transparent" onChange={(e) => setDates({ ...dates, end: e.target.value })} />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-primary py-5 rounded-2xl text-white font-black text-xl hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all active:scale-95">
                        Réserver maintenant
                    </button>

                    <button type="button" onClick={handleContactHost} className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-900 rounded-2xl font-black text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                        <MessageSquare size={20} /> Contacter l'hôte
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-dashed border-gray-200 space-y-4">
                    <div className="flex justify-between text-slate-500 font-bold">
                        <span className="underline">Prix du séjour</span>
                        <span>{totalPrice}€</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xl font-black text-slate-900">Total</span>
                        <span className="text-2xl font-black text-primary">{totalPrice}€</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* SECTION COMMENTAIRES */}
        <div className="mt-24 pt-16 border-t border-gray-100">
            <h2 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-4">
                <Star size={32} className="text-primary fill-current" /> {property.average_rating || "Nouveau"} · {reviews.length} témoignages
            </h2>

            {reviews.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-gray-200">
                    <MessageSquare size={48} className="mx-auto text-slate-200 mb-6" />
                    <p className="text-slate-400 font-black uppercase tracking-widest">Aucun avis pour le moment</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reviews.map((review) => (
                        <motion.div whileHover={{ y: -5 }} key={review.id} className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-primary uppercase overflow-hidden">
                                  {review.user_avatar ? (
                                    <img src={getImageUrl(review.user_avatar)} className="w-full h-full object-cover" alt="User" />
                                  ) : (
                                    <span>{review.username?.[0]}</span>
                                  )}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900">{review.username}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 mb-4 text-primary">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < (review.rating || 5) ? "currentColor" : "none"} />)}
                            </div>
                            <p className="text-slate-600 font-medium italic leading-relaxed">"{review.comment}"</p>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* MODAL GALERIE PLEIN ÉCRAN */}
      <AnimatePresence>
        {isModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black p-4 md:p-10 overflow-y-auto no-scrollbar">
                <button onClick={() => setIsModalOpen(false)} className="fixed top-8 right-8 z-[210] bg-white/10 hover:bg-white/20 p-4 rounded-full text-white backdrop-blur-md transition">
                    <X size={32} />
                </button>
                <div className="max-w-4xl mx-auto space-y-8 py-10">
                    {images.map((img, i) => (
                        <motion.img 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            whileInView={{ opacity: 1, scale: 1 }} 
                            viewport={{ once: true }}
                            key={i} src={img} className="w-full rounded-[2rem] shadow-2xl" 
                            alt="Gallery detail"
                        />
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetails;