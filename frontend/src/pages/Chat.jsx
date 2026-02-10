import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Send, User as UserIcon, ChevronLeft, Check, CheckCheck, Loader2 } from 'lucide-react';

const Chat = () => {
    const { propertyId, contactId } = useParams();
    const { user, fetchUnreadCount } = useContext(AuthContext);
    
    const [messages, setMessages] = useState([]);
    const [contact, setContact] = useState(null); // <--- État pour stocker les infos de l'autre personne
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef();

    // --- LOGIQUE D'URL DYNAMIQUE (Cloudinary vs Local) ---
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return `${backendUrl}${url}`;
    };

    const markAsRead = async () => {
        try {
            await api.put(`/messages/read/${propertyId}/${contactId}`);
            fetchUnreadCount(); 
        } catch (err) { 
            console.error("Erreur markAsRead", err); 
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/messages/${propertyId}/${contactId}`);
            
            // On suppose que ton API renvoie maintenant : { messages: [...], contact: {...} }
            // Si ton API ne renvoie que les messages, il faudra adapter le backend
            if (res.data.contact) {
                setContact(res.data.contact);
            }
            
            const fetchedMessages = res.data.messages || res.data;
            setMessages(fetchedMessages);
            
            if (fetchedMessages.some(m => m.receiver_id === user.id && !m.is_read)) {
                markAsRead();
            }
        } catch (err) { 
            console.error("Erreur fetchMessages", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 4000); // Polling toutes les 4s
        return () => clearInterval(interval);
    }, [propertyId, contactId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        const tempMessage = newMessage;
        setNewMessage('');

        try {
            const res = await api.post('/messages', {
                receiver_id: contactId,
                property_id: propertyId,
                content: tempMessage
            });
            setMessages(prev => [...prev, res.data]);
        } catch (err) { 
            setNewMessage(tempMessage);
            toast.error("Échec de l'envoi.");
        }
    };

    if (loading && messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-[85vh]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white shadow-2xl rounded-3xl overflow-hidden md:mt-6 border border-gray-100">
            
            {/* --- HEADER DYNAMIQUE --- */}
            <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center space-x-4">
                    <Link to="/inbox" className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </Link>
                    
                    {/* Avatar du contact */}
                    <div className="w-12 h-12 rounded-full border-2 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner">
                        {contact?.avatar_url ? (
                            <img src={getImageUrl(contact.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white font-black text-xl">
                                {contact?.username ? contact.username[0].toUpperCase() : <UserIcon size={20} />}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="font-black text-gray-900 leading-tight">
                            {contact?.username || "Chargement..."}
                        </h2>
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">En ligne</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ZONE DE MESSAGES --- */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm font-medium">
                        Dites bonjour à {contact?.username || 'votre contact'} ! 👋
                    </div>
                ) : (
                    messages.map((m, index) => {
                        const isMe = m.sender_id === user.id;
                        const isLastMessage = index === messages.length - 1;

                        return (
                            <div key={m.id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm font-medium transition-all ${
                                    isMe 
                                    ? 'bg-primary text-white rounded-tr-none shadow-rose-200' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                    {m.content}
                                    <div className={`text-[9px] mt-1 opacity-70 font-bold ${isMe ? 'text-right' : ''}`}>
                                        {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>

                                {isMe && isLastMessage && (
                                    <div className="mt-1 flex items-center text-[10px] font-bold animate-fade-in">
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
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* --- INPUT D'ENVOI --- */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t flex items-center space-x-3">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Écrire à ${contact?.username || 'votre contact'}...`}
                    className="flex-1 bg-gray-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary outline-none transition font-medium text-gray-700"
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-primary text-white p-4 rounded-2xl hover:bg-rose-600 transition shadow-lg active:scale-90 disabled:opacity-50"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default Chat;