export const EMAIL_STYLES = `
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333333;
    background-color: #f5f7fa;
    margin: 0;
    padding: 20px;
  }
  
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e5e9;
  }
  
  .email-header {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    padding: 40px 30px;
    text-align: center;
  }
  
  .email-header h1 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .email-header .subtitle {
    font-size: 16px;
    opacity: 0.9;
    font-weight: 300;
  }
  
  .email-content {
    padding: 40px 30px;
  }
  
  .greeting {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20px;
  }
  
  .message {
    font-size: 16px;
    color: #4b5563;
    margin-bottom: 25px;
  }
  
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    padding: 12px 30px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    margin: 15px 0;
    border: none;
    cursor: pointer;
  }
  
  .button-secondary {
    background: linear-gradient(135deg, #6b7280, #4b5563);
  }
  
  .info-box {
    background: #f8fafc;
    border-left: 4px solid #2563eb;
    padding: 20px;
    margin: 25px 0;
    border-radius: 4px;
  }
  
  .info-box h3 {
    color: #1e40af;
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin: 25px 0;
  }
  
  .feature-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .feature-icon {
    color: #2563eb;
    font-size: 18px;
  }
  
  .footer {
    background: #f8fafc;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }
  
  .footer-text {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  .contact-info {
    color: #4b5563;
    font-size: 14px;
    margin: 5px 0;
  }
  
  .warranty-details {
    background: #fff7ed;
    border: 1px solid #fdba74;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }
  
  .warranty-details h3 {
    color: #ea580c;
    margin-bottom: 15px;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #fed7aa;
  }
  
  .detail-label {
    font-weight: 600;
    color: #7c2d12;
  }
  
  .detail-value {
    color: #ea580c;
  }
  
  @media (max-width: 600px) {
    body {
      padding: 10px;
    }
    
    .email-content {
      padding: 30px 20px;
    }
    
    .features-grid {
      grid-template-columns: 1fr;
    }
    
    .email-header {
      padding: 30px 20px;
    }
    
    .email-header h1 {
      font-size: 24px;
    }
  }
</style>
`;

export const EMAIL_HEADER = (title: string, subtitle?: string) => `
<div class="email-header">
  <h1>${title}</h1>
  ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
</div>
`;

export const EMAIL_FOOTER = `
<div class="footer">
  <p class="footer-text">WarrantyPro - Professional Warranty Management System</p>
  <p class="contact-info">📧 support@warrantypro.com | 📞 +1 (555) 123-4567</p>
  <p class="contact-info">📍 123 Business Ave, Suite 100, City, State 12345</p>
  <p class="footer-text">If you have any questions, please contact our support team.</p>
</div>
`;

export const EMAIL_BUTTON = (
  text: string,
  url: string,
  secondary: boolean = false,
) => `
<a href="${url}" class="button ${secondary ? 'button-secondary' : ''}" 
   target="_blank" style="text-decoration: none; color: white;">
  ${text}
</a>
`;

export const INFO_BOX = (title: string, content: string) => `
<div class="info-box">
  <h3>${title}</h3>
  <p>${content}</p>
</div>
`;
