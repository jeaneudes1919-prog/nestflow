import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MessageCircle, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Inbox = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchInbox = async () => {
            try {
                const res = await api.get('/messages/inbox');
                setConversations(res.data);
            } catch (err) {
                console.error("Erreur inbox", err);
                toast.error("Impossible de charger vos messages.");
            } finally {
                setLoading(false);
            }
        };
        fetchInbox();
    }, [user, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-gray-500 font-bold">Chargement de vos conversations...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-black mb-2 text-gray-900">Boîte de réception</h1>
            <p className="text-gray-500 mb-8 font-medium">Gérez vos échanges avec les hôtes et voyageurs.</p>

            {conversations.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">C'est bien calme ici...</h3>
                    <p className="text-gray-500 font-medium">Aucune conversation pour le moment. Réservez un logement pour discuter !</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {conversations.map((conv) => (
                        <div
                            key={`${conv.property_id}-${conv.contact_id}`}
                            onClick={() => navigate(`/chat/${conv.property_id}/${conv.contact_id}`)}
                            className={`p-6 rounded-3xl border border-transparent transition-all duration-200 cursor-pointer flex items-center justify-between group 
                                ${conv.unread_count > 0 
                                    ? 'bg-white border-primary/20 shadow-lg' 
                                    : 'bg-white hover:border-gray-200 hover:shadow-md border-gray-100'}`}
                        >
                            <div className="flex items-center space-x-5">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md">
                                        {conv.contact_name[0].toUpperCase()}
                                    </div>
                                    {/* BADGE ROUGE SI NON LU */}
                                    {conv.unread_count > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="flex items-center mb-1">
                                        <h4 className={`text-lg truncate mr-2 ${conv.unread_count > 0 ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                            {conv.contact_name}
                                        </h4>
                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-500 uppercase tracking-wide truncate max-w-[150px]">
                                            {conv.property_title}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate w-full md:w-96 ${conv.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                        {conv.unread_count > 0 ? "Nouveau message : " : ""}{conv.last_message}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="text-xs font-bold text-gray-400 block mb-1">
                                    {new Date(conv.created_at).toLocaleDateString()}
                                </span>
                                <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ml-auto group-hover:bg-primary group-hover:text-white transition">
                                    <MessageCircle size={16} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Inbox;