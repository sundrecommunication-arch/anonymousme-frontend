import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const API_URL = 'https://anonymousme-production.up.railway.app';

const NIGERIA_STATES = [
  { name: 'Abia', lat: 5.4527, lng: 7.5248 },
  { name: 'Adamawa', lat: 9.3265, lng: 12.3984 },
  { name: 'Akwa Ibom', lat: 4.9057, lng: 7.8537 },
  { name: 'Anambra', lat: 6.2209, lng: 6.9370 },
  { name: 'Bauchi', lat: 10.3158, lng: 9.8442 },
  { name: 'Bayelsa', lat: 4.7719, lng: 6.0699 },
  { name: 'Benue', lat: 7.1906, lng: 8.7894 },
  { name: 'Borno', lat: 11.8846, lng: 13.1571 },
  { name: 'Cross River', lat: 5.8702, lng: 8.5988 },
  { name: 'Delta', lat: 5.5320, lng: 5.8987 },
  { name: 'Ebonyi', lat: 6.2649, lng: 8.0137 },
  { name: 'Edo', lat: 6.3350, lng: 5.6037 },
  { name: 'Ekiti', lat: 7.7190, lng: 5.3110 },
  { name: 'Enugu', lat: 6.4584, lng: 7.5464 },
  { name: 'FCT', lat: 9.0579, lng: 7.4951 },
  { name: 'Gombe', lat: 10.2791, lng: 11.1670 },
  { name: 'Imo', lat: 5.4921, lng: 7.0254 },
  { name: 'Jigawa', lat: 12.2280, lng: 9.5616 },
  { name: 'Kaduna', lat: 10.5222, lng: 7.4383 },
  { name: 'Kano', lat: 11.9964, lng: 8.5122 },
  { name: 'Katsina', lat: 12.9816, lng: 7.6183 },
  { name: 'Kebbi', lat: 11.4942, lng: 4.2333 },
  { name: 'Kogi', lat: 7.7337, lng: 6.6906 },
  { name: 'Kwara', lat: 8.9669, lng: 4.3874 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Nasarawa', lat: 8.4994, lng: 8.1997 },
  { name: 'Niger', lat: 9.9309, lng: 5.5983 },
  { name: 'Ogun', lat: 6.9980, lng: 3.4737 },
  { name: 'Ondo', lat: 6.9149, lng: 5.1478 },
  { name: 'Osun', lat: 7.5629, lng: 4.5200 },
  { name: 'Oyo', lat: 7.8492, lng: 3.9307 },
  { name: 'Plateau', lat: 9.2182, lng: 9.5179 },
  { name: 'Rivers', lat: 4.8396, lng: 6.9112 },
  { name: 'Sokoto', lat: 13.0059, lng: 5.2476 },
  { name: 'Taraba', lat: 7.9994, lng: 10.7739 },
  { name: 'Yobe', lat: 12.2939, lng: 11.4390 },
  { name: 'Zamfara', lat: 12.1222, lng: 6.2236 },
];

const ALERT_COLORS = {
  election: '#F59E0B',
  security: '#EF4444',
  medical: '#3B82F6',
  fire: '#F97316',
  community: '#10B981',
};

function NigeriaMap() {
  const [stateAlerts, setStateAlerts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    fetchAllAlerts();
    const interval = setInterval(fetchAllAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllAlerts = async () => {
    try {
      const alertsByState = {};
      await Promise.all(
        NIGERIA_STATES.map(async (state) => {
          const response = await axios.get(`${API_URL}/api/alerts/${state.name}`);
          if (response.data && response.data.length > 0) {
            alertsByState[state.name] = response.data;
          }
        })
      );
      setStateAlerts(alertsByState);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  const getAlertColor = (alerts) => {
    if (!alerts || alerts.length === 0) return '#6B7280';
    const types = alerts.map(a => a.type);
    if (types.includes('security')) return ALERT_COLORS.security;
    if (types.includes('election')) return ALERT_COLORS.election;
    if (types.includes('medical')) return ALERT_COLORS.medical;
    if (types.includes('fire')) return ALERT_COLORS.fire;
    return ALERT_COLORS.community;
  };

  const getRadius = (alerts) => {
    if (!alerts || alerts.length === 0) return 8;
    return Math.min(8 + alerts.length * 4, 30);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
        <p>Loading Nigeria alert map...</p>
      </div>
    );
  }

  const totalAlerts = Object.values(stateAlerts).reduce((sum, alerts) => sum + alerts.length, 0);
  const activeStates = Object.keys(stateAlerts).length;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
        <div style={{ backgroundColor: '#FEE2E2', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991B1B' }}>{totalAlerts}</div>
          <div style={{ fontSize: '12px', color: '#B91C1C' }}>Total Active Alerts</div>
        </div>
        <div style={{ backgroundColor: '#FEF3C7', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400E' }}>{activeStates}</div>
          <div style={{ fontSize: '12px', color: '#B45309' }}>States with Alerts</div>
        </div>
        <div style={{ backgroundColor: '#D1FAE5', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#065F46' }}>36</div>
          <div style={{ fontSize: '12px', color: '#0F6E56' }}>States Monitored</div>
        </div>
      </div>

      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {Object.entries(ALERT_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }}></div>
            <span style={{ color: '#374151', textTransform: 'capitalize' }}>{type === 'election' ? 'Vote Buying' : type}</span>
          </div>
        ))}
      </div>

      <MapContainer
        center={[9.0820, 8.6753]}
        zoom={6}
        style={{ height: '450px', width: '100%', borderRadius: '10px', border: '1px solid #E5E7EB' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {NIGERIA_STATES.map((state) => (
          <CircleMarker
            key={state.name}
            center={[state.lat, state.lng]}
            radius={getRadius(stateAlerts[state.name])}
            fillColor={getAlertColor(stateAlerts[state.name])}
            color={stateAlerts[state.name] ? '#fff' : '#9CA3AF'}
            weight={2}
            opacity={1}
            fillOpacity={stateAlerts[state.name] ? 0.8 : 0.3}
            eventHandlers={{
              click: () => setSelectedState(state.name)
            }}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <strong style={{ fontSize: '14px' }}>{state.name}</strong>
                <br />
                {stateAlerts[state.name] ? (
                  <div>
                    <p style={{ margin: '5px 0', color: '#DC2626', fontSize: '13px' }}>
                      {stateAlerts[state.name].length} active alert(s)
                    </p>
                    {stateAlerts[state.name].slice(0, 3).map(alert => (
                      <div key={alert.id} style={{ fontSize: '12px', margin: '3px 0', padding: '3px 6px', backgroundColor: '#FEF2F2', borderRadius: '4px' }}>
                        {alert.type === 'election' ? '🗳️' : alert.type === 'security' ? '🚨' : alert.type === 'medical' ? '🏥' : '🔥'} {alert.type.toUpperCase()}
                        {alert.confirmed && <span style={{ color: '#059669', marginLeft: '5px' }}>✅ Confirmed</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: '5px 0', color: '#6B7280', fontSize: '13px' }}>No active alerts</p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {selectedState && stateAlerts[selectedState] && (
        <div style={{ marginTop: '15px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '15px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#991B1B' }}>🚨 Active Alerts in {selectedState}</h3>
          {stateAlerts[selectedState].map(alert => (
            <div key={alert.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '10px', marginBottom: '8px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{alert.type.toUpperCase()} Alert</span>
                <span style={{ fontSize: '11px', color: alert.confirmed ? '#059669' : '#F59E0B' }}>
                  {alert.confirmed ? '✅ Confirmed' : `${alert.confirmations || 0}/2 confirmations`}
                </span>
              </div>
              {alert.message && <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#374151' }}>{alert.message}</p>}
            </div>
          ))}
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#9CA3AF', marginTop: '10px' }}>
        Map updates every 30 seconds. Click on any state to see alerts.
      </p>
    </div>
  );
}

export default NigeriaMap;