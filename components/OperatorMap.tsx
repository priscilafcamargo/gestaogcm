import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, X, RefreshCcw, Clock } from 'lucide-react';
import React from 'react';

interface OperatorMapProps {
    operatorName: string;
    location: {
        lat: number;
        lng: number;
        timestamp: string;
        accuracy?: number;
    };
    onClose: () => void;
    onRefresh: () => void;
}

// Fix for default marker icon in Leaflet with Vite
const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const OperatorMap: React.FC<OperatorMapProps> = ({ operatorName, location, onClose, onRefresh }) => {
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR');
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                {/* Header */}
                <div className="p-7 border-b border-blue-900 flex justify-between items-center bg-blue-700 text-white relative">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold tracking-tight">Localização do Operador</h3>
                            <p className="text-[10px] text-blue-100 font-bold uppercase tracking-[0.2em] mt-1">{operatorName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onRefresh}
                            className="p-2.5 hover:bg-white/10 rounded-2xl transition-all"
                            title="Atualizar Localização"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Map */}
                <div className="relative" style={{ height: '500px' }}>
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={16}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[location.lat, location.lng]} icon={customIcon}>
                            <Popup>
                                <div className="text-center p-2">
                                    <p className="font-bold text-slate-800">{operatorName}</p>
                                    <p className="text-xs text-slate-500 mt-1">Última atualização</p>
                                    <p className="text-xs text-slate-600 font-medium">{formatTimestamp(location.timestamp)}</p>
                                    {location.accuracy && (
                                        <p className="text-xs text-slate-400 mt-1">Precisão: ±{Math.round(location.accuracy)}m</p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>

                {/* Footer Info */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Latitude</p>
                            <p className="font-semibold text-slate-800">{location.lat.toFixed(6)}</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Longitude</p>
                            <p className="font-semibold text-slate-800">{location.lng.toFixed(6)}</p>
                        </div>
                        <div className="text-center p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3" /> Última Atualização
                            </p>
                            <p className="font-semibold text-slate-800 text-sm">{formatTimestamp(location.timestamp)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorMap;
