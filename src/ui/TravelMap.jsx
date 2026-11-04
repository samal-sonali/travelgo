import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { ArrowRight, CloudSun, Hotel, MapPin, Sparkles } from 'lucide-react';
import { destinations, imageUrl } from '../data/travel.js';
import { guides } from '../data/planner.js';

const places = destinations.map((d) => ({ ...d, lat: guides[d.slug].lat, lon: guides[d.slug].lon }));
const regions = ['All', ...new Set(places.map((p) => p.region))];
const pinIcon = (label, active) => L.divIcon({ className: 'map-pin-wrap', iconSize: null, popupAnchor: [0, -38], html: `<span class="map-pin${active ? ' is-active' : ''}">${label}</span>` });

function MapController({ shown, focus, markers }) {
  const map = useMap();
  useEffect(() => {
    if (focus) return;
    map.flyToBounds(L.latLngBounds(shown.map((p) => [p.lat, p.lon])), { padding: [50, 50], maxZoom: 5, duration: 0.9 });
  }, [shown, focus, map]);
  useEffect(() => {
    if (!focus) return undefined;
    const open = () => markers.current[focus.slug]?.openPopup();
    map.once('moveend', open);
    map.flyTo([focus.lat, focus.lon], 7, { duration: 1.2 });
    return () => map.off('moveend', open);
  }, [focus, map, markers]);
  return null;
}

export default function TravelMap({ height = 460 }) {
  const [region, setRegion] = useState('All');
  const [focus, setFocus] = useState(null);
  const markers = useRef({});
  const shown = useMemo(() => places.filter((p) => region === 'All' || p.region === region), [region]);

  return <div className="travel-map">
    <div className="map-sidebar">
      <div className="type-chips">{regions.map((r) => <button key={r} type="button" className={region === r ? 'chip-active' : ''} onClick={() => { setRegion(r); setFocus(null); }}>{r}</button>)}</div>
      <ul className="map-list">{shown.map((p) => <li key={p.slug}><button type="button" className={focus?.slug === p.slug ? 'is-active' : ''} onClick={() => setFocus(p)}>
        <img src={imageUrl(p.image, 120)} alt="" /><span><strong>{p.name}</strong><small>{p.country} · from {p.price}</small></span><MapPin size={15} />
      </button></li>)}</ul>
    </div>
    <div className="map-canvas" style={{ height }}>
      <MapContainer center={[20, 60]} zoom={2} minZoom={2} scrollWheelZoom={false} worldCopyJump style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' subdomains="abcd" />
        <MapController shown={shown} focus={focus} markers={markers} />
        {shown.map((p) => <Marker key={p.slug} position={[p.lat, p.lon]} icon={pinIcon(p.price, focus?.slug === p.slug)} ref={(m) => { if (m) markers.current[p.slug] = m; }} eventHandlers={{ click: () => setFocus(p) }}>
          <Popup className="map-popup" closeButton={false}>
            <img src={imageUrl(p.image, 400)} alt={p.name} />
            <div className="map-popup-body">
              <span>{p.tag}</span><strong>{p.name}, {p.country}</strong><small>{p.days} · from {p.price}</small>
              <div className="map-popup-links">
                <Link to={`/planner?destination=${p.slug}`}><Sparkles size={13} /> Plan</Link>
                <Link to={`/hotels?destination=${p.slug}`}><Hotel size={13} /> Hotels</Link>
                <Link to={`/weather?place=${p.slug}`}><CloudSun size={13} /> Weather</Link>
              </div>
              <Link to="/destinations" className="map-popup-more">Explore <ArrowRight size={13} /></Link>
            </div>
          </Popup>
        </Marker>)}
      </MapContainer>
    </div>
  </div>;
}
