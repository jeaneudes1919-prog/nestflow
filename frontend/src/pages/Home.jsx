import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
    MapPin, Search, Shield, Heart, Zap, Star, ArrowRight,
    Umbrella, Mountain, Building, Tent, Waves, Coffee,
    CheckCircle, Instagram, Facebook, Twitter, Mail, Loader2
} from 'lucide-react';

// --- STYLES CUSTOM ---
const styles = `
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- IMAGE PAR DÉFAUT ---
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";

const CATEGORIES = [
    { id: 'all', label: 'Tout', icon: <Star size={20} /> },
    { id: 'beach', label: 'Plage', icon: <Waves size={20} /> },
    { id: 'luxe', label: 'Luxe', icon: <Building size={20} /> },
    { id: 'nature', label: 'Nature', icon: <Mountain size={20} /> },
    { id: 'cabins', label: 'Insolite', icon: <Tent size={20} /> },
    { id: 'pool', label: 'Piscines', icon: <Umbrella size={20} /> },
    { id: 'trending', label: 'Tendance', icon: <Zap size={20} /> },
    { id: 'breakfast', label: 'BnB', icon: <Coffee size={20} /> },
];

const POPULAR_DESTINATIONS = [
    {
        id: 1,
        city: 'Cotonou',
        count: '120+ logements',
        image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
        id: 2,
        city: 'Ouidah',
        count: '45 pépites',
        image: 'https://images.pexels.com/photos/2486168/pexels-photo-2486168.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
        id: 3,
        city: 'Porto-Novo',
        count: '32 villas',
        image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80',
    },
];

const Home = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [scrolled, setScrolled] = useState(false);
    const [searchDestination, setSearchDestination] = useState('');

    // --- LOGIQUE D'URL DYNAMIQUE ---
    const getImageUrl = (url) => {
        if (!url) return DEFAULT_IMAGE;
        if (url.startsWith('http')) return url;
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${backendUrl}${url}`;
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await api.get('/properties');
                setProperties(res.data);
            } catch (err) {
                console.error("Erreur chargement", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const handleSearch = () => {
        navigate('/properties');
    };

    const displayedProperties = activeCategory === 'all' 
        ? properties.slice(0, 8) 
        : properties.filter((_, index) => index % 2 === 0).slice(0, 8);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
            <style>{styles}</style>

            {/* ================= HERO SECTION ================= */}
            <div className="relative h-[90vh] flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-white z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80"
                        alt="Hero"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-20 w-full max-w-5xl px-4 flex flex-col items-center text-center mt-[-60px]">
                    <div className="opacity-0 animate-fade-in-up">
                         <span className="inline-flex items-center py-1 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-bold uppercase tracking-wider mb-6">
                            <Star size={14} className="mr-2 text-yellow-400 fill-current" />
                            L'expérience Premium au Bénin
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-[1.1] drop-shadow-xl">
                            Trouvez votre <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-orange-200">
                                coin de paradis.
                            </span>
                        </h1>
                    </div>
                    
                    <p className="opacity-0 animate-fade-in-up delay-100 text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light">
                        Villas secrètes, lofts urbains et cabanes sur l'eau. Réservez des logements uniques vérifiés par nos experts.
                    </p>

                    <div className="opacity-0 animate-fade-in-up delay-200 w-full max-w-4xl">
                        <div className="bg-white/95 backdrop-blur-xl p-3 md:p-2 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-white/50">
                            
                            <div className="flex-1 w-full px-6 py-3 hover:bg-gray-50 rounded-[1.5rem] transition group cursor-pointer border-b md:border-b-0 md:border-r border-gray-100">
                                <label className="block text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1 group-hover:text-primary transition">Destination</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Cotonou, Haie Vive..." 
                                    className="w-full bg-transparent outline-none text-gray-700 font-bold placeholder-gray-400 truncate"
                                    value={searchDestination}
                                    onChange={(e) => setSearchDestination(e.target.value)}
                                />
                            </div>

                            <div className="w-full md:w-auto md:min-w-[180px] px-6 py-3 hover:bg-gray-50 rounded-[1.5rem] transition group cursor-pointer border-b md:border-b-0 md:border-r border-gray-100">
                                <label className="block text-[10px] font-black text-gray-800 uppercase tracking-widest mb-1 group-hover:text-primary transition">Quand ?</label>
                                <div className="text-gray-400 font-bold text-sm">Ajouter des dates</div>
                            </div>

                            <div className="w-full md:w-auto p-1">
                                <button 
                                    onClick={handleSearch}
                                    className="w-full md:w-auto bg-primary hover:bg-rose-600 text-white rounded-[1.5rem] md:rounded-full h-14 md:h-14 md:w-14 flex items-center justify-center shadow-lg transform transition active:scale-95 duration-200 font-bold text-lg"
                                >
                                    <span className="md:hidden mr-2">Rechercher</span>
                                    <Search size={24} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= CATÉGORIES STICKY ================= */}
            <div className={`sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${scrolled ? 'shadow-sm py-2' : 'py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
                    <div className="flex space-x-4 md:space-x-8 min-w-max px-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                                    activeCategory === cat.id 
                                    ? 'opacity-100 scale-105' 
                                    : 'opacity-50 hover:opacity-100 hover:bg-gray-50'
                                }`}
                            >
                                <div className={`${activeCategory === cat.id ? 'text-primary' : 'text-gray-600'}`}>
                                    {cat.icon}
                                </div>
                                <span className={`text-xs whitespace-nowrap ${activeCategory === cat.id ? 'font-black text-gray-900' : 'font-medium text-gray-500'}`}>
                                    {cat.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ================= BENTO GRID DESTINATIONS ================= */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Destinations Phares</h2>
                        <p className="text-gray-500 mt-2 text-lg">Les spots les plus prisés par notre communauté.</p>
                    </div>
                    <Link to="/properties" className="inline-flex items-center font-bold text-primary hover:underline group">
                        Tout explorer <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[500px]">
                    <Link to="/properties" className="md:col-span-2 md:row-span-2 relative group rounded-3xl overflow-hidden cursor-pointer h-64 md:h-auto block">
                        <img src={POPULAR_DESTINATIONS[0].image} alt="Main" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-6 left-6 text-white p-2">
                            <h3 className="text-3xl font-black mb-1">{POPULAR_DESTINATIONS[0].city}</h3>
                            <p className="font-medium opacity-90">{POPULAR_DESTINATIONS[0].count}</p>
                        </div>
                    </Link>

                    {POPULAR_DESTINATIONS.slice(1).map((dest) => (
                        <Link to="/properties" key={dest.id} className="md:col-span-2 relative group rounded-3xl overflow-hidden cursor-pointer h-48 md:h-auto block">
                            <img src={dest.image} alt={dest.city} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-6 left-6 text-white p-2">
                                <h3 className="text-2xl font-black mb-1">{dest.city}</h3>
                                <p className="font-medium opacity-90">{dest.count}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ================= LISTING PROPERTIES ================= */}
            <section className="py-12 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-black text-gray-900 mb-8">
                        {activeCategory === 'all' ? 'Coups de cœur voyageurs' : `Sélection : ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 h-64 rounded-3xl mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {displayedProperties.map((property) => (
                                <Link key={property.id} to={`/property/${property.id}`} className="group block">
                                    <div className="relative aspect-[1/1] rounded-3xl overflow-hidden mb-4 bg-gray-200 shadow-sm group-hover:shadow-xl transition-all duration-300">
                                        <img
                                            src={getImageUrl(property.image_url)}
                                            alt={property.title}
                                            className="object-cover w-full h-full group-hover:scale-105 transition duration-700 ease-out"
                                        />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-800">
                                            Premium
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900 truncate pr-2 group-hover:text-primary transition">{property.title}</h3>
                                            <div className="flex items-center text-sm font-bold">
                                                <Star size={14} className="text-primary fill-current mr-1" />
                                                {property.average_rating > 0 ? property.average_rating : "New"}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-gray-500 text-sm mb-2">
                                            <MapPin size={14} className="mr-1" /> {property.location}
                                        </div>
                                        <div className="flex items-baseline">
                                            <span className="font-black text-gray-900 text-lg mr-1">{property.price_per_night}€</span>
                                            <span className="text-gray-400 text-sm font-medium">/ nuit</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ================= VALEURS ================= */}
            <section className="py-24 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-black text-gray-900">L'Excellence NestFlow</h2>
                        <p className="text-gray-500 mt-4 text-lg">Nous redéfinissons les standards de l'hospitalité.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: <Shield size={32} />, title: "Sécurité Garantie", text: "Vérification d'identité stricte et paiements sécurisés." },
                            { icon: <CheckCircle size={32} />, title: "Qualité Certifiée", text: "Chaque logement est inspecté pour garantir sa conformité." },
                            { icon: <Zap size={32} />, title: "Support Éclair", text: "Une équipe dédiée disponible 24/7 pour vous aider." }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center group p-6 rounded-3xl hover:bg-gray-50 transition duration-300">
                                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition duration-300">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= CTA HÔTE ================= */}
            <section className="py-10 px-4">
                <div className="max-w-7xl mx-auto rounded-[3rem] bg-gray-900 overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 opacity-40">
                         <img src="https://images.unsplash.com/photo-1556912173-3db9963ee790?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover grayscale" alt="Host" />
                    </div>
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-10 md:p-24">
                        <div className="text-white">
                            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block">Devenir Hôte</span>
                            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Monétisez votre espace libre.</h2>
                            <Link to="/host/add" className="inline-flex items-center bg-white text-gray-900 font-bold py-4 px-8 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all duration-300">
                                Commencer maintenant <ArrowRight className="ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="bg-white pt-20 pb-10 border-t border-gray-100 mt-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1">
                            <div className="flex items-center text-primary font-black text-2xl mb-6 tracking-tighter">
                                <MapPin className="mr-2" strokeWidth={2.5} /> NestFlow
                            </div>
                            <div className="flex space-x-4">
                                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors">
                                        <Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {[
                            { title: "Découvrir", links: ["Nouveautés", "Villas", "Appartements", "Expériences"] },
                            { title: "Héberger", links: ["Devenir hôte", "Assurance hôte", "Ressources", "Communauté"] },
                            { title: "Support", links: ["Centre d'aide", "Annulation", "Sécurité", "Contact"] },
                        ].map((col, idx) => (
                            <div key={idx}>
                                <h4 className="font-bold text-gray-900 mb-6">{col.title}</h4>
                                <ul className="space-y-4 text-gray-500 text-sm font-medium">
                                    {col.links.map((link, lIdx) => (
                                        <li key={lIdx}><a href="#" className="hover:text-primary transition">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium">
                        <p>© 2026 NestFlow Inc. Tous droits réservés.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <span className="cursor-pointer hover:text-gray-900">Confidentialité</span>
                            <span className="cursor-pointer hover:text-gray-900">Conditions</span>
                            <span className="cursor-pointer hover:text-gray-900">Plan du site</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;