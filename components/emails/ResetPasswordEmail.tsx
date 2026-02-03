import * as React from "react";

interface ResetPasswordEmailProps {
  resetLink: string;
}

export const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  resetLink,
}) => (
  <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#333" }}>
    <h1>Password Reset Request</h1>
    <p>You requested a password reset for your Autoluzes account.</p>
    <p>Click the button below to reset your password:</p>
    <a
      href={resetLink}
      style={{
        display: "inline-block",
        backgroundColor: "#007bff",
        color: "#ffffff",
        padding: "10px 20px",
        textDecoration: "none",
        borderRadius: "5px",
        marginTop: "10px",
        marginBottom: "10px",
      }}
    >
      Reset Password
    </a>
    <p>
      If you did not request this, please ignore this email. The link will expire
      in 1 hour.
    </p>
    <p style={{ fontSize: "12px", color: "#888" }}>
      Autoluzes Team
    </p>
  </div>
);

export default ResetPasswordEmail;
