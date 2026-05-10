/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientRegistration from './pages/PatientRegistration';
import Anamnesis from './pages/Anamnesis';
import TreatmentHistory from './pages/TreatmentHistory';
import Prescription from './pages/Prescription';
import DischargeConditions from './pages/DischargeConditions';
import DentalReport from './pages/DentalReport';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cadastro" element={<PatientRegistration />} />
          <Route path="/anamnese" element={<Anamnesis />} />
          <Route path="/evolucao" element={<TreatmentHistory />} />
          <Route path="/prescricao" element={<Prescription />} />
          <Route path="/alta" element={<DischargeConditions />} />
          <Route path="/relatorio" element={<DentalReport />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/cadastro" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

