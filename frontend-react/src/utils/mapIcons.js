import L from 'leaflet';

// Base64 SVGs for reliability
const greenCross = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzIyYzU1ZSI+PHBhdGggZD0iTTE5IDEwaC02VjRoLTJ2Nkg1djJoNnY2aDJ2LTZoNnoiLz48L3N2Zz4=';
const redCross = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2VmNDQ0NCI+PHBhdGggZD0iTTE5IDEwaC02VjRoLTJ2Nkg1djJoNnY2aDJ2LTZoNnoiLz48L3N2Zz4=';
const orangeCross = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y5NzMxNiI+PHBhdGggZD0iTTE5IDEwaC02VjRoLTJ2Nkg1djJoNnY2aDJ2LTZoNnoiLz48L3N2Zz4=';

// Custom Marker Function to create icons with colors and white background circle
const createCrossIcon = (color, base64) => {
    return new L.Icon({
        iconUrl: base64,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
        className: '', // Remove default class to avoid conflicts
        // We can use a divIcon for more complex styling if needed, but simple image is safest for now
    });
};

// Icono Verde (Normal / Operativa) - Plus symbol with Green Color
export const normalIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; border: 2px solid #22c55e;">
             <span style="color: #22c55e; font-size: 24px; font-weight: bold;">+</span>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

// Icono Rojo (Afectada)
export const dangerIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; border: 2px solid #ef4444;">
             <span style="color: #ef4444; font-size: 24px; font-weight: bold;">+</span>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

// Icono Naranja (Cercana / Alerta)
export const warningIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; border: 2px solid #f97316;">
             <span style="color: #f97316; font-size: 24px; font-weight: bold;">+</span>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});
