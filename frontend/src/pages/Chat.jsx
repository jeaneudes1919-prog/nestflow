import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
// 1. IMPORT DE TOAST
import toast from 'react-hot-toast';
import { Send, User as UserIcon, ChevronLeft, Check, CheckCheck } from 'lucide-react';

const Chat = () => {
    const { propertyId, contactId } = useParams();
    const { user, fetchUnreadCount } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef();

    // Fonction pour marquer les messages reçus comme lus
    const markAsRead = async () => {
        try {
            await api.put(`/messages/read/${propertyId}/${contactId}`);
            fetchUnreadCount(); 
        } catch (err) { 
            console.error("Erreur background markAsRead", err); 
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/messages/${propertyId}/${contactId}`);
            setMessages(res.data);
            
            // Si le dernier message reçu n'est pas lu, on lance la mise à jour
            if (res.data.some(m => m.receiver_id === user.id && !m.is_read)) {
                markAsRead();
            }
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 4000);
        return () => clearInterval(interval);
    }, [propertyId, contactId]);

    // Scroll automatique
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        // On garde le message en mémoire au cas où ça plante
        const tempMessage = newMessage;
        setNewMessage(''); // On vide l'input tout de suite pour la fluidité (UX)

        try {
            const res = await api.post('/messages', {
                receiver_id: contactId,
                property_id: propertyId,
                content: tempMessage
            });
            setMessages([...messages, res.data]);
        } catch (err) { 
            // En cas d'erreur, on remet le message dans l'input et on alerte
            setNewMessage(tempMessage);
            toast.error("Impossible d'envoyer le message. Vérifiez votre connexion.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white shadow-2xl rounded-3xl overflow-hidden md:mt-6 border border-gray-100">
            {/* Header du Chat */}
            <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center space-x-4">
                    <Link to="/inbox" className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </Link>
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
                        <UserIcon size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 leading-tight">Discussion privée</h2>
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">En ligne</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zone de Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-400 text-sm font-medium">
                        Dites bonjour ! Commencez la discussion. 👋
                    </div>
                )}
                
                {messages.map((m, index) => {
                    const isMe = m.sender_id === user.id;
                    const isLastMessage = index === messages.length - 1;

                    return (
                        <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm font-medium transition-all ${
                                isMe 
                                ? 'bg-primary text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                            }`}>
                                {m.content}
                                <div className={`text-[9px] mt-1 opacity-70 font-bold ${isMe ? 'text-right' : ''}`}>
                                    {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>

                            {/* INDICATEUR VU */}
                            {isMe && isLastMessage && (
                                <div className="mt-1 flex items-center text-[10px] font-bold transition-all animate-fade-in">
                                    {m.is_read ? (
                                        <span className="flex items-center text-blue-500">
                                            <CheckCheck size={12} className="mr-1" /> Vu
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-gray-400">
                                            <Check size={12} className="mr-1" /> Envoyé
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input d'envoi */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t flex items-center space-x-3">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Posez une question..."
                    className="flex-1 bg-gray-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary outline-none transition font-medium text-gray-700 placeholder-gray-400"
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-primary text-white p-4 rounded-2xl hover:bg-rose-600 transition shadow-lg active:scale-90 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default Chat;