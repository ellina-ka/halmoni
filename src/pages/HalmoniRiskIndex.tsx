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
  ChevronUp
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
  social: number;
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
  social: number;
  economic: number;
  lastContact: string;
  alerts: string[];
  history: string[];
}

// --- Configuration & Data Generation ---

const COUNTY_CONFIG: Record<
  CountyId,
  { center: [number, number]; color: string; shortLabel: string }
> = {
  'Jeongseon-gun': {
    center: [37.38, 128.67],
    color: '#e63946',
    shortLabel: 'Jeongseon',
  },
  'Yanggu-gun': {
    center: [38.1, 127.99],
    color: '#457b9d',
    shortLabel: 'Yanggu',
  },
  'Inje-gun': {
    center: [38.06, 128.17],
    color: '#2a9d8f',
    shortLabel: 'Inje',
  },
};

const coordinateOffsets: Array<[number, number]> = [
  [0.0, 0.0],
  [0.03, 0.02],
  [-0.02, 0.015],
  [0.015, -0.02],
  [-0.025, -0.01],
  [0.01, 0.025],
  [-0.015, 0.03],
  [0.02, -0.015],
];

const ELDER_TEMPLATES: ElderTemplate[] = [
  {
    name: '김영희',
    nameEn: 'Kim Young-hee',
    age: 78,
    baseScore: 82,
    health: 75,
    social: 88,
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
    social: 52,
    economic: 40,
    lastContact: '2 days ago',
    alerts: ['Reduced social activity participation'],
    history: ['Regular community center visits', 'Good family support'],
  },
  {
    name: '이순자',
    nameEn: 'Lee Soon-ja',
    age: 74,
    baseScore: 28,
    health: 30,
    social: 33,
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
    social: 80,
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
    social: 42,
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
    social: 50,
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
    social: 60,
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
    social: 70,
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
    social: 39,
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
    social: 45,
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
    const offset = coordinateOffsets[i % coordinateOffsets.length];
    const center = COUNTY_CONFIG[county].center;

    const riskScoreBase = tmpl.baseScore + ((i % 7) - 3); // -3 .. +3
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
      social: tmpl.social,
      economic: tmpl.economic,
      lastContact: tmpl.lastContact,
      alerts: tmpl.alerts,
      history: tmpl.history,
      lat: center[0] + offset[0],
      lng: center[1] + offset[1],
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
    case 'High':
      return 'bg-red-500';
    case 'Moderate':
      return 'bg-yellow-500';
    case 'Low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getRiskBorderColor = (level: RiskLevel): string => {
  switch (level) {
    case 'High':
      return 'border-red-500';
    case 'Moderate':
      return 'border-yellow-500';
    case 'Low':
      return 'border-green-500';
    default:
      return 'border-gray-500';
  }
};

const getCountyColor = (county: CountyId): string => COUNTY_CONFIG[county].color;

// --- Leaflet CDN Map Component ---
// NOTE: Since we cannot use npm packages like 'react-leaflet' in this environment,
// we are loading Leaflet directly from a CDN. In your local project, you can use
// standard React-Leaflet components.

const LeafletMap: React.FC<{ elders: Elder[], onMarkerClick: (e: Elder) => void }> = ({ elders, onMarkerClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Leaflet map instance
  const [libLoaded, setLibLoaded] = useState(false);

  // Load Leaflet CSS and JS
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

  // Initialize Map
  useEffect(() => {
    if (libLoaded && mapContainerRef.current && !mapInstanceRef.current) {
      const L = (window as any).L;
      
      // GANGWON-DO RESTRICTION
      // Define bounds for Gangwon-do (Approximate)
      // SouthWest: 37.0, 127.0
      // NorthEast: 38.7, 129.6
      const corner1 = L.latLng(37.0, 127.0);
      const corner2 = L.latLng(38.8, 129.6);
      const bounds = L.latLngBounds(corner1, corner2);

      const map = L.map(mapContainerRef.current, {
        center: [37.9, 128.2],
        zoom: 9,
        minZoom: 8,
        maxBounds: bounds, // Restrict panning
        maxBoundsViscosity: 1.0 // Sticky edges
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, [libLoaded]);

  // Handle Markers
  useEffect(() => {
    if (libLoaded && mapInstanceRef.current) {
      const L = (window as any).L;
      const map = mapInstanceRef.current;
      
      // Clear existing markers if any (simple approach for this demo)
      map.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      elders.forEach((elder) => {
        const radius = elder.riskLevel === 'High' ? 10 : elder.riskLevel === 'Moderate' ? 8 : 6;
        
        const marker = L.circleMarker([elder.lat, elder.lng], {
          radius: radius,
          fillColor: COUNTY_CONFIG[elder.county].color,
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });

        marker.bindTooltip(`
          <div style="text-align: center">
            <strong>${elder.nameEn}</strong><br/>
            Risk Score: ${elder.riskScore}
          </div>
        `, { direction: 'top', offset: [0, -5] });

        marker.on('click', () => {
          onMarkerClick(elder);
        });

        marker.addTo(map);
      });
    }
  }, [libLoaded, elders, onMarkerClick]);

  if (!libLoaded) {
    return <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">Loading Map...</div>;
  }

  return <div ref={mapContainerRef} className="h-full w-full z-0" />;
};

// --- Main Component ---

const HalmoniRiskIndex: React.FC = () => {
  const [view, setView] = useState<ViewMode>('overview');
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);

  const highCount = elderlyData.filter((e) => e.riskLevel === 'High').length;
  const moderateCount = elderlyData.filter((e) => e.riskLevel === 'Moderate').length;
  const lowCount = elderlyData.filter((e) => e.riskLevel === 'Low').length;

  // Handler for Map Clicks (Overview)
  const handleMarkerClick = (elder: Elder) => {
    setSelectedElder(elder);
    setView('careworker');
  };

  // --- Sub-Components ---

  const OverviewView: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">HAL-MONI (할머니)</h1>
        <p className="text-xl opacity-90">
          Healthy Ageing Link – Model for Organized Network Integration
        </p>
        <p className="mt-4 text-sm opacity-80">
          Predictive Risk Index for Rural Elder Care in Gangwon Province
        </p>
      </div>

      {/* Summary cards */}
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

      {/* Map section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Pilot Map – Gangwon-do</h2>
        <p className="text-sm text-gray-600 mb-4">
          Each dot represents an elderly resident across Jeongseon, Yanggu, and Inje.
          <br/>
          <span className="text-xs text-blue-600 font-medium">Map view restricted to Gangwon Province.</span>
        </p>

        <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-200 relative z-0">
          <LeafletMap elders={elderlyData} onMarkerClick={handleMarkerClick} />
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600 justify-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COUNTY_CONFIG['Jeongseon-gun'].color }} />
            <span>Jeongseon-gun</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COUNTY_CONFIG['Yanggu-gun'].color }} />
            <span>Yanggu-gun</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COUNTY_CONFIG['Inje-gun'].color }} />
            <span>Inje-gun</span>
          </div>
        </div>
      </div>

      {/* Vulnerability components */}
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
              <h3 className="font-semibold text-purple-900">Social Factors</h3>
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
    // -------------------------------------------------------------
    // FEATURE REQUEST 1: Focus uniquely on one county (Inje-gun)
    // -------------------------------------------------------------
    const ASSIGNED_COUNTY: CountyId = 'Inje-gun';
    
    // Filter data to only show Inje-gun residents
    const assignedElders = elderlyData.filter(
      (elder) => elder.county === ASSIGNED_COUNTY
    );

    // -------------------------------------------------------------
    // FEATURE REQUEST 2: Collapse functionality
    // -------------------------------------------------------------
    const toggleElderSelection = (elder: Elder) => {
      if (selectedElder?.id === elder.id) {
        // If already selected, clicking again deselects (collapses)
        setSelectedElder(null);
      } else {
        // Otherwise, select the new person
        setSelectedElder(elder);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4" style={{ borderColor: COUNTY_CONFIG[ASSIGNED_COUNTY].color }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Care Worker Dashboard</h2>
              <p className="text-gray-600">
                Assigned Area: <span className="font-bold text-teal-700">{ASSIGNED_COUNTY}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-800">{assignedElders.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Assigned Cases</div>
            </div>
          </div>

          <div className="space-y-4">
            {assignedElders.map((elder) => {
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
                  {/* Card Header (Always Visible) */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {elder.name} ({elder.nameEn})
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider ${getRiskColor(
                            elder.riskLevel,
                          )}`}
                        >
                          {elder.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {elder.county}
                        </span>
                        <span>Age: {elder.age}</span>
                        <span>Last Contact: {elder.lastContact}</span>
                      </div>

                      {/* Compact Alerts (Always visible if high priority) */}
                      {!isSelected && elder.alerts.length > 0 && (
                        <div className="flex gap-2 mt-2">
                           <span className="text-xs text-red-600 font-medium flex items-center bg-red-100 px-2 py-1 rounded">
                              <Bell size={12} className="mr-1" /> {elder.alerts.length} Alert(s)
                           </span>
                        </div>
                      )}

                      {/* Expanded Alerts View */}
                      {isSelected && elder.alerts.length > 0 && (
                        <div className="mt-3 space-y-1 animate-fadeIn">
                          {elder.alerts.map((alert, idx) => (
                            <div
                              key={idx}
                              className="flex items-center text-sm text-red-700 bg-red-100 border border-red-200 p-2 rounded"
                            >
                              <Bell size={14} className="mr-2" />
                              {alert}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col items-center">
                      <div className="text-center mb-2">
                        <div
                          className={`text-3xl font-bold ${
                            elder.riskLevel === 'High'
                              ? 'text-red-500'
                              : elder.riskLevel === 'Moderate'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}
                        >
                          {elder.riskScore}
                        </div>
                        <div className="text-xs text-gray-500">Risk Score</div>
                      </div>
                      {/* Collapse/Expand Icon */}
                      {isSelected ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-slideDown">
                      {/* Detailed Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-100 rounded border border-blue-200">
                          <div className="text-xl font-bold text-blue-700">
                            {elder.health}
                          </div>
                          <div className="text-xs text-blue-800 font-medium">Health Risk</div>
                        </div>
                        <div className="text-center p-3 bg-purple-100 rounded border border-purple-200">
                          <div className="text-xl font-bold text-purple-700">
                            {elder.social}
                          </div>
                          <div className="text-xs text-purple-800 font-medium">Social Risk</div>
                        </div>
                        <div className="text-center p-3 bg-green-100 rounded border border-green-200">
                          <div className="text-xl font-bold text-green-700">
                            {elder.economic}
                          </div>
                          <div className="text-xs text-green-800 font-medium">Economic Risk</div>
                        </div>
                      </div>

                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
                         Recommended Actions
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {interventionActions.map((action, idx) => {
                          const Icon = action.icon;
                          const isPriority =
                            elder.riskLevel === 'High' && action.priority === 'urgent';
                          return (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card collapse when clicking button
                                alert(`Action triggered: ${action.label} for ${elder.nameEn}`);
                              }}
                              className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all hover:shadow-md active:scale-95 ${
                                isPriority
                                  ? 'border-red-500 bg-red-50 hover:bg-red-100'
                                  : 'border-gray-200 bg-white hover:bg-gray-50'
                              }`}
                            >
                              <Icon
                                size={20}
                                className={isPriority ? 'text-red-600' : 'text-gray-600'}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  isPriority ? 'text-red-600' : 'text-gray-700'
                                }`}
                              >
                                {action.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-100">
                        <h4 className="font-semibold mb-2 text-sm text-gray-700">
                          History &amp; Notes:
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {elder.history.map((note, idx) => (
                            <li key={idx}>• {note}</li>
                          ))}
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

  const ElderlyView: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-2">어르신을 위한 연결망</h2>
        <p className="text-xl">Community Connection for Elderly Residents</p>
      </div>

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
              <p className="text-sm text-gray-600">
                Wednesday, 2:00 PM • Community Center
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
              <p className="font-semibold">Health Check-up Day</p>
              <p className="text-sm text-gray-600">
                Friday, 9:00 AM • Local Clinic
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
              <p className="font-semibold">Senior Walking Group</p>
              <p className="text-sm text-gray-600">
                Saturday, 8:00 AM • Village Trail
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          How We Support You / 우리의 지원
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 text-center hover:bg-gray-50 rounded-lg transition">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
              <Heart size={32} />
            </div>
            <h4 className="font-semibold mb-2">Regular Check-ins</h4>
            <p className="text-sm text-gray-600">정기적인 안부 확인</p>
          </div>
          <div className="p-4 text-center hover:bg-gray-50 rounded-lg transition">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600">
              <Users size={32} />
            </div>
            <h4 className="font-semibold mb-2">Community Activities</h4>
            <p className="text-sm text-gray-600">지역사회 활동</p>
          </div>
          <div className="p-4 text-center hover:bg-gray-50 rounded-lg transition">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
              <Activity size={32} />
            </div>
            <h4 className="font-semibold mb-2">Health Monitoring</h4>
            <p className="text-sm text-gray-600">건강 모니터링</p>
          </div>
        </div>
      </div>
    </div>
  );

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
