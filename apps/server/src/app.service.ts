// app.service.ts
import { Injectable } from '@nestjs/common';
import { EmailBuilder } from 'services/mail/email-builder/email-builder.service';
import fs from "fs"

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Pawan! Welcome to Warranty Management System';
  }

  private createEmailBuilder(options: any): EmailBuilder {
    return new EmailBuilder({
      title: options.title || 'Warranty Email',
      subtitle: options.subtitle || '',
      previewText: options.previewText || '',
      showLogo: options.showLogo !== false,
      includeSocialLinks: options.includeSocialLinks !== false
    });
  }

  getWarrantyNotificationEmail(query: any): string {
    try {
      const builder = this.createEmailBuilder({
        title: 'Your Warranty Details',
        subtitle: 'Important information about your product warranty',
        previewText: 'Your warranty information is ready'
      });

      const email = builder
        .withVariables({
          customerName: query.customerName || 'John Doe',
          productName: query.productName || 'iPhone 14 Pro',
          serialNumber: query.serialNumber || 'SN-123456789',
          purchaseDate: query.purchaseDate || '2023-10-15',
          warrantyStart: query.warrantyStart || '2023-10-15',
          warrantyEnd: query.warrantyEnd || '2025-10-15',
          warrantyStatus: query.warrantyStatus || 'Active',
          // Default variables
          baseUrl: 'https://warrantypro.com',
          companyName: 'WarrantyPro'
        })
        .addHeader(header => 
          header.withTitle('📱 Your Warranty Details')
        )
        .addGreeting()
        .addMessage(`
          Thank you for purchasing <strong>{{productName}}</strong>. 
          We're pleased to provide you with comprehensive warranty coverage for your product.
          
          Please keep this email for your records.
        `)
        .addWarrantyDetails(details => 
          details
            .addDetail('Product Name', '{{productName}}')
            .addDetail('Serial Number', '{{serialNumber}}')
            .addDetail('Purchase Date', '{{purchaseDate}}')
            .addDetail('Warranty Start', '{{warrantyStart}}')
            .addDetail('Warranty End', '{{warrantyEnd}}')
            .addDetail('Coverage Status', '{{warrantyStatus}}')
        )
        .addButton('View Full Details', '{{baseUrl}}/warranty/{{serialNumber}}')
        .addFooter()
        .build();

      return email.html;
    } catch (error) {
      return this.getFallbackEmail('Warranty Notification', error.message);
    }
  }

  getWarrantyExpiryEmail(query: any): string {
    try {
      const builder = this.createEmailBuilder({
        title: '⚠️ Warranty Expiry Alert',
        subtitle: 'Your warranty is about to expire',
        previewText: 'Action required: Your warranty expires soon'
      });

      const email = builder
        .withVariables({
          customerName: query.customerName || 'John Doe',
          productName: query.productName || 'iPhone 14 Pro',
          serialNumber: query.serialNumber || 'SN-123456789',
          expiryDate: query.expiryDate || '2024-12-31',
          daysLeft: query.daysLeft || '30',
          baseUrl: 'https://warrantypro.com',
          companyName: 'WarrantyPro'
        })
        .addHeader(header => 
          header.withTitle('⚠️ Warranty Expiry Alert')
        )
        .addGreeting()
        .addMessage(`
          Your warranty for <strong>{{productName}}</strong> will expire on <strong>{{expiryDate}}</strong>.
          That's only {{daysLeft}} days from now!
        `)
        .addButton('Extend Warranty', '{{baseUrl}}/extend/{{serialNumber}}')
        .addFooter()
        .build();

        fs.writeFileSync('warranty-expiry.html', email.html, 'utf8');
        console.log('Warranty expiry email saved to warranty-expiry.html');
      return email.html;
    } catch (error) {
      return this.getFallbackEmail('Warranty Expiry', error.message);
    }
  }

  getWelcomeEmail(query: any): string {
    try {
      const builder = this.createEmailBuilder({
        title: 'Welcome to WarrantyPro!',
        subtitle: 'Your warranty management journey begins here',
        previewText: 'Welcome to our warranty management platform'
      });

      const email = builder
        .withVariables({
          customerName: query.customerName || 'John Doe',
          baseUrl: 'https://warrantypro.com',
          companyName: 'WarrantyPro',
          appUrl: 'https://app.warrantypro.com'
        })
        .addHeader()
        .addGreeting('{{customerName}}', 'Thank you for choosing WarrantyPro!')
        .addMessage('Get started with managing all your warranties in one place.')
        .addButton('Get Started', '{{appUrl}}/dashboard')
        .addFooter()
        .build();

      return email.html;
    } catch (error) {
      return this.getFallbackEmail('Welcome Email', error.message);
    }
  }

  getClaimSubmissionEmail(query: any): string {
    try {
      const builder = this.createEmailBuilder({
        title: '✅ Claim Submitted Successfully',
        subtitle: 'Your warranty claim has been received',
        previewText: 'Your claim has been submitted and is being processed'
      });

      const email = builder
        .withVariables({
          customerName: query.customerName || 'John Doe',
          productName: query.productName || 'iPhone 14 Pro',
          claimNumber: query.claimNumber || 'CLM-2024-00123',
          submissionDate: query.submissionDate || new Date().toISOString().split('T')[0],
          baseUrl: 'https://warrantypro.com',
          companyName: 'WarrantyPro'
        })
        .addHeader(header => 
          header.withTitle('✅ Claim Submission Confirmed')
        )
        .addGreeting()
        .addMessage(`
          Thank you for submitting your warranty claim. We have received your request.
          <br><br>
          <strong>Claim Number:</strong> {{claimNumber}}
          <br>
          <strong>Product:</strong> {{productName}}
          <br>
          <strong>Submitted:</strong> {{submissionDate}}
        `)
        .addButton('View Claim Status', '{{baseUrl}}/claims/{{claimNumber}}')
        .addFooter()
        .build();

      return email.html;
    } catch (error) {
      return this.getFallbackEmail('Claim Submission', error.message);
    }
  }

  private getFallbackEmail(type: string, error: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
          .error { color: #dc2626; background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info { color: #065f46; background: #d1fae5; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>${type} Email</h1>
        <div class="error">
          <strong>Error:</strong> ${error}
        </div>
        <div class="info">
          This is a fallback email. Please check if EmailBuilder is properly implemented.
        </div>
      </body>
      </html>
    `;
  }
}