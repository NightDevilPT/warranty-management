// email-styles.ts
export const EMAIL_STYLES = `
<style>
  /* Base Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background-color: #f9fafb;
    margin: 0;
    padding: 20px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Container */
  .email-container {
    max-width: 640px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.02);
    border: 1px solid #e5e7eb;
  }
  
  /* Header */
  .email-header {
    background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
    color: white;
    padding: 48px 32px 40px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  
  .email-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #60a5fa, #93c5fd, #60a5fa);
  }
  
  .email-header h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: -0.025em;
  }
  
  .email-header .subtitle {
    font-size: 16px;
    opacity: 0.95;
    font-weight: 400;
    max-width: 80%;
    margin: 0 auto;
    line-height: 1.5;
  }
  
  /* Logo */
  .logo-container {
    margin-bottom: 24px;
  }
  
  .logo {
    font-size: 24px;
    font-weight: 700;
    color: white;
    text-decoration: none;
    display: inline-block;
  }
  
  /* Content */
  .email-content {
    padding: 48px 40px;
  }
  
  /* Greeting */
  .greeting {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 24px;
  }
  
  /* Message */
  .message {
    font-size: 16px;
    color: #4b5563;
    margin-bottom: 32px;
    line-height: 1.7;
  }
  
  /* Paragraph */
  .paragraph {
    margin-bottom: 20px;
    line-height: 1.7;
    color: #4b5563;
  }
  
  /* Buttons */
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    padding: 16px 36px;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    margin: 8px 0;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
  }
  
  .button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(37, 99, 235, 0.25);
  }
  
  .button-secondary {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    box-shadow: 0 4px 6px rgba(107, 114, 128, 0.2);
  }
  
  .button-small {
    padding: 10px 24px;
    font-size: 14px;
  }
  
  /* Info Boxes */
  .info-box {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-left: 5px solid #0ea5e9;
    padding: 24px;
    margin: 32px 0;
    border-radius: 8px;
  }
  
  .info-box h3 {
    color: #0369a1;
    margin-bottom: 12px;
    font-size: 18px;
    font-weight: 600;
  }
  
  .info-box p {
    color: #0c4a6e;
    margin: 0;
    line-height: 1.6;
  }
  
  .warning-box {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-left: 5px solid #f59e0b;
  }
  
  .warning-box h3 {
    color: #92400e;
  }
  
  .warning-box p {
    color: #78350f;
  }
  
  /* Alert Box */
  .alert-box {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 20px;
    margin: 24px 0;
  }
  
  .alert-box h3 {
    color: #dc2626;
    margin-bottom: 8px;
  }
  
  .alert-box p {
    color: #7f1d1d;
    margin: 0;
  }
  
  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 32px 0;
  }
  
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    transition: transform 0.2s ease;
  }
  
  .feature-item:hover {
    transform: translateY(-2px);
    background: #f1f5f9;
  }
  
  .feature-icon {
    color: #2563eb;
    font-size: 20px;
    flex-shrink: 0;
  }
  
  .feature-text {
    font-size: 14px;
    color: #374151;
    line-height: 1.5;
  }
  
  /* Footer */
  .footer {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 40px 32px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }
  
  .footer-logo {
    font-size: 20px;
    font-weight: 700;
    color: #1e40af;
    margin-bottom: 16px;
    display: block;
  }
  
  .footer-text {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 12px;
    line-height: 1.6;
  }
  
  .contact-info {
    color: #4b5563;
    font-size: 14px;
    margin: 6px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .contact-icon {
    opacity: 0.7;
  }
  
  .social-links {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 24px 0;
  }
  
  .social-link {
    color: #6b7280;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s ease;
  }
  
  .social-link:hover {
    color: #2563eb;
  }
  
  .copyright {
    color: #9ca3af;
    font-size: 13px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }
  
  /* Warranty Details */
  .warranty-details {
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border: 1px solid #fed7aa;
    border-radius: 12px;
    padding: 28px;
    margin: 28px 0;
  }
  
  .warranty-details h3 {
    color: #ea580c;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #fed7aa;
  }
  
  .detail-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .detail-label {
    font-weight: 600;
    color: #7c2d12;
    font-size: 14px;
  }
  
  .detail-value {
    color: #ea580c;
    font-weight: 500;
    font-size: 14px;
    text-align: right;
  }
  
  /* Action Required */
  .action-required {
    background: linear-gradient(135deg, #fef3f3 0%, #fee2e2 100%);
    border: 2px solid #fecaca;
    border-radius: 12px;
    padding: 24px;
    margin: 32px 0;
    text-align: center;
  }
  
  .action-required h3 {
    color: #dc2626;
    margin-bottom: 16px;
  }
  
  /* Timeline */
  .timeline {
    margin: 32px 0;
  }
  
  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .timeline-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .timeline-icon {
    width: 32px;
    height: 32px;
    background: #2563eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }
  
  .timeline-content {
    flex: 1;
  }
  
  .timeline-date {
    color: #6b7280;
    font-size: 13px;
    margin-bottom: 4px;
  }
  
  .timeline-title {
    color: #1f2937;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .timeline-description {
    color: #4b5563;
    font-size: 14px;
  }
  
  /* Divider */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    margin: 32px 0;
  }
  
  /* Mobile Responsive */
  @media (max-width: 640px) {
    body {
      padding: 12px;
    }
    
    .email-container {
      border-radius: 12px;
    }
    
    .email-content {
      padding: 32px 24px;
    }
    
    .email-header {
      padding: 40px 24px 32px;
    }
    
    .email-header h1 {
      font-size: 28px;
    }
    
    .features-grid {
      grid-template-columns: 1fr;
    }
    
    .footer {
      padding: 32px 24px;
    }
    
    .button {
      display: block;
      text-align: center;
      margin: 16px 0;
    }
  }
  
  /* Print Styles */
  @media print {
    body {
      background: white !important;
      padding: 0 !important;
    }
    
    .email-container {
      box-shadow: none !important;
      border: 1px solid #ddd !important;
    }
    
    .button {
      border: 1px solid #2563eb !important;
      background: white !important;
      color: #2563eb !important;
    }
  }
</style>
`;
