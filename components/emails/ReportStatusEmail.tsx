import * as React from 'react';

interface ReportStatusEmailProps {
  plate: string;
  status: 'acknowledged' | 'resolved';
  reportId: string;
  ownerResponse?: string;
  updatedAt: string;
}

export const ReportStatusEmail: React.FC<ReportStatusEmailProps> = ({
  plate,
  status,
  reportId,
  ownerResponse,
  updatedAt,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#000000' }}>
    <h1 style={{ color: status === 'resolved' ? '#22c55e' : '#3b82f6' }}>
      {status === 'resolved' ? '✅ Issue Resolved' : '👀 Report Seen'}
    </h1>
    <p>Hello,</p>
    <p>Good news! The owner of vehicle <strong>{plate}</strong> has updated the status of your report.</p>
    
    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px', margin: '20px 0' }}>
      <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#666' }}>New Status:</p>
      <div style={{ 
        display: 'inline-block', 
        padding: '6px 12px', 
        borderRadius: '20px', 
        backgroundColor: status === 'resolved' ? '#dcfce7' : '#dbeafe', 
        color: status === 'resolved' ? '#166534' : '#1e40af',
        fontWeight: 'bold',
        textTransform: 'capitalize',
        marginBottom: '15px'
      }}>
        {status}
      </div>

      {ownerResponse && (
        <>
          <p style={{ margin: '15px 0 5px', fontSize: '14px', color: '#666' }}>Message from Owner:</p>
          <blockquote style={{ 
            borderLeft: '4px solid #ccc', 
            margin: '0', 
            paddingLeft: '15px', 
            fontStyle: 'italic',
            color: '#333'
          }}>
            "{ownerResponse}"
          </blockquote>
        </>
      )}
    </div>

    <p>Thank you for contributing to safer roads!</p>

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
        View Report Status
      </a>
    </div>

    <p style={{ marginTop: '40px', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      Autoluzes - Making roads safer, one light at a time.
    </p>
  </div>
);

export default ReportStatusEmail;
