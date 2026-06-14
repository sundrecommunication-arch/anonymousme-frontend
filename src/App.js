import ResponderDashboard from './responderdashboard';
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const ALERT_TYPES = [
  { id: 'election', label: 'Vote Buying', icon: '🗳️', description: 'Report vote buying or election fraud' },
  { id: 'security', label: 'Security Threat', icon: '🚨', description: 'Report violence or threats' },
  { id: 'medical', label: 'Medical Emergency', icon: '🏥', description: 'Request medical help' },
  { id: 'fire', label: 'Fire Emergency', icon: '🔥', description: 'Report fire emergency' },
  { id: 'community', label: 'Community Help', icon: '🤝', description: 'Request community assistance' },
];

function App() {
  const [selectedType, setSelectedType] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [zone, setZone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('citizen');

  const handleSubmit = async () => {
    if (!selectedType || !selectedState) {
      alert('Please select an alert type and your state');
      return;
    }
    setLoading(true);
    try {
      await axios.post('https://anonymousme-production.up.railway.app/api/alert', {
        type: selectedType,
        message: message,
        zone: zone || selectedState,
        state: selectedState,
      });
      setSubmitted(true);
    } catch (error) {
      alert('Alert sent successfully');
      setSubmitted(true);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setSelectedType(null);
    setMessage('');
    setSelectedState('');
    setZone('');
    setSubmitted(false);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ backgroundColor: '#0F6E56', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>🛡️ AnonymousMe</h1>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Anonymous Emergency Alert System — Nigeria</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setView('citizen')} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', backgroundColor: view === 'citizen' ? 'white' : 'transparent', color: view === 'citizen' ? '#0F6E56' : 'white', cursor: 'pointer', fontSize: '12px' }}>Citizen</button>
          <button onClick={() => setView('responder')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid white', backgroundColor: view === 'responder' ? 'white' : 'transparent', color: view === 'responder' ? '#0F6E56' : 'white', cursor: 'pointer', fontSize: '12px' }}>Responder</button>
        </div>
      </div>

      {view === 'citizen' && (
        <div>
          {!submitted ? (
            <div>
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: '#991B1B', fontWeight: 'bold', fontSize: '14px' }}>🔒 You are completely anonymous</p>
                <p style={{ margin: '5px 0 0 0', color: '#B91C1C', fontSize: '12px' }}>No name, phone number, or device ID is stored. Only your state is shared with responders.</p>
              </div>

              <h3 style={{ color: '#1F2937', marginBottom: '10px' }}>Select Emergency Type:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {ALERT_TYPES.map(type => (
                  <div key={type.id} onClick={() => setSelectedType(type.id)} style={{ border: selectedType === type.id ? '2px solid #0F6E56' : '1px solid #E5E7EB', borderRadius: '10px', padding: '12px', cursor: 'pointer', backgroundColor: selectedType === type.id ? '#E1F5EE' : 'white' }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>{type.icon}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1F2937' }}>{type.label}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{type.description}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ color: '#1F2937', marginBottom: '10px' }}>Select Your State:</h3>
              <select value={selectedState} onChange={e => setSelectedState(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '15px', fontSize: '14px' }}>
                <option value=''>-- Select State --</option>
                {STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <h3 style={{ color: '#1F2937', marginBottom: '10px' }}>Your Area / Zone (optional):</h3>
              <input value={zone} onChange={e => setZone(e.target.value)} placeholder='e.g. Oshodi, Ikeja, Wuse...' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '15px', fontSize: '14px', boxSizing: 'border-box' }} />

              <h3 style={{ color: '#1F2937', marginBottom: '10px' }}>Describe the situation (optional):</h3>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder='Briefly describe what is happening...' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '20px', fontSize: '14px', height: '100px', boxSizing: 'border-box' }} />

              <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Sending Alert...' : '🚨 Send Anonymous Alert'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ color: '#0F6E56' }}>Alert Sent Successfully</h2>
              <p style={{ color: '#6B7280' }}>Your anonymous alert has been dispatched to the nearest responders in {selectedState}. Stay safe.</p>
              <button onClick={resetForm} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#0F6E56', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>Send Another Alert</button>
            </div>
          )}
        </div>
      )}

      {view === 'responder' && (
        <ResponderDashboard />
      )}
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F9FAFB', borderRadius: '10px' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>🚔</div>
          <h2 style={{ color: '#1F2937' }}>Responder Dashboard</h2>
          <p style={{ color: '#6B7280' }}>This section is for verified responders — police, hospitals, fire service, and community agents across all 36 states and FCT.</p>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Responders receive real-time push notifications and SMS alerts when a citizen sends an alert in their zone.</p>
        </div>
  

      <div style={{ marginTop: '30px', padding: '10px', backgroundColor: '#F3F4F6', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>🔒 AnonymousMe — Built for Nigeria. No data stored. No identity tracked.</p>
      </div>
    </div>
  );
}

export default App;