import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LocationStep } from '@/components/steps/LocationStep';
import { DateTimeStep } from '@/components/steps/DateTimeStep';
import { PartnerStep } from '@/components/steps/PartnerStep';
import { ResultsStep } from '@/components/steps/ResultsStep';
import { SavedDatesStep } from '@/components/steps/SavedDatesStep';
import { Sidebar } from '@/components/Sidebar';
import { UserMenu } from '@/components/auth/UserMenu';
import { MapPin, Clock, Heart, UserCircle2 } from 'lucide-react';
import type { DateInputs, DateItinerary, Step } from '@/types';
import { saveDateItinerary, saveToSearchHistory } from '@/lib/storage';

export default function DateGenerator() {
  const [currentStep, setCurrentStep] = useState<Step>('location');
  const [inputs, setInputs] = useState<DateInputs>({
    location: '',
    date: '',
    timeOfDay: '',
    interests: '',
    personality: '',
    budget: '',
    loveLanguage: ''
  });
  const [dateItinerary, setDateItinerary] = useState<DateItinerary | null>(null);

  const updateInputs = (newInputs: Partial<DateInputs>) => {
    setInputs(prev => ({ ...prev, ...newInputs }));
  };

  const handleDateGenerated = (itinerary: DateItinerary) => {
    const savedItinerary = saveDateItinerary({
      ...itinerary,
      inputs: { ...inputs }
    });
    setDateItinerary(savedItinerary);
    saveToSearchHistory(
      inputs.location,
      inputs.date,
      inputs.timeOfDay,
      savedItinerary.id,
      savedItinerary.title
    );
  };

  const handleViewDate = (date: DateItinerary) => {
    setDateItinerary(date);
    setCurrentStep('results');
  };

  const steps: Record<Step, JSX.Element> = {
    location: <LocationStep inputs={inputs} updateInputs={updateInputs} onNext={() => setCurrentStep('datetime')} />,
    datetime: <DateTimeStep inputs={inputs} updateInputs={updateInputs} onNext={() => setCurrentStep('partner')} onBack={() => setCurrentStep('location')} />,
    partner: <PartnerStep inputs={inputs} updateInputs={updateInputs} onNext={() => setCurrentStep('results')} onBack={() => setCurrentStep('datetime')} />,
    results: <ResultsStep 
      inputs={inputs} 
      dateItinerary={dateItinerary} 
      setDateItinerary={setDateItinerary} 
      onBack={() => setCurrentStep('partner')}
      onDateGenerated={handleDateGenerated}
    />,
    saved: <SavedDatesStep 
      onBack={() => setCurrentStep('location')} 
      setDateItinerary={setDateItinerary}
      onViewItinerary={() => setCurrentStep('results')}
    />
  };

  const stepInfo = [
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'datetime', label: 'Timing', icon: Clock },
    { key: 'partner', label: 'Preferences', icon: Heart },
    { key: 'results', label: 'Review', icon: UserCircle2 }
  ];

  const getProgressWidth = () => {
    switch (currentStep) {
      case 'location': return '33.33%';
      case 'datetime': return '66.66%';
      case 'partner': return '100%';
      case 'results': return '100%';
      case 'saved': return '0%';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5FF] flex">
      <Sidebar onViewDate={handleViewDate} />
      <div className="flex-1">
        <nav className="bg-[#FAF5FF]">
          <div className="container mx-auto px-4 py-4 flex justify-end items-center gap-4">
            <UserMenu />
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-purple-800 mb-2">
              Tired of "dinner and movie" on repeat?
            </h1>
            <p className="text-lg text-purple-600 mb-4">
              Let our AI shake things up. Say goodbye to boring date nights.
            </p>
          </div>

          {currentStep !== 'saved' && (
            <div className="flex justify-center mb-12">
              <div className="relative flex justify-between w-[320px]">
                <div className="absolute top-4 left-0 right-0 h-[3px] mx-4">
                  <div className="absolute inset-0 bg-gray-200" />
                  <div 
                    className="absolute inset-y-0 left-0 bg-purple-600 transition-all duration-300"
                    style={{ width: getProgressWidth() }}
                  />
                </div>
                
                {stepInfo.map((step, index) => {
                  const isActive = stepInfo.findIndex(s => s.key === currentStep) >= index;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        transition-all duration-300
                        ${isActive 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 text-gray-400'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`
                        mt-2 text-xs font-medium transition-all duration-300
                        ${isActive 
                          ? 'text-purple-600' 
                          : 'text-gray-400'}
                      `}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <Card className="backdrop-blur-sm bg-white/80 border-purple-200 shadow-xl">
            {steps[currentStep]}
          </Card>
        </div>
      </div>
    </div>
  );
}