import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  Heart,
  Users,
  DollarSign,
  Phone,
  Home,
  Calendar,
  Activity,
  TrendingUp,
  MapPin,
  Bell,
  ChevronDown,
  ChevronUp,
  Smile,
  Meh,
  Frown,
  MessageCircle,
  ThumbsUp,
  CheckCircle2,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

// --- Types & Interfaces ---

type RiskLevel = 'High' | 'Moderate' | 'Low';
type CountyId = 'Jeongseon-gun' | 'Yanggu-gun' | 'Inje-gun';
type ViewMode = 'overview' | 'careworker' | 'elderly';

interface Elder {
  id: number;
  name: string;
  nameEn: string;
  age: number;
  county: CountyId;
  riskScore: number;
  riskLevel: RiskLevel;
  health: number;
  Psychosocial: number;
  economic: number;
  lastContact: string;
  alerts: string[];
  history: string[];
  lat: number;
  lng: number;
}

interface InterventionAction {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

interface ElderTemplate {
  name: string;
  nameEn: string;
  age: number;
  baseScore: number;
  health: number;
  Psychosocial: number;
  economic: number;
  lastContact: string;
  alerts: string[];
  history: string[];
}

// --- Configuration & Data Generation ---

const COUNTY_CONFIG: Record<
  CountyId,
  { color: string; mapFillColor: string; shortLabel: string; spawnBounds: { minLat: number, maxLat: number, minLng: number, maxLng: number } }
> = {
  'Jeongseon-gun': {
    color: '#e63946',
    mapFillColor: '#d97706', // Light Brown
    shortLabel: 'Jeongseon',
    spawnBounds: { minLat: 37.30, maxLat: 37.45, minLng: 128.60, maxLng: 128.80 }
  },
  'Yanggu-gun': {
    color: '#457b9d',
    mapFillColor: '#3b82f6', // Blue
    shortLabel: 'Yanggu',
    spawnBounds: { minLat: 38.05, maxLat: 38.25, minLng: 127.95, maxLng: 128.10 }
  },
  'Inje-gun': {
    color: '#2a9d8f',
    mapFillColor: '#8b5cf6', // Purple
    shortLabel: 'Inje',
    spawnBounds: { minLat: 37.90, maxLat: 38.20, minLng: 128.20, maxLng: 128.45 }
  },
};

const COUNTY_POLYGONS: Record<CountyId, [number, number][]> = {
  'Yanggu-gun': [
    [38.28, 127.92], [38.28, 128.12], [38.15, 128.14], [38.02, 128.08], [38.02, 127.95], [38.15, 127.90]
  ],
  'Inje-gun': [
    [38.25, 128.18], [38.25, 128.50], [38.00, 128.55], [37.85, 128.40], [37.90, 128.20], [38.10, 128.18]
  ],
  'Jeongseon-gun': [
    [37.55, 128.60], [37.50, 128.90], [37.30, 128.95], [37.15, 128.80], [37.20, 128.55], [37.40, 128.50]
  ]
};

const ELDER_TEMPLATES: ElderTemplate[] = [
  {
    name: '김영희',
    nameEn: 'Kim Young-hee',
    age: 78,
    baseScore: 82,
    health: 75,
    Psychosocial: 88,
    economic: 72,
    lastContact: '5 days ago',
    alerts: ['No water usage for 36 hours', 'Missed weekly check-in call'],
    history: ['Lives alone', 'Decreased mobility', 'Limited family contact'],
  },
  {
    name: '박철수',
    nameEn: 'Park Chul-soo',
    age: 82,
    baseScore: 65,
    health: 58,
    Psychosocial: 52,
    economic: 40,
    lastContact: '2 days ago',
    alerts: ['Reduced Psychosocial activity participation'],
    history: ['Regular community center visits', 'Good family support'],
  },
  {
    name: '이순자',
    nameEn: 'Lee Soon-ja',
    age: 74,
    baseScore: 28,
    health: 30,
    Psychosocial: 33,
    economic: 22,
    lastContact: '1 day ago',
    alerts: [],
    history: ['Active in community', 'Regular medical check-ups'],
  },
  {
    name: '최미정',
    nameEn: 'Choi Mi-jung',
    age: 81,
    baseScore: 76,
    health: 70,
    Psychosocial: 80,
    economic: 68,
    lastContact: '7 days ago',
    alerts: ['Two missed clinic appointments'],
    history: ['Widowed', 'Occasional help from neighbour'],
  },
  {
    name: '정우성',
    nameEn: 'Jung Woo-sung',
    age: 79,
    baseScore: 49,
    health: 52,
    Psychosocial: 42,
    economic: 45,
    lastContact: '3 days ago',
    alerts: ['Stopped attending weekly walking group'],
    history: ['Ex-farmer', 'Children live in Seoul'],
  },
  {
    name: '한지윤',
    nameEn: 'Han Ji-yoon',
    age: 72,
    baseScore: 34,
    health: 40,
    Psychosocial: 50,
    economic: 28,
    lastContact: 'Yesterday',
    alerts: [],
    history: ['Helps run community kitchen', 'Good peer network'],
  },
  {
    name: '오승호',
    nameEn: 'Oh Seung-ho',
    age: 85,
    baseScore: 87,
    health: 80,
    Psychosocial: 60,
    economic: 55,
    lastContact: '10 days ago',
    alerts: ['No electricity usage for 24 hours'],
    history: ['Recently discharged from hospital', 'Lives on steep hillside'],
  },
  {
    name: '윤정순',
    nameEn: 'Yoon Jung-soon',
    age: 77,
    baseScore: 61,
    health: 62,
    Psychosocial: 70,
    economic: 50,
    lastContact: '4 days ago',
    alerts: ['Missed one AI phone check-in'],
    history: ['Regular at senior centre', 'Cares for younger sibling'],
  },
  {
    name: '강민수',
    nameEn: 'Kang Min-soo',
    age: 80,
    baseScore: 43,
    health: 48,
    Psychosocial: 39,
    economic: 32,
    lastContact: '6 days ago',
    alerts: ['Irregular medication pick-up'],
    history: ['Diabetes diagnosis', 'Occasional alcohol use'],
  },
  {
    name: '임수진',
    nameEn: 'Lim Su-jin',
    age: 75,
    baseScore: 32,
    health: 35,
    Psychosocial: 45,
    economic: 25,
    lastContact: 'Today',
    alerts: [],
    history: ['Participates in church group', 'Nearby niece visits weekly'],
  },
];

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
};

const buildElderData = (): Elder[] => {
  const counties: CountyId[] = ['Jeongseon-gun', 'Yanggu-gun', 'Inje-gun'];
  const elders: Elder[] = [];
  const total = 50;
  let id = 1;

  for (let i = 0; i < total; i += 1) {
    const tmpl = ELDER_TEMPLATES[i % ELDER_TEMPLATES.length];
    const county = counties[i % counties.length];
    const bounds = COUNTY_CONFIG[county].spawnBounds;
    const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
    const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
    const riskScoreBase = tmpl.baseScore + ((i % 7) - 3); 
    const riskScore = Math.max(15, Math.min(95, riskScoreBase));

    elders.push({
      id,
      name: tmpl.name,
      nameEn: tmpl.nameEn,
      age: tmpl.age + (i % 4),
      county,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      health: tmpl.health,
      Psychosocial: tmpl.Psychosocial,
      economic: tmpl.economic,
      lastContact: tmpl.lastContact,
      alerts: tmpl.alerts,
      history: tmpl.history,
      lat,
      lng,
    });

    id += 1;
  }

  return elders;
};

const elderlyData: Elder[] = buildElderData();

const interventionActions: InterventionAction[] = [
  { icon: Phone, label: 'Emergency Call', priority: 'urgent' },
  { icon: Home, label: 'Home Visit', priority: 'urgent' },
  { icon: Activity, label: 'Health Check-up', priority: 'high' },
  { icon: Users, label: 'Community Event', priority: 'medium' },
  { icon: Calendar, label: 'Schedule Follow-up', priority: 'medium' },
  { icon: Heart, label: 'Wellness Check', priority: 'low' },
];

const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'High': return 'bg-red-500';
    case 'Moderate': return 'bg-yellow-500';
    case 'Low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getRiskHexColor = (level: RiskLevel): string => {
  switch (level) {
    case 'High': return '#ef4444';
    case 'Moderate': return '#f59e0b';
    case 'Low': return '#22c55e';
    default: return '#6b7280';
  }
};

const getRiskBorderColor = (level: RiskLevel): string => {
  switch (level) {
    case 'High': return 'border-red-500';
    case 'Moderate': return 'border-yellow-500';
    case 'Low': return 'border-green-500';
    default: return 'border-gray-500';
  }
};

const LeafletMap: React.FC<{ elders: Elder[], onMarkerClick: (e: Elder) => void }> = ({ elders, onMarkerClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Leaflet map instance
  const [libLoaded, setLibLoaded] = useState(false);

  useEffect(() => {
    if (document.getElementById('leaflet-css')) {
      setLibLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLibLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (libLoaded && mapContainerRef.current && !mapInstanceRef.current) {
      const L = (window as any).L;
      const corner1 = L.latLng(37.0, 127.0);
      const corner2 = L.latLng(38.8, 129.6);
      const bounds = L.latLngBounds(corner1, corner2);
      const map = L.map(mapContainerRef.current, {
        center: [37.8, 128.3],
        zoom: 9,
        minZoom: 8,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);
      mapInstanceRef.current = map;
    }
  }, [libLoaded]);

  useEffect(() => {
    if (libLoaded && mapInstanceRef.current) {
      const L = (window as any).L;
      const map = mapInstanceRef.current;
      map.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) return;
        map.removeLayer(layer);
      });

      const gangwonIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="font-size: 16px; font-weight: 800; color: #64748b; letter-spacing: 2px; text-transform: uppercase; text-shadow: 2px 2px 0px #fff;">GANGWON-DO</div>`,
        iconSize: [200, 30],
        iconAnchor: [100, 15]
      });
      L.marker([37.8, 128.8], { icon: gangwonIcon, interactive: false }).addTo(map);

      Object.entries(COUNTY_POLYGONS).forEach(([countyId, coords]) => {
        const config = COUNTY_CONFIG[countyId as CountyId];
        L.polygon(coords, {
          color: config.mapFillColor,
          fillColor: config.mapFillColor,
          fillOpacity: 0.15,
          weight: 2,
          opacity: 0.8,
          dashArray: '5, 5'
        }).addTo(map);
      });

      elders.forEach((elder) => {
        const isClickable = elder.county === 'Inje-gun';
        const radius = elder.riskLevel === 'High' ? 10 : elder.riskLevel === 'Moderate' ? 8 : 6;
        const riskColor = getRiskHexColor(elder.riskLevel);
        const marker = L.circleMarker([elder.lat, elder.lng], {
          radius: radius,
          fillColor: riskColor, 
          color: '#fff',
          weight: 1.5,
          opacity: isClickable ? 1 : 0.5,
          fillOpacity: isClickable ? 0.9 : 0.4
        });

        if (isClickable) {
          marker.on('mouseover', function (this: any) { this._path.style.cursor = 'pointer'; });
        } else {
           marker.on('mouseover', function (this: any) { this._path.style.cursor = 'default'; });
        }

        const tooltipText = isClickable 
          ? `<div style="text-align: center">
              <strong>${elder.nameEn}</strong><br/>
              Risk: <span style="color:${riskColor}; font-weight:bold">${elder.riskLevel}</span><br/>
              <span style="font-size:10px; color:blue">Click to view</span>
             </div>`
          : `<div style="text-align: center; color:gray">
              <strong>${elder.nameEn}</strong><br/>
              (${elder.county})<br/>
              <span style="font-size:10px">Not assigned to you</span>
             </div>`;

        marker.bindTooltip(tooltipText, { direction: 'top', offset: [0, -5] });
        marker.on('click', () => {
          if (isClickable) {
            onMarkerClick(elder);
          }
        });
        marker.addTo(map);
      });
    }
  }, [libLoaded, elders, onMarkerClick]);

  if (!libLoaded) return <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">Loading Map...</div>;
  return <div ref={mapContainerRef} className="h-full w-full z-0" />;
};

const HalmoniRiskIndex: React.FC = () => {
  const [view, setView] = useState<ViewMode>('overview');
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);

  const highCount = elderlyData.filter((e) => e.riskLevel === 'High').length;
  const moderateCount = elderlyData.filter((e) => e.riskLevel === 'Moderate').length;
  const lowCount = elderlyData.filter((e) => e.riskLevel === 'Low').length;

  const handleMarkerClick = (elder: Elder) => {
    setSelectedElder(elder);
    setView('careworker');
  };

  const OverviewView: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">HALMONI (할머니)</h1>
        <p className="text-xl opacity-90">Health And Loneliness Monitoring – Outreach Network Initiative </p>
        <p className="mt-4 text-sm opacity-80">Predictive Risk Index for Rural Elder Care in Gangwon Province</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 transform transition hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">High Risk</h3>
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <p className="text-4xl font-bold text-red-500">{highCount}</p>
          <p className="text-sm text-gray-600 mt-2">Requires immediate attention</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 transform transition hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Moderate Risk</h3>
            <TrendingUp className="text-yellow-500" size={24} />
          </div>
          <p className="text-4xl font-bold text-yellow-500">{moderateCount}</p>
          <p className="text-sm text-gray-600 mt-2">Monitor closely</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 transform transition hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Low Risk</h3>
            <Heart className="text-green-500" size={24} />
          </div>
          <p className="text-4xl font-bold text-green-500">{lowCount}</p>
          <p className="text-sm text-gray-600 mt-2">Regular check-ins</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Pilot Map – Gangwon-do</h2>
        <p className="text-sm text-gray-600 mb-4">Risk distribution map for Jeongseon, Yanggu, and Inje counties.</p>
        <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200 relative z-0">
          <LeafletMap elders={elderlyData} onMarkerClick={handleMarkerClick} />
        </div>
        <div className="flex flex-wrap gap-6 mt-4 text-xs text-gray-600 justify-center">
           <div className="flex items-center gap-4 border-r pr-6">
              <span className="font-bold text-gray-800">RISK LEVELS:</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskHexColor('High') }} />
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskHexColor('Moderate') }} />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getRiskHexColor('Low') }} />
                <span>Low</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <span className="font-bold text-gray-800">REGIONS:</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm opacity-50" style={{ backgroundColor: COUNTY_CONFIG['Yanggu-gun'].mapFillColor }} />
                <span>Yanggu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm opacity-50" style={{ backgroundColor: COUNTY_CONFIG['Inje-gun'].mapFillColor }} />
                <span>Inje</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm opacity-50" style={{ backgroundColor: COUNTY_CONFIG['Jeongseon-gun'].mapFillColor }} />
                <span>Jeongseon</span>
              </div>
           </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Vulnerability Index Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Activity className="text-blue-600 mr-2" size={20} />
              <h3 className="font-semibold text-blue-900">Health Factors</h3>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Physical mobility</li>
              <li>• Chronic conditions</li>
              <li>• Medication adherence</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="text-purple-600 mr-2" size={20} />
              <h3 className="font-semibold text-purple-900">Psychosocial Factors</h3>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Living situation</li>
              <li>• Family contact frequency</li>
              <li>• Community participation</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <DollarSign className="text-green-600 mr-2" size={20} />
              <h3 className="font-semibold text-green-900">Economic Factors</h3>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Income stability</li>
              <li>• Housing conditions</li>
              <li>• Access to services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const CareWorkerView: React.FC = () => {
    const ASSIGNED_COUNTY: CountyId = 'Inje-gun';
    const assignedElders = elderlyData.filter((elder) => elder.county === ASSIGNED_COUNTY);
    const sortedElders = [...assignedElders].sort((a, b) => {
      const priorityOrder: Record<RiskLevel, number> = { 'High': 3, 'Moderate': 2, 'Low': 1 };
      return priorityOrder[b.riskLevel] - priorityOrder[a.riskLevel];
    });

    const toggleElderSelection = (elder: Elder) => {
      if (selectedElder?.id === elder.id) {
        setSelectedElder(null);
      } else {
        setSelectedElder(elder);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4" style={{ borderColor: COUNTY_CONFIG[ASSIGNED_COUNTY].color }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Care Worker Dashboard</h2>
              <p className="text-gray-600">Assigned Area: <span className="font-bold text-teal-700">{ASSIGNED_COUNTY}</span></p>
              <p className="text-xs text-gray-500 mt-1">Sorted by Risk Priority (High → Moderate → Low)</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-800">{sortedElders.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Assigned Cases</div>
            </div>
          </div>
          <div className="space-y-4">
            {sortedElders.map((elder) => {
              const isSelected = selectedElder?.id === elder.id;
              return (
                <div
                  key={elder.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                      : `${getRiskBorderColor(elder.riskLevel)} bg-white hover:bg-gray-50`
                  }`}
                  onClick={() => toggleElderSelection(elder)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{elder.name} ({elder.nameEn})</h3>
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider ${getRiskColor(elder.riskLevel)}`}>{elder.riskLevel}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center"><MapPin size={14} className="mr-1" />{elder.county}</span>
                        <span>Age: {elder.age}</span>
                        <span>Last Contact: {elder.lastContact}</span>
                      </div>
                      {!isSelected && elder.alerts.length > 0 && (
                        <div className="flex gap-2 mt-2">
                           <span className="text-xs text-red-600 font-medium flex items-center bg-red-100 px-2 py-1 rounded"><Bell size={12} className="mr-1" /> {elder.alerts.length} Alert(s)</span>
                        </div>
                      )}
                      {isSelected && elder.alerts.length > 0 && (
                        <div className="mt-3 space-y-1 animate-fadeIn">
                          {elder.alerts.map((alert, idx) => (
                            <div key={idx} className="flex items-center text-sm text-red-700 bg-red-100 border border-red-200 p-2 rounded"><Bell size={14} className="mr-2" />{alert}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-center">
                      <div className="text-center mb-2">
                        <div className={`text-3xl font-bold ${elder.riskLevel === 'High' ? 'text-red-500' : elder.riskLevel === 'Moderate' ? 'text-yellow-500' : 'text-green-500'}`}>{elder.riskScore}</div>
                        <div className="text-xs text-gray-500">Risk Score</div>
                      </div>
                      {isSelected ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-slideDown">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-100 rounded border border-blue-200">
                          <div className="text-xl font-bold text-blue-700">{elder.health}</div>
                          <div className="text-xs text-blue-800 font-medium">Health Risk</div>
                        </div>
                        <div className="text-center p-3 bg-purple-100 rounded border border-purple-200">
                          <div className="text-xl font-bold text-purple-700">{elder.Psychosocial}</div>
                          <div className="text-xs text-purple-800 font-medium">Psychosocial Risk</div>
                        </div>
                        <div className="text-center p-3 bg-green-100 rounded border border-green-200">
                          <div className="text-xl font-bold text-green-700">{elder.economic}</div>
                          <div className="text-xs text-green-800 font-medium">Economic Risk</div>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center">Recommended Actions</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {interventionActions.map((action, idx) => {
                          const Icon = action.icon;
                          const isPriority = elder.riskLevel === 'High' && action.priority === 'urgent';
                          return (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Action triggered: ${action.label} for ${elder.nameEn}`);
                              }}
                              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all hover:shadow-md active:scale-95 ${
                                isPriority ? 'border-red-500 bg-red-50 hover:bg-red-100' : 'border-gray-200 bg-white hover:bg-gray-50'
                              }`}
                            >
                              <Icon size={20} className={isPriority ? 'text-red-600' : 'text-gray-600'} />
                              <span className={`text-xs font-medium ${isPriority ? 'text-red-600' : 'text-gray-700'}`}>{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-100">
                        <h4 className="font-semibold mb-2 text-sm text-gray-700">History &amp; Notes:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {elder.history.map((note, idx) => (<li key={idx}>• {note}</li>))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ElderlyView: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const questions = [
      {
        id: 'physical',
        kr: '오늘 몸 컨디션은 어떠신가요?',
        en: 'How is your body feeling today?',
        options: [
          { value: 'Good', labelKr: '좋음', labelEn: 'Good', icon: Smile, color: 'text-green-600', borderColor: 'border-green-200', bg: 'bg-green-50' },
          { value: 'Okay', labelKr: '보통', labelEn: 'Okay', icon: Meh, color: 'text-yellow-600', borderColor: 'border-yellow-200', bg: 'bg-yellow-50' },
          { value: 'Bad', labelKr: '나쁨', labelEn: 'Bad', icon: Frown, color: 'text-red-600', borderColor: 'border-red-200', bg: 'bg-red-50' },
        ]
      },
      {
        id: 'Psychosocial',
        kr: '어제 누군가와 대화하신 적이 있으신가요?',
        en: 'Did you speak with anyone yesterday?',
        options: [
          { value: 'Yes', labelKr: '네', labelEn: 'Yes', icon: MessageCircle, color: 'text-blue-600', borderColor: 'border-blue-200', bg: 'bg-blue-50' },
          { value: 'No', labelKr: '아니요', labelEn: 'No', icon: AlertCircle, color: 'text-gray-600', borderColor: 'border-gray-200', bg: 'bg-gray-50' },
        ]
      },
      {
        id: 'mood',
        kr: '오늘 기분은 어떠신가요?',
        en: 'How is your mood today?',
        options: [
          { value: 'Good', labelKr: '좋음', labelEn: 'Happy', icon: Smile, color: 'text-purple-600', borderColor: 'border-purple-200', bg: 'bg-purple-50' },
          { value: 'Neutral', labelKr: '보통', labelEn: 'Neutral', icon: Meh, color: 'text-gray-600', borderColor: 'border-gray-200', bg: 'bg-gray-50' },
          { value: 'Bad', labelKr: '나쁨', labelEn: 'Sad', icon: Frown, color: 'text-blue-600', borderColor: 'border-blue-200', bg: 'bg-blue-50' },
        ]
      }
    ];

    const handleOptionClick = (value: string) => {
      const newAnswers = { ...answers, [questions[currentStep].id]: value };
      setAnswers(newAnswers);

      if (currentStep < questions.length - 1) {
        setTimeout(() => setCurrentStep(c => c + 1), 250); 
      } else {
        setTimeout(() => {
          setIsSubmitted(true);
          setIsCollapsed(true);
        }, 250);
      }
    };

    const handleRedo = () => {
      setAnswers({});
      setCurrentStep(0);
      setIsSubmitted(false);
      setIsCollapsed(false);
    };

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-2">안녕하세요, 김영희님</h2>
          <p className="text-xl opacity-90 mb-1">Good Morning, Kim Young-hee</p>
          <p className="text-lg opacity-80">
            담당 선생님께 오늘의 상태를 알려주세요.<br/>
            <span className="text-sm">Let's check in with your care team.</span>
          </p>
        </div>

        {/* --- DAILY CHECK-IN SECTION --- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-green-100 transition-all duration-300">
          <div 
            className={`p-6 bg-green-50 border-b border-green-100 flex justify-between items-center cursor-pointer ${isCollapsed ? 'hover:bg-green-100' : ''}`}
            onClick={() => isSubmitted && setIsCollapsed(!isCollapsed)}
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-green-600" />
                {isSubmitted ? "체크인 완료 (Check-In Completed)" : "오늘의 상태 체크 (Daily Check-In)"}
              </h3>
              <p className="text-sm text-gray-600">
                {isSubmitted ? "오늘의 상태가 기록되었습니다. (Your status has been recorded.)" : "간단한 질문 3개에 답해 주세요. (Please answer 3 simple questions.)"}
              </p>
            </div>
            {isSubmitted ? (
               <div className="flex items-center gap-4">
                 <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                  <CheckCircle2 size={20} /> 완료 (Done)
                 </span>
                 {isCollapsed ? <ChevronDown className="text-gray-400" /> : <ChevronUp className="text-gray-400" />}
               </div>
            ) : (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                단계 (Step) {currentStep + 1} / 3
              </span>
            )}
          </div>

          {!isCollapsed && (
            <div className="p-6">
              {!isSubmitted ? (
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold text-gray-800 mb-1">{questions[currentStep].kr}</h4>
                    <p className="text-gray-500 text-lg">{questions[currentStep].en}</p>
                  </div>
                  
                  <div className={`grid gap-4 ${questions[currentStep].options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {questions[currentStep].options.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = answers[questions[currentStep].id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleOptionClick(opt.value)}
                          className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all transform duration-200 active:scale-95 ${
                            isSelected
                              ? `${opt.borderColor} ${opt.bg} ${opt.color} shadow-lg scale-105 ring-2 ring-offset-2 ring-blue-300`
                              : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={48} strokeWidth={1.5} />
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-1">{opt.labelKr}</div>
                            <div className="text-sm font-medium opacity-70">{opt.labelEn}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Progress dots */}
                  <div className="flex justify-center gap-2 mt-8">
                    {questions.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-3 h-3 rounded-full transition-colors ${idx === currentStep ? 'bg-blue-600' : idx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ThumbsUp size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">감사합니다! (Thank you!)</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    생활관리사에게 오늘의 상태가 전달되었습니다.<br/>
                    <span className="text-sm opacity-75">Your care worker has been updated with your status for today.</span>
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-xl inline-block text-left w-full max-w-md border border-gray-100">
                    <p className="font-bold text-gray-500 text-xs uppercase mb-4 tracking-wider">오늘의 요약 (Today's Summary)</p>
                    <div className="space-y-3">
                      {questions.map(q => {
                        // Find the Korean label for the answer
                        const selectedOption = q.options.find(o => o.value === answers[q.id]);
                        return (
                          <div key={q.id} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                            <div className="flex flex-col">
                                <span className="text-gray-800 font-medium text-sm">{q.kr}</span>
                                <span className="text-gray-400 text-xs">{q.en}</span>
                            </div>
                            <span className="font-bold text-gray-800 bg-white px-2 py-1 rounded shadow-sm border border-gray-100 whitespace-nowrap">
                              {selectedOption ? selectedOption.labelKr : answers[q.id]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={handleRedo}
                      className="w-full mt-6 py-2 flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm font-medium"
                    >
                      <RefreshCw size={16} />
                      다시 하기 (Redo Check-In)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Existing Content */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Your Support Network</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center mb-4">
                <Phone className="text-blue-600 mr-3" size={32} />
                <div>
                  <h4 className="font-bold text-lg">Your Care Worker</h4>
                  <p className="text-sm text-gray-600">담당 생활관리사</p>
                </div>
              </div>
              <p className="text-gray-700 mb-2">Ms. Jung Min-ji</p>
              <p className="text-sm text-gray-600 mb-3">Last visit: 2 days ago</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Call Now / 전화하기
              </button>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center mb-4">
                <Calendar className="text-purple-600 mr-3" size={32} />
                <div>
                  <h4 className="font-bold text-lg">Next Activity</h4>
                  <p className="text-sm text-gray-600">다음 활동</p>
                </div>
              </div>
              <p className="text-gray-700 mb-2">Community Exercise Class</p>
              <p className="text-sm text-gray-600 mb-3">Tomorrow, 10:00 AM</p>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                Confirm / 참석 확인
              </button>
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h4 className="font-bold text-lg mb-4 flex items-center">
              <Users className="text-green-600 mr-2" size={24} />
              Upcoming Community Events / 지역 행사
            </h4>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <p className="font-semibold">Traditional Cooking Class</p>
                <p className="text-sm text-gray-600">Wednesday, 2:00 PM • Community Center</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <p className="font-semibold">Health Check-up Day</p>
                <p className="text-sm text-gray-600">Friday, 9:00 AM • Local Clinic</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <p className="font-semibold">Senior Walking Group</p>
                <p className="text-sm text-gray-600">Saturday, 8:00 AM • Village Trail</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => setView('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
              view === 'overview'
                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setView('careworker')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
              view === 'careworker'
                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Care Worker View
          </button>
          <button
            onClick={() => setView('elderly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
              view === 'elderly'
                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Elderly Resident View
          </button>
        </div>

        {view === 'overview' && <OverviewView />}
        {view === 'careworker' && <CareWorkerView />}
        {view === 'elderly' && <ElderlyView />}

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md text-center text-sm text-gray-600 border-t border-gray-100">
          <p className="mb-2 font-medium">HAL-MONI Pilot Program • Gangwon Province</p>
          <p className="text-gray-400">Jeongseon-gun • Yanggu-gun • Inje-gun</p>
        </div>
      </div>
    </div>
  );
};

export default HalmoniRiskIndex;
