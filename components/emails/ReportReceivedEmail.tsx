import * as React from 'react';

interface ReportReceivedEmailProps {
  plate: string;
  reporterName: string;
  reportId: string;
  vehicleMake?: string;
  vehicleModel?: string;
  selectedLights: string[];
}

export const ReportReceivedEmail: React.FC<ReportReceivedEmailProps> = ({
  plate,
  reporterName,
  reportId,
  vehicleMake,
  vehicleModel,
  selectedLights,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#000000' }}>
    <h1 style={{ color: '#ef4444' }}>⚠️ Alert: {plate} Reported</h1>
    <p>Hello,</p>
    <p>A new faulty light report has been submitted for your vehicle <strong>{plate}</strong> {vehicleMake ? `(${vehicleMake} ${vehicleModel || ''})` : ''}.</p>
    
    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px', margin: '20px 0' }}>
      <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#666' }}>Reported by: {reporterName}</p>
      <h3 style={{ marginTop: '0' }}>Faulty Lights Identified:</h3>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {selectedLights.map((light) => (
          <li key={light} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
            🔴 <span style={{ marginLeft: '10px', textTransform: 'capitalize' }}>{light.replace(/-/g, ' ')}</span>
          </li>
        ))}
      </ul>
    </div>

    <p>Please check your vehicle as soon as possible to ensure safety on the road.</p>

    <div style={{ textAlign: 'center', marginTop: '30px' }}>
      <a 
        href={`http://localhost:3000/reports/${reportId}`} 
        style={{ 
          backgroundColor: '#000000', 
          color: '#ffffff', 
          padding: '12px 24px', 
          borderRadius: '6px', 
          textDecoration: 'none', 
          fontWeight: 'bold',
          display: 'inline-block'
        }}
      >
        View Report Details
      </a>
    </div>

    <p style={{ marginTop: '40px', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      Autoluzes - Making roads safer, one light at a time.
    </p>
  </div>
);

export default ReportReceivedEmail;
