"use client";

import { useState } from 'react';

interface BodyPart {
  id: string;
  name: string;
  svgPath: string;
  description: string;
}

export default function BodyMap() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [symptom, setSymptom] = useState('');
  const [intensity, setIntensity] = useState(5);

  const bodyParts: BodyPart[] = [
    { id: 'head', name: 'Head', svgPath: 'M50,20 Q70,15 90,20 Q100,30 95,50 Q90,70 70,75 Q50,80 30,75 Q10,70 5,50 Q0,30 10,20 Q30,15 50,20', description: 'Headaches, dizziness, vision problems' },
    { id: 'chest', name: 'Chest', svgPath: 'M40,80 Q50,75 60,80 L60,120 Q50,125 40,120 Z', description: 'Chest pain, breathing difficulties, heart palpitations' },
    { id: 'stomach', name: 'Stomach', svgPath: 'M45,125 Q50,120 55,125 L55,150 Q50,155 45,150 Z', description: 'Stomach ache, nausea, digestion issues' },
    { id: 'left-arm', name: 'Left Arm', svgPath: 'M20,85 L5,100 L10,130 L25,120 Z', description: 'Arm pain, numbness, weakness' },
    { id: 'right-arm', name: 'Right Arm', svgPath: 'M80,85 L95,100 L90,130 L75,120 Z', description: 'Arm pain, numbness, weakness' },
    { id: 'left-leg', name: 'Left Leg', svgPath: 'M45,155 L40,180 L35,210 L50,205 L55,175 Z', description: 'Leg pain, swelling, mobility issues' },
    { id: 'right-leg', name: 'Right Leg', svgPath: 'M55,155 L60,180 L65,210 L50,205 L45,175 Z', description: 'Leg pain, swelling, mobility issues' },
  ];

  const selectedBodyPart = bodyParts.find(part => part.id === selectedPart);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPart && symptom) {
      alert(`Symptom logged: ${selectedBodyPart?.name}\nSymptom: ${symptom}\nIntensity: ${intensity}/10`);
      setSymptom('');
      setSelectedPart(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📍 Body Map - Click Where It Hurts</h2>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Body SVG */}
        <div className="lg:w-1/2">
          <div className="relative bg-gradient-to-b from-blue-50 to-gray-50 rounded-lg p-4 border border-gray-200">
            <svg 
              viewBox="0 0 100 220" 
              className="w-full h-auto max-h-[400px]"
            >
              {/* Body outline */}
              <path
                d="M50,20 Q70,15 90,20 Q100,30 95,50 Q90,70 70,75 Q50,80 30,75 Q10,70 5,50 Q0,30 10,20 Q30,15 50,20 Z M40,80 Q50,75 60,80 L60,120 Q50,125 40,120 Z M45,125 Q50,120 55,125 L55,150 Q50,155 45,150 Z M20,85 L5,100 L10,130 L25,120 Z M80,85 L95,100 L90,130 L75,120 Z M45,155 L40,180 L35,210 L50,205 L55,175 Z M55,155 L60,180 L65,210 L50,205 L45,175 Z"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              
              {/* Interactive body parts */}
              {bodyParts.map((part) => (
                <path
                  key={part.id}
                  d={part.svgPath}
                  fill={selectedPart === part.id ? '#3b82f6' : '#94a3b8'}
                  fillOpacity={selectedPart === part.id ? '0.7' : '0.3'}
                  stroke={selectedPart === part.id ? '#1d4ed8' : '#64748b'}
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-200 hover:fill-opacity-50 hover:stroke-blue-500"
                  onClick={() => setSelectedPart(part.id)}
                />
              ))}
            </svg>
            
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {bodyParts.map((part) => (
                <button
                  key={part.id}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    selectedPart === part.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedPart(part.id)}
                >
                  {part.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Symptom Form */}
        <div className="lg:w-1/2">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedPart ? `📝 Log Symptom for ${selectedBodyPart?.name}` : '👉 Select a body part first'}
            </h3>
            
            {selectedPart && (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100">
                  <p className="text-blue-800 text-sm">
                    <span className="font-medium">Common symptoms:</span> {selectedBodyPart?.description}
                  </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Describe your symptom
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Example: Sharp pain when moving, dull ache, burning sensation..."
                      value={symptom}
                      onChange={(e) => setSymptom(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Pain Intensity: <span className="text-blue-600">{intensity}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mild</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      📝 Log Symptom
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPart(null)}
                      className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {!selectedPart && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👆</div>
                <p className="text-gray-600">
                  Click on any body part or use the buttons above to select where you're experiencing symptoms.
                </p>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">📊 Today's Log</h4>
              <div className="text-sm text-gray-500 italic">
                No symptoms logged yet. Select a body part and describe your symptom.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}