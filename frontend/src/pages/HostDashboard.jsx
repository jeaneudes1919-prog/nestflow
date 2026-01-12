import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import api from '../services/api';
// 1. IMPORT TOAST
import toast from 'react-hot-toast';
import { 
  BarChart3, Users, Home, Wallet, Edit3, Trash2, 
  Clock, Loader2 
} from 'lucide-react';

const HostDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/properties/host/stats');
      setData(res.data);
    } catch (err) { 
      console.error("Erreur stats:", err); 
      toast.error("Impossible de charger les statistiques.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const deleteProperty = async (id, activeBookings) => {
    if (Number(activeBookings) > 0) {
      return toast.error("Suppression impossible : des réservations sont en cours.");
    }

    // CONFIRMATION CUSTOM (TOAST)
    toast((t) => (
      <div className="flex flex-col items-center space-y-3">
        <span className="font-bold text-gray-800">Supprimer définitivement ?</span>
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
                await api.delete(`/properties/${id}`);
                toast.success("Annonce supprimée !");
                fetchDashboard(); // Rafraîchir la liste
              } catch (err) {
                toast.error("Erreur lors de la suppression");
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition"
          >
            Confirmer
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-gray-500 font-bold">Analyse de vos performances...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">Tableau de bord Hôte</h1>
        <p className="text-gray-500 font-medium mt-1">Gérez votre activité et suivez vos performances.</p>
      </div>

      {/* SECTION STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Revenus totaux" value={`${data.summary.total_revenue}€`} icon={<Wallet size={24}/>} color="bg-green-500" />
        <StatCard title="Total Clients" value={data.summary.total_clients} icon={<Users size={24}/>} color="bg-blue-500" />
        <StatCard title="Annonces en ligne" value={data.summary.total_posts} icon={<Home size={24}/>} color="bg-purple-500" />
        <StatCard title="Demandes en attente" value={data.summary.pending_requests} icon={<Clock size={24}/>} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900">Mes Annonces</h2>
            <Link to="/host/add" className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-lg">
                + Ajouter un bien
            </Link>
          </div>
          
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
            {data.myProperties.length === 0 ? (
                <div className="p-10 text-center text-gray-500 font-medium">
                    Vous n'avez pas encore publié d'annonce.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Bien</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Prix/Nuit</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Statut</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.myProperties.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition group">
                            <td className="px-6 py-4 font-bold text-gray-800">{p.title}</td>
                            <td className="px-6 py-4 font-bold text-gray-600">{p.price_per_night}€</td>
                            <td className="px-6 py-4">
                            {Number(p.active_bookings) > 0 ? (
                                <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wide border border-blue-100">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                {p.active_bookings} Réserv.
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wide border border-green-100">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                Libre
                                </span>
                            )}
                            </td>
                            <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                onClick={() => {
                                    if (Number(p.active_bookings) === 0) {
                                    navigate(`/host/edit/${p.id}`);
                                    } else {
                                    toast.error("Impossible de modifier une annonce active.");
                                    }
                                }}
                                className={`p-2 rounded-xl transition ${
                                    Number(p.active_bookings) > 0 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
                                }`}
                                title="Modifier"
                                >
                                <Edit3 size={16} />
                                </button>
                                <button 
                                onClick={() => deleteProperty(p.id, p.active_bookings)}
                                className={`p-2 rounded-xl transition ${
                                    Number(p.active_bookings) > 0 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600'
                                }`}
                                title="Supprimer"
                                >
                                <Trash2 size={16} />
                                </button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>

        {/* Conseils */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900">Conseils Pro</h2>
          <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            
            <BarChart3 className="text-primary mb-6 relative z-10" size={40} />
            <h3 className="font-bold text-xl mb-3 relative z-10">La réactivité est clé</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed relative z-10">
                Les hôtes qui répondent en moins d'une heure obtiennent 2x plus de réservations. Vérifiez vos messages régulièrement.
            </p>
            <Link to="/inbox" className="inline-block bg-white text-gray-900 px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-primary hover:text-white transition shadow-lg relative z-10">
              Voir ma messagerie
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-50 flex items-center space-x-4 hover:shadow-xl hover:-translate-y-1 transition duration-300">
    <div className={`p-4 rounded-2xl text-white shadow-md ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

export default HostDashboard;