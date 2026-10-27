import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Workspace } from './pages/Workspace';
import { History } from './pages/History';
import { HowItWorks } from './pages/HowItWorks';
import { ModelStatus } from './pages/ModelStatus';
import { ReportPage } from './pages/ReportPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
        <Navbar />
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/history" element={<History />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/status" element={<ModelStatus />} />
            <Route path="/report/:id" element={<ReportPage />} />
          </Routes>
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-slate-500 font-mono no-print">
          PhantomCheck AI • Don't Just Believe It. Investigate It. • Hackathon PS 1.7
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
