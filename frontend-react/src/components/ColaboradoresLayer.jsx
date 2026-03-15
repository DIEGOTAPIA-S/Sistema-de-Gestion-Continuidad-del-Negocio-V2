import React, { useState, useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

// Icono personalizado para Colaboradores (Azul/Usuario)
const colaboradorIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const ColaboradoresLayer = ({ visible, colaboradores }) => {
    const map = useMap();

    if (!visible || !colaboradores || colaboradores.length === 0) return null;

    // Filtro básico (opcional: solo mostrar si tienen lat/lon)
    const validPoints = colaboradores.filter(c => c.latitud && c.longitud);

    return (
        <MarkerClusterGroup
            chunkedLoading
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            iconCreateFunction={(cluster) => {
                const count = cluster.getChildCount();
                return L.divIcon({
                    html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 14px;">${count}</div>`,
                    className: 'custom-cluster-icon',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
            }}
        >
            {validPoints.map((colab) => (
                <Marker
                    key={colab.id}
                    position={[colab.latitud, colab.longitud]}
                    zIndexOffset={-100}
                    icon={colaboradorIcon}
                >
                    <Popup>
                        <div className="p-2" style={{ minWidth: '200px' }}>
                            <h3 className="font-bold text-gray-800" style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>
                                {colab.nombres} {colab.apellidos}
                            </h3>
                            <p className="text-sm text-gray-600" style={{ margin: 0, fontWeight: 500 }}>{colab.cargo}</p>
                            <p className="text-xs text-gray-500 mt-1" style={{ margin: '5px 0 0 0', lineHeight: '1.4' }}>
                                <strong>Área:</strong> {colab.area}<br />
                                <strong>Gerencia:</strong> {colab.gerencia}<br />
                                <strong>Compañía:</strong> {colab.compania || 'N/A'}<br />
                                <strong>Modalidad:</strong> {colab.modalidad}<br />
                                <strong>Email:</strong> {colab.email || 'N/A'}<br />
                                <strong>Dirección:</strong> {colab.direccion || 'N/A'}
                            </p>
                            {colab.sede_asignada && (
                                <div className="mt-2 text-xs bg-blue-100 text-blue-800 p-1 rounded" style={{ marginTop: '8px', padding: '4px', background: '#dbeafe', color: '#1e40af', borderRadius: '4px' }}>
                                    🏢 Sede: {colab.sede_nombre || 'Asignada'}
                                </div>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MarkerClusterGroup>
    );
};

export default ColaboradoresLayer;
