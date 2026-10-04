import React, { useState, useEffect } from 'react';
import { PatientData, CardiacRiskResult, AssessmentRecord } from './types/cardiac';
import { DEMO_PATIENTS } from './data/demoPatients';
import { calculateCardiacRisk } from './utils/calculations';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Dashboard } from './pages/Dashboard';
import { Assessment } from './pages/Assessment';
import { AnatomyViewer } from './pages/AnatomyViewer';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { RiskFactorsView } from './pages/RiskFactorsView';
import { HistoryView } from './pages/HistoryView';
import { AboutView } from './pages/AboutView';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Activity, 
  Sliders, 
  BarChart2, 
  History as HistoryIcon, 
  Info 
} from 'lucide-react';

const STORAGE_KEY = 'cardiosynex_history_v1';

export default function App() {
  // Default to Demo Patient 3 (Robert Vance, High Risk) for instant hackathon impact
  const [currentPatient, setCurrentPatient] = useState<PatientData>(DEMO_PATIENTS[2]);
  const [result, setResult] = useState<CardiacRiskResult>(() => calculateCardiacRisk(DEMO_PATIENTS[2]));
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [historyRecords, setHistoryRecords] = useState<AssessmentRecord[]>([]);

  // Load history from localStorage or seed initial realistic records
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistoryRecords(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not parse history from storage:', e);
    }

    // Seed realistic records
    const initialSeeds: AssessmentRecord[] = [
      {
        id: 'seed-1',
        patientName: DEMO_PATIENTS[2].name,
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        patientData: DEMO_PATIENTS[2],
        result: calculateCardiacRisk(DEMO_PATIENTS[2]),
      },
      {
        id: 'seed-2',
        patientName: DEMO_PATIENTS[1].name,
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        patientData: DEMO_PATIENTS[1],
        result: calculateCardiacRisk(DEMO_PATIENTS[1]),
      },
      {
        id: 'seed-3',
        patientName: DEMO_PATIENTS[0].name,
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        patientData: DEMO_PATIENTS[0],
        result: calculateCardiacRisk(DEMO_PATIENTS[0]),
      },
    ];

    setHistoryRecords(initialSeeds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeeds));
    } catch (err) {
      // ignore
    }
  }, []);

  // Update localStorage when history changes
  const saveHistory = (newRecords: AssessmentRecord[]) => {
    setHistoryRecords(newRecords);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (e) {
      console.warn('Failed saving to localStorage:', e);
    }
  };

  // Select demo patient
  const handleSelectDemoPatient = (patientId: string) => {
    const found = DEMO_PATIENTS.find(p => p.id === patientId);
    if (found) {
      setCurrentPatient(found);
      const newResult = calculateCardiacRisk(found);
      setResult(newResult);
    }
  };

  // Update patient from Assessment intake form
  const handleUpdatePatient = (patient: PatientData, newResult: CardiacRiskResult) => {
    setCurrentPatient(patient);
    setResult(newResult);

    // Append to history
    const newRecord: AssessmentRecord = {
      id: `rec-${Date.now()}`,
      patientName: patient.name,
      date: new Date().toISOString(),
      patientData: patient,
      result: newResult,
    };
    saveHistory([newRecord, ...historyRecords]);
  };

  // Load a record from history
  const handleLoadRecord = (record: AssessmentRecord) => {
    setCurrentPatient(record.patientData);
    setResult(record.result);
    setCurrentPage('dashboard');
  };

  // Delete a history record
  const handleDeleteRecord = (id: string) => {
    const updated = historyRecords.filter(r => r.id !== id);
    saveHistory(updated);
  };

  // Clear all history
  const handleClearHistory = () => {
    saveHistory([]);
  };

  const mobileNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assessment', label: 'Intake', icon: ClipboardCheck },
    { id: 'anatomy', label: '3D Twin', icon: Activity },
    { id: 'simulator', label: 'What-If', icon: Sliders },
    { id: 'factors', label: 'Factors', icon: BarChart2 },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Header */}
      <Header
        currentPatient={currentPatient}
        result={result}
        onSelectPatient={handleSelectDemoPatient}
        onNavigate={setCurrentPage}
      />

      {/* Main Body with Left Sidebar & Content */}
      <div className="flex-1 flex w-full">
        {/* Left Desktop Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          cadRisk={result.cadRisk}
          riskCategory={result.overallRisk}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {currentPage === 'dashboard' && (
            <Dashboard
              currentPatient={currentPatient}
              result={result}
              onNavigate={setCurrentPage}
              onSelectDemoPatient={handleSelectDemoPatient}
              historyRecords={historyRecords}
              onSelectRecord={handleLoadRecord}
            />
          )}

          {currentPage === 'assessment' && (
            <Assessment
              currentPatient={currentPatient}
              onUpdatePatient={handleUpdatePatient}
              onNavigateToResults={() => setCurrentPage('dashboard')}
            />
          )}

          {currentPage === 'anatomy' && (
            <AnatomyViewer
              currentPatient={currentPatient}
              result={result}
            />
          )}

          {currentPage === 'simulator' && (
            <WhatIfSimulator
              currentPatient={currentPatient}
              currentResult={result}
            />
          )}

          {currentPage === 'factors' && (
            <RiskFactorsView
              currentPatient={currentPatient}
              result={result}
            />
          )}

          {currentPage === 'history' && (
            <HistoryView
              historyRecords={historyRecords}
              onLoadRecord={handleLoadRecord}
              onDeleteRecord={handleDeleteRecord}
              onClearHistory={handleClearHistory}
            />
          )}

          {currentPage === 'about' && (
            <AboutView />
          )}
        </main>
      </div>

      {/* Mobile / Tablet Bottom Navigation Bar */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-[#070e1c]/95 backdrop-blur-xl border-t border-cyan-500/20 px-2 py-2 flex items-center justify-around">
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center p-1 rounded-lg transition ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
