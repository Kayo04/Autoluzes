import * as React from 'react';

interface VerificationEmailProps {
  validationCode: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  validationCode,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#000000' }}>
    <h1 style={{ color: '#000000' }}>Confirm your email address</h1>
    <p>Please use the following code to verify your Autoluzes account:</p>
    
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f3f4f6', 
      borderRadius: '8px', 
      margin: '20px 0',
      textAlign: 'center' 
    }}>
      <span style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        letterSpacing: '5px',
        color: '#000000'
      }}>
        {validationCode}
      </span>
    </div>

    <p style={{ fontSize: '14px', color: '#666' }}>
      This code will expire in 15 minutes. If you didn't request this, you can ignore this email.
    </p>

    <p style={{ marginTop: '40px', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      Autoluzes - Making roads safer, one light at a time.
    </p>
  </div>
);

export default VerificationEmail;
