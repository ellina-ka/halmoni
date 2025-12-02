import React, { useState } from 'react';
import { AlertCircle, Heart, Users, DollarSign, Phone, Home, Calendar, Activity, TrendingUp, MapPin, Bell } from 'lucide-react';

type RiskLevel = 'High' | 'Moderate' | 'Low';

interface Elder {
  id: number;
  name: string;
  nameEn: string;
  age: number;
  location: string;
  riskScore: number;
  riskLevel: RiskLevel;
  health: number;
  social: number;
  economic: number;
  lastContact: string;
  alerts: string[];
  history: string[];
}

type ViewMode = 'overview' | 'careworker' | 'elderly';

interface InterventionAction {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

const HalmoniRiskIndex: React.FC = () => {
  const [view, setView] = useState<ViewMode>('overview');
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);

  const elderlyData: Elder[] = [
    {
      id: 1,
      name: "김영희",
      nameEn: "Kim Young-hee",
      age: 78,
      location: "Jeongseon-gun",
      riskScore: 78,
      riskLevel: "High",
      health: 72,
      social: 85,
      economic: 77,
      lastContact: "5 days ago",
      alerts: ["No water usage for 36 hours", "Missed weekly check-in call"],
      history: ["Lives alone", "Decreased mobility", "Limited family contact"]
    },
    {
      id: 2,
      name: "박철수",
      nameEn: "Park Chul-soo",
      age: 82,
      location: "Yanggu-gun",
      riskScore: 45,
      riskLevel: "Moderate",
      health: 55,
      social: 42,
      economic: 38,
      lastContact: "2 days ago",
      alerts: ["Reduced social activity participation"],
      history: ["Regular community center visits", "Good family support"]
    },
    {
      id: 3,
      name: "이순자",
      nameEn: "Lee Soon-ja",
      age: 74,
      location: "Inje-gun",
      riskScore: 25,
      riskLevel: "Low",
      health: 28,
      social: 30,
      economic: 18,
      lastContact: "1 day ago",
      alerts: [],
      history: ["Active in community", "Regular medical check-ups"]
    }
  ];

  const interventionActions: InterventionAction[] = [
    { icon: Phone, label: "Emergency Call", priority: "urgent" },
    { icon: Home, label: "Home Visit", priority: "urgent" },
    { icon: Activity, label: "Health Check-up", priority: "high" },
    { icon: Users, label: "Community Event", priority: "medium" },
    { icon: Calendar, label: "Schedule Follow-up", priority: "medium" },
    { icon: Heart, label: "Wellness Check", priority: "low" }
  ];

  const getRiskColor = (level: RiskLevel): string => {
    switch(level) {
      case "High": return "bg-red-500";
      case "Moderate": return "bg-yellow-500";
      case "Low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getRiskBorderColor = (level: RiskLevel): string => {
    switch(level) {
      case "High": return "border-red-500";
      case "Moderate": return "border-yellow-500";
      case "Low": return "border-green-500";
      default: return "border-gray-500";
    }
  };

const OverviewView = () => (
    <div className="space-y-6">
      {/* Added 'relative' class here to position the logo inside */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl overflow-hidden">
        
        {/* --- GANGWON LOGO ADDED HERE --- */}
        <div className="absolute top-6 right-6">
            <img 
              src="/halmoni/gangwon.svg" 
              alt="Gangwon-do" 
              className="h-16 md:h-20 w-auto opacity-90" 
            />
        </div>
        {/* ------------------------------- */}

        <h1 className="text-4xl font-bold mb-2 relative z-10">HAL-MONI (할머니)</h1>
        <p className="text-xl opacity-90 relative z-10">Healthy Ageing Link – Model for Organized Network Integration</p>
        <p className="mt-4 text-sm opacity-80 relative z-10">Predictive Risk Index for Rural Elder Care in Gangwon Province</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">High Risk</h3>
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <p className="text-4xl font-bold text-red-500">1</p>
          <p className="text-sm text-gray-600 mt-2">Requires immediate attention</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Moderate Risk</h3>
            <TrendingUp className="text-yellow-500" size={24} />
          </div>
          <p className="text-4xl font-bold text-yellow-500">1</p>
          <p className="text-sm text-gray-600 mt-2">Monitor closely</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Low Risk</h3>
            <Heart className="text-green-500" size={24} />
          </div>
          <p className="text-4xl font-bold text-green-500">1</p>
          <p className="text-sm text-gray-600 mt-2">Regular check-ins</p>
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
              <li>• Recent hospitalizations</li>
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
              <li>• Social network size</li>
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
              <li>• Financial vulnerability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const CareWorkerView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Care Worker Dashboard</h2>
        <p className="text-gray-600 mb-6">Monitor and respond to elderly residents in your assigned area</p>

        <div className="space-y-4">
          {elderlyData.map(elder => (
            <div 
              key={elder.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                selectedElder?.id === elder.id ? 'border-blue-500 bg-blue-50' : getRiskBorderColor(elder.riskLevel)
              }`}
              onClick={() => setSelectedElder(elder)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{elder.name} ({elder.nameEn})</h3>
                    <span className={`px-3 py-1 rounded-full text-white text-sm ${getRiskColor(elder.riskLevel)}`}>
                      {elder.riskLevel} Risk
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {elder.location}
                    </span>
                    <span>Age: {elder.age}</span>
                    <span>Last Contact: {elder.lastContact}</span>
                  </div>

                  {elder.alerts.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {elder.alerts.map((alert, idx) => (
                        <div key={idx} className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
                          <Bell size={14} className="mr-2" />
                          {alert}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      elder.riskLevel === 'High' ? 'text-red-500' :
                      elder.riskLevel === 'Moderate' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {elder.riskScore}
                    </div>
                    <div className="text-xs text-gray-500">Risk Score</div>
                  </div>
                </div>
              </div>

              {selectedElder?.id === elder.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-xl font-bold text-blue-600">{elder.health}</div>
                      <div className="text-xs text-gray-600">Health Risk</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-xl font-bold text-purple-600">{elder.social}</div>
                      <div className="text-xs text-gray-600">Social Risk</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-xl font-bold text-green-600">{elder.economic}</div>
                      <div className="text-xs text-gray-600">Economic Risk</div>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-3 text-gray-800">Recommended Actions:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {interventionActions.map((action, idx) => {
                      const Icon = action.icon;
                      const isPriority = elder.riskLevel === "High" && action.priority === "urgent";
                      return (
                        <button
                          key={idx}
                          className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all hover:shadow-md ${
                            isPriority 
                              ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <Icon size={20} className={isPriority ? 'text-red-600' : 'text-gray-600'} />
                          <span className={`text-xs font-medium ${isPriority ? 'text-red-600' : 'text-gray-700'}`}>
                            {action.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">History & Notes:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {elder.history.map((note, idx) => (
                        <li key={idx}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ElderlyView = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-8 rounded-xl">
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
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
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
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold">Traditional Cooking Class</p>
              <p className="text-sm text-gray-600">Wednesday, 2:00 PM • Community Center</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold">Health Check-up Day</p>
              <p className="text-sm text-gray-600">Friday, 9:00 AM • Local Clinic</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="font-semibold">Senior Walking Group</p>
              <p className="text-sm text-gray-600">Saturday, 8:00 AM • Village Trail</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">How We Support You / 우리의 지원</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="text-blue-600" size={32} />
            </div>
            <h4 className="font-semibold mb-2">Regular Check-ins</h4>
            <p className="text-sm text-gray-600">정기적인 안부 확인</p>
          </div>
          <div className="p-4 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="text-purple-600" size={32} />
            </div>
            <h4 className="font-semibold mb-2">Community Activities</h4>
            <p className="text-sm text-gray-600">지역사회 활동</p>
          </div>
          <div className="p-4 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="text-green-600" size={32} />
            </div>
            <h4 className="font-semibold mb-2">Health Monitoring</h4>
            <p className="text-sm text-gray-600">건강 모니터링</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => setView('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              view === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setView('careworker')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              view === 'careworker'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Care Worker View
          </button>
          <button
            onClick={() => setView('elderly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              view === 'elderly'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Elderly Resident View
          </button>
        </div>

        {view === 'overview' && <OverviewView />}
        {view === 'careworker' && <CareWorkerView />}
        {view === 'elderly' && <ElderlyView />}

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md text-center text-sm text-gray-600">
          <p className="mb-2">HAL-MONI Pilot Program • Gangwon Province</p>
          <p>Jeongseon-gun • Yanggu-gun • Inje-gun</p>
        </div>
      </div>
    </div>
  );
};

export default HalmoniRiskIndex;
