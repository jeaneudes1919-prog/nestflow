import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
// 1. On importe le toast
import toast from 'react-hot-toast';
import { Search, MapPin, Star, Heart, SlidersHorizontal, ArrowRight, Loader2 } from 'lucide-react';

const AllProperties = () => {
  const [allProperties, setAllProperties] = useState([]); 
  const [filteredProperties, setFilteredProperties] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState(1000); 
  const [maxPriceInDb, setMaxPriceInDb] = useState(1000);

  // 1. Chargement initial
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/properties');
        const properties = res.data;
        
        setAllProperties(properties);
        setFilteredProperties(properties); 

        // Calcul dynamique du prix max
        if (properties.length > 0) {
          const highestPrice = Math.max(...properties.map(p => parseFloat(p.price_per_night)));
          const ceiling = Math.ceil(highestPrice / 100) * 100;
          setMaxPriceInDb(ceiling); 
          setPriceRange(ceiling);   
        }

      } catch (err) {
        console.error("Erreur", err);
        // 2. Alerte utilisateur si le serveur ne répond pas
        toast.error("Impossible de charger les logements.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // 2. Moteur de Filtrage
  useEffect(() => {
    let result = allProperties;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(lowerTerm) || 
        p.location.toLowerCase().includes(lowerTerm)
      );
    }

    result = result.filter(p => parseFloat(p.price_per_night) <= priceRange);
    setFilteredProperties(result);
  }, [searchTerm, priceRange, allProperties]);

  // Petit bonus : fonction pour le bouton favoris
  const handleFavorite = (e) => {
    e.preventDefault(); // Empêche de cliquer sur le lien de la carte
    e.stopPropagation();
    toast("La liste de favoris arrive bientôt !", {
        icon: '❤️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Explorer les logements</h1>
            <p className="text-gray-500 mt-2">Trouvez la perle rare parmi nos {allProperties.length} offres disponibles.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR FILTRES --- */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center">
                  <SlidersHorizontal size={18} className="mr-2"/> Filtres
                </h3>
                <span className="text-xs text-gray-400">{filteredProperties.length} résultats</span>
              </div>

              {/* Recherche Texte */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination ou mot-clé</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ex: Cotonou, Villa..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Slider Prix DYNAMIQUE */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Budget max / nuit</label>
                  <span className="text-sm font-bold text-primary">{priceRange}€</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={maxPriceInDb} 
                  step="10"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0€</span>
                  <span>{maxPriceInDb}€</span>
                </div>
              </div>

              {/* Reset Filtres */}
              <button 
                  onClick={() => {setSearchTerm(''); setPriceRange(maxPriceInDb);}}
                  className="w-full py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                  Réinitialiser
              </button>
            </div>
          </aside>

          {/* --- GRILLE RÉSULTATS --- */}
          <main className="w-full lg:w-3/4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                 <Loader2 className="animate-spin mb-4 text-primary" size={40} />
                 <p>Chargement des meilleures offres...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="text-gray-400" size={30}/>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Aucun résultat</h3>
                <p className="text-gray-500">Aucun logement ne correspond à vos critères.</p>
                <button 
                  onClick={() => {setSearchTerm(''); setPriceRange(maxPriceInDb);}}
                  className="mt-4 text-primary font-medium hover:underline"
                >
                  Tout afficher
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <Link key={property.id} to={`/property/${property.id}`} className="group block h-full">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 h-full flex flex-col">
                      
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                        <img 
                          src={property.image_url 
                            ? `http://localhost:5000${property.image_url}` 
                            : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'} 
                          alt={property.title}
                          className="object-cover w-full h-full group-hover:scale-110 transition duration-500"
                        />
                        {/* 3. Bouton Favoris avec Interaction */}
                        <button 
                            onClick={handleFavorite}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition z-10"
                        >
                           <Heart size={18} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-900 truncate pr-2">{property.title}</h3>
                          <div className="flex items-center text-xs font-bold text-gray-800">
                             {/* 4. Affichage de la vraie note moyenne si elle existe */}
                            <Star size={12} className="text-yellow-400 fill-current mr-1"/> 
                            {property.average_rating ? property.average_rating : "Nouveau"}
                          </div>
                        </div>
                        
                        <p className="text-gray-500 text-sm mb-4 flex items-center">
                          <MapPin size={14} className="mr-1 text-gray-400"/> {property.location}
                        </p>
                        
                        <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-lg text-gray-900">{property.price_per_night}€</span>
                            <span className="text-gray-400 text-xs"> / nuit</span>
                          </div>
                          <span className="p-2 bg-gray-50 rounded-full group-hover:bg-primary group-hover:text-white transition">
                            <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllProperties;