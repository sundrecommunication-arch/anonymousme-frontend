import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { requestNotificationPermission } from './firebase';

const API_URL = 'https://anonymousme-production.up.railway.app';

const RESPONDER_TYPES = [
  { id: 'police', label: 'Police / NPF', icon: '🚔' },
  { id: 'hospital', label: 'Hospital / EMS', icon: '🏥' },
  { id: 'fire-service', label: 'Fire Service', icon: '🚒' },
  { id: 'lasema', label: 'LASEMA', icon: '🆘' },
  { id: 'volunteer', label: 'Community Volunteer', icon: '🤝' },
];

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

function ResponderDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [responderType, setResponderType] = useState('');
  const [responderName, setResponderName] = useState('');
  const [responderState, setResponderState] = useState('');
  const [responderPhone, setResponderPhone] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/alerts/${responderState}`);
      setAlerts(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, [responderState]);

  useEffect(() => {
    if (isLoggedIn && responderState) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, responderState, fetchAlerts]);

  const handleLogin = async () => {
    if (!responderType || !responderName || !responderState || !responderPhone) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const fcmToken = await requestNotificationPermission();
      await axios.post(`${API_URL}/api/responder/register`, {
        name: responderName,
        type: responderType,
        zone: responderState,
        phone: responderPhone,
        fcmToken: fcmToken,
      });
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  };

 const handleResolve = async (alertId) => {
    try {
      await axios.post(`${API_URL}/api/alert/resolve`, { alertId });
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleFalseAlert = async (alertId) => {
    try {
      await axios.post(`${API_URL}/api/alert/false`, { alertId });
      setAlerts(alerts.filter(a => a.id !== alertId));
      alert('Alert marked as false. Thank you for the feedback.');
    } catch (error) {
      console.error('Error marking false alert:', error);
    }
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

  if (!isLoggedIn) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <div style={{ backgroundColor: '#1E3A5F', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>🚔 Responder Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>AnonymousMe — Nigeria Emergency Response</p>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '20px' }}>
          <h3 style={{ color: '#1F2937', marginBottom: '15px' }}>Responder Login</h3>

          <label style={{ fontSize: '13px', color: '#6B7280', display: 'block', marginBottom: '5px' }}>Full Name / Unit Name</label>
          <input
            value={responderName}
            onChange={e => setResponderName(e.target.value)}
            placeholder='e.g. Officer Bello / Lagos State Fire Service'
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '15px', fontSize: '14px', boxSizing: 'border-box' }}
          />

          <label style={{ fontSize: '13px', color: '#6B7280', display: 'block', marginBottom: '5px' }}>Responder Type</label>
          <select
            value={responderType}
            onChange={e => setResponderType(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '15px', fontSize: '14px' }}
          >
            <option value=''>-- Select Type --</option>
            {RESPONDER_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
            ))}
          </select>

          <label style={{ fontSize: '13px', color: '#6B7280', display: 'block', marginBottom: '5px' }}>Your State</label>
          <select
            value={responderState}
            onChange={e => setResponderState(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '15px', fontSize: '14px' }}
          >
            <option value=''>-- Select State --</option>
            {STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <label style={{ fontSize: '13px', color: '#6B7280', display: 'block', marginBottom: '5px' }}>Phone Number</label>
          <input
            value={responderPhone}
            onChange={e => setResponderPhone(e.target.value)}
            placeholder='e.g. 08012345678'
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '20px', fontSize: '14px', boxSizing: 'border-box' }}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#1E3A5F', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Logging in...' : '🔐 Access Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <div style={{ backgroundColor: '#1E3A5F', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px' }}>🚔 {responderName}</h1>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', opacity: 0.8 }}>{responderState} · {RESPONDER_TYPES.find(t => t.id === responderType)?.label}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', opacity: 0.7 }}>Last updated</div>
          <div style={{ fontSize: '12px' }}>{lastUpdated || 'Loading...'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#FEE2E2', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991B1B' }}>{alerts.filter(a => a.status === 'new').length}</div>
          <div style={{ fontSize: '12px', color: '#B91C1C' }}>New Alerts</div>
        </div>
        <div style={{ backgroundColor: '#FEF3C7', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400E' }}>{alerts.length}</div>
          <div style={{ fontSize: '12px', color: '#B45309' }}>Total Active</div>
        </div>
        <div style={{ backgroundColor: '#D1FAE5', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#065F46' }}>{responderState}</div>
          <div style={{ fontSize: '12px', color: '#0F6E56' }}>Your Zone</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#1F2937' }}>Active Alerts in {responderState}</h3>
        <button
          onClick={fetchAlerts}
          style={{ padding: '8px 16px', backgroundColor: '#1E3A5F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
        >
          🔄 Refresh
        </button>
      </div>

      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#F9FAFB', borderRadius: '10px', color: '#6B7280' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
          <p>No active alerts in {responderState} right now.</p>
          <p style={{ fontSize: '12px' }}>Dashboard refreshes every 30 seconds automatically.</p>
        </div>
      ) : (
        alerts.map(alert => (
          <div key={alert.id} style={{ backgroundColor: getAlertColor(alert.type), border: '1px solid #E5E7EB', borderRadius: '10px', padding: '15px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getAlertIcon(alert.type)}</span>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1F2937', textTransform: 'uppercase' }}>{alert.type} Alert</span>
              </div>
              <span style={{ fontSize: '11px', color: '#6B7280' }}>{alert.zone || alert.state}</span>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#374151' }}>{alert.message || 'Anonymous alert received. Please respond immediately.'}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleResolve(alert.id)}
                style={{ flex: 1, padding: '8px', backgroundColor: '#0F6E56', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                ✅ Mark Resolved
              </button>
             <button
                style={{ flex: 1, padding: '8px', backgroundColor: '#1E3A5F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                📞 Call for Backup
              </button>
              <button
                onClick={() => handleFalseAlert(alert.id)}
                style={{ flex: 1, padding: '8px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                ❌ False Alert
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ResponderDashboard;