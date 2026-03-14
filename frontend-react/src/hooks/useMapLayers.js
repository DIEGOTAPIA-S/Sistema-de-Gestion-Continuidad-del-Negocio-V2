import { useState } from 'react';

/**
 * Custom hook para gestionar los estados de visibilidad de las capas en el mapa.
 */
const useMapLayers = () => {
    const [showEarthquakes, setShowEarthquakes] = useState(false);
    const [showWeather, setShowWeather] = useState(false);
    const [showTraffic, setShowTraffic] = useState(false);
    const [showInfrastructure, setShowInfrastructure] = useState(false);
    const [showColaboradores, setShowColaboradores] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showNews, setShowNews] = useState(false);

    const toggleEarthquakes = () => setShowEarthquakes(prev => !prev);
    const toggleWeather = () => setShowWeather(prev => !prev);
    const toggleTraffic = () => setShowTraffic(prev => !prev);
    const toggleInfrastructure = () => setShowInfrastructure(prev => !prev);
    const toggleColaboradores = () => setShowColaboradores(prev => !prev);
    const toggleHeatmap = () => setShowHeatmap(prev => !prev);
    const toggleNews = () => setShowNews(prev => !prev);

    return {
        showEarthquakes, setShowEarthquakes, toggleEarthquakes,
        showWeather, setShowWeather, toggleWeather,
        showTraffic, setShowTraffic, toggleTraffic,
        showInfrastructure, setShowInfrastructure, toggleInfrastructure,
        showColaboradores, setShowColaboradores, toggleColaboradores,
        showHeatmap, setShowHeatmap, toggleHeatmap,
        showNews, setShowNews, toggleNews,
    };
};

export default useMapLayers;
