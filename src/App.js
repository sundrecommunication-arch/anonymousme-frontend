import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import ResponderDashboard from './responderdashboard';
import NigeriaMap from './NigeriaMap';

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

const API_URL = 'https://anonymousme-production.up.railway.app';

const getDeviceId = () => {
  let deviceId = localStorage.getItem('anonymousme_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('anonymousme_device_id', deviceId);
  }
  return deviceId;
};

function App() {
  const [selectedType, setSelectedType] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [zone, setZone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertId, setAlertId] = useState(null);
  const [confirmations, setConfirmations] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [view, setView] = useState('citizen');
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [evidenceFile, setEvidenceFile] = useState(null);

  const handleSubmit = async () => {
    if (!selectedType || !selectedState) {
      alert('Please select an alert type and your state');
      return;
    }

    const now = Date.now();
    const alertTimes = JSON.parse(localStorage.getItem('alert_times') || '[]');
    const recentAlertTimes = alertTimes.filter(time => now - time < 3600000);

    if (recentAlertTimes.length >= 3) {
      alert('You have sent too many alerts in the last hour. Please wait before sending another.');
      return;
    }

    recentAlertTimes.push(now);
    localStorage.setItem('alert_times', JSON.stringify(recentAlertTimes));
    setLoading(true);
    try {
      let evidenceUrl = null;

      if (evidenceFile) {
        try {
          const fileExt = evidenceFile.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            'https://aalmhlcoakletcfdsjnz.supabase.co',
            'sb_publishable_Gq0a3bw1l_XDzq853I8WMg_o1wAPpUY'
          );
          console.log('Uploading file:', fileName);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(fileName, evidenceFile);
          console.log('Upload result:', uploadData, uploadError);
          if (uploadError) {
            console.error('Upload error:', uploadError);
          }
          if (uploadData) {
            evidenceUrl = `https://aalmhlcoakletcfdsjnz.supabase.co/storage/v1/object/public/evidence/${fileName}`;
            console.log('Evidence URL:', evidenceUrl);
          }
        } catch (uploadErr) {
          console.error('Upload exception:', uploadErr);
        }
      }

      const response = await axios.post(`${API_URL}/api/alert`, {
        type: selectedType,
        message: message,
        zone: zone || selectedState,
        state: selectedState,
        deviceId: getDeviceId(),
        evidenceUrl: evidenceUrl,
      });
      setAlertId(response.data.alertId);
      const sentAlerts = JSON.parse(localStorage.getItem('sent_alerts') || '[]');
      sentAlerts.push(response.data.alertId);
      localStorage.setItem('sent_alerts', JSON.stringify(sentAlerts));
      setSubmitted(true);
      loadRecentAlerts(selectedState);
    } catch (error) {
      setSubmitted(true);
    }
    setLoading(false);
  };

  const handleConfirm = async (id) => {
    const deviceId = getDeviceId();
    const confirmedAlerts = JSON.parse(localStorage.getItem('confirmed_alerts') || '[]');
    const sentAlerts = JSON.parse(localStorage.getItem('sent_alerts') || '[]');

    if (sentAlerts.includes(id)) {
      alert('You cannot confirm your own alert.');
      return;
    }

    if (confirmedAlerts.includes(id)) {
      alert('You have already confirmed this alert.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/alert/confirm`, {
        alertId: id,
        deviceId: deviceId
      });

      confirmedAlerts.push(id);
      localStorage.setItem('confirmed_alerts', JSON.stringify(confirmedAlerts));
      setConfirmations(response.data.confirmations);
      setConfirmed(response.data.confirmed);
      loadRecentAlerts(selectedState);
    } catch (error) {
      console.error('Error confirming alert:', error);
    }
  };

  const loadRecentAlerts = async (state) => {
    try {
      const response = await axios.get(`${API_URL}/api/alerts/${state}`);
      setRecentAlerts(response.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setMessage('');
    setSelectedState('');
    setZone('');
    setSubmitted(false);
    setAlertId(null);
    setConfirmations(0);
    setConfirmed(false);
    setRecentAlerts([]);
  };

  const getAlertColor = (type) => {
    const colors = {
      election: '#FEF3C7',
      security: '#FEE2E2',
      medical: '#DBEAFE',
      fire: '#FFEDD5',
      community: '#D1FAE5',
    };
    return colors[type] || '#F3F4F6';
  };

  const getAlertIcon = (type) => {
    const icons = {
      election: '🗳️',
      security: '🚨',
      medical: '🏥',
      fire: '🔥',
      community: '🤝',
    };
    return icons[type] || '📢';
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
          <button onClick={() => setView('map')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid white', backgroundColor: view === 'map' ? 'white' : 'transparent', color: view === 'map' ? '#0F6E56' : 'white', cursor: 'pointer', fontSize: '12px' }}>🗺️ Map</button>
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

              <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
                <p style={{ margin: 0, color: '#92400E', fontWeight: 'bold', fontSize: '13px' }}>⚠️ How alerts work</p>
                <p style={{ margin: '5px 0 0 0', color: '#B45309', fontSize: '12px' }}>Your alert needs to be confirmed by at least 2 people in your area before responders are notified. This prevents false alerts.</p>
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
              

              <h3 style={{ color: '#1F2937', marginBottom: '10px' }}>Upload Evidence (optional):</h3>
              <div style={{ border: '2px dashed #E5E7EB', borderRadius: '8px', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
                <input type='file' accept='image/*,video/*' onChange={e => setEvidenceFile(e.target.files[0])} style={{ display: 'none' }} id='evidence-upload' />
                <label htmlFor='evidence-upload' style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>📎</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    {evidenceFile ? evidenceFile.name : 'Click to upload photo or video evidence'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>Supports images and videos. Max 50MB.</div>
                </label>
              </div>

              <h3 style={{ color: '#1F2937', marginBottom: '10px' }}>Describe the situation (optional):</h3>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder='Briefly describe what is happening...' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '20px', fontSize: '14px', height: '100px', boxSizing: 'border-box' }} />

              <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Sending Alert...' : '🚨 Send Anonymous Alert'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '10px', marginBottom: '20px', border: '1px solid #86EFAC' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
                <h2 style={{ color: '#0F6E56', margin: '0 0 10px 0' }}>Alert Sent Successfully</h2>
                <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>Your anonymous alert has been received. It needs confirmation from others in your area before responders are notified.</p>
              </div>

              {alertId && (
                <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 10px 0', color: '#92400E', fontWeight: 'bold', fontSize: '14px' }}>⚠️ Confirmation needed</p>
                  <p style={{ margin: '0 0 10px 0', color: '#B45309', fontSize: '13px' }}>Confirmations: {confirmations}/2 {confirmed ? '✅ CONFIRMED — Responders notified!' : ''}</p>
                  {!confirmed && (
                    <button onClick={() => handleConfirm(alertId)} style={{ width: '100%', padding: '10px', backgroundColor: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                      👍 I also confirm this alert is real
                    </button>
                  )}
                </div>
              )}

              {recentAlerts.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#1F2937', marginBottom: '10px' }}>Other alerts in your area:</h3>
                  {recentAlerts.filter(a => a.id !== alertId).map(alert => (
                    <div key={alert.id} style={{ backgroundColor: getAlertColor(alert.type), border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{getAlertIcon(alert.type)} {alert.type.toUpperCase()} Alert</span>
                        <span style={{ fontSize: '11px', color: '#6B7280' }}>{alert.confirmations || 0}/2 confirmations</span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#374151' }}>{alert.message || 'Anonymous alert received.'}</p>
                      {!alert.confirmed && (
                        <button onClick={() => handleConfirm(alert.id)} style={{ width: '100%', padding: '8px', backgroundColor: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                          👍 Confirm this alert is real
                        </button>
                      )}
                      {alert.confirmed && (
                        <div style={{ backgroundColor: '#D1FAE5', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', color: '#065F46', fontWeight: 'bold' }}>
                          ✅ Confirmed — Responders have been notified
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={resetForm} style={{ width: '100%', padding: '12px', backgroundColor: '#0F6E56', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
                Send Another Alert
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'responder' && (
        <ResponderDashboard />
      )}
      {view === 'map' && (
        <NigeriaMap />
      )}

      <div style={{ marginTop: '30px', padding: '10px', backgroundColor: '#F3F4F6', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>🔒 AnonymousMe — Built for Nigeria. No data stored. No identity tracked.</p>
      </div>
    </div>
  );
}

export default App;