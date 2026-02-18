import { useState, useEffect } from 'react';
import api from '../services/api';

const NewsFeed = ({ isOpen, onClose }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('movilidad');
    const [isExpanded, setIsExpanded] = useState(false);

    const topics = {
        movilidad: { label: '🚦 Movilidad', query: 'Bogotá Movilidad' },
        orden: { label: '🛡️ Orden Público', query: 'Colombia Paro' },
        clima: { label: '⛈️ Clima', query: 'Colombia Alertas Ideam' }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNews(topics[activeTab].query);
        }
    }, [isOpen, activeTab]);

    const fetchNews = async (query) => {
        setLoading(true);
        try {
            const response = await api.get(`/news/?q=${query}`);
            setNews(response.data);
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Calcular tiempo relativo (ej. "hace 2 horas")
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (isNaN(diffInSeconds)) return dateString; // Fallback si no parsea bien

        if (diffInSeconds < 60) return 'hace momentos';
        if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
        return `hace ${Math.floor(diffInSeconds / 86400)} d`;
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: isExpanded ? '800px' : '400px', // Dynamic width
            maxWidth: '100vw',
            background: 'white',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
            zIndex: 5000,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease-in-out, transform 0.3s ease-in-out',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}>
            {/* Header */}
            <div style={{ padding: '20px', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📰 Sala de Noticias
                    </h2>
                    {/* Expand Toggle Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? "Contraer" : "Expandir"}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px', padding: '4px 8px' }}
                    >
                        {isExpanded ? '⇥⇤' : '⇤⇥'}
                    </button>
                </div>
                <button
                    onClick={onClose}
                    title="Cerrar Noticias"
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    &times;
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                {Object.entries(topics).map(([key, { label }]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: activeTab === key ? 'white' : '#f8fafc',
                            border: 'none',
                            borderBottom: activeTab === key ? '2px solid #2563eb' : 'none',
                            color: activeTab === key ? '#2563eb' : '#64748b',
                            fontWeight: activeTab === key ? 'bold' : 'normal',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#f1f5f9' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Cargando noticias... ⏳</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {news.map((item, index) => (
                            <div key={index} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1rem', lineHeight: '1.4' }}>{item.title}</h4>

                                    {/* Summary/Description Display */}
                                    {item.summary && (
                                        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 10px 0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: isExpanded ? 4 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {item.summary}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                                        <span style={{ fontWeight: '500', color: '#475569' }}>{item.source}</span>
                                        <span>{getRelativeTime(item.published)}</span>
                                    </div>
                                </a>
                            </div>
                        ))}
                        {news.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                                No se encontraron noticias recientes para este tema.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.7rem', color: '#cbd5e1', background: '#1e293b' }}>
                Fuente: Google News RSS
            </div>
        </div>
    );
};

export default NewsFeed;
