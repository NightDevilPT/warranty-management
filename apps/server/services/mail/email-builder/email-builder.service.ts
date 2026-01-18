// mail-builder.service.ts
import { Injectable } from '@nestjs/common';
import {
  EmailTemplateData,
  EmailTemplateOptions,
  WarrantyDetail,
  TimelineItem,
  FeatureItem,
  BuiltEmail
} from './email-builder.interface';
import { EMAIL_STYLES } from '../contants/email-styles.constants';

// Header Builder
class HeaderBuilder {
  private title: string;
  private subtitle?: string;
  private showLogo: boolean;
  private variables: EmailTemplateData;

  constructor(options: EmailTemplateOptions, variables: EmailTemplateData) {
    this.title = options.title;
    this.subtitle = options.subtitle;
    this.showLogo = options.showLogo ?? true;
    this.variables = variables;
  }

  withTitle(title: string): HeaderBuilder {
    this.title = title;
    return this;
  }

  withSubtitle(subtitle: string): HeaderBuilder {
    this.subtitle = subtitle;
    return this;
  }

  withoutLogo(): HeaderBuilder {
    this.showLogo = false;
    return this;
  }

  build(): string {
    const title = this.replaceVars(this.title);
    const subtitle = this.subtitle ? this.replaceVars(this.subtitle) : '';
    
    return `
      <div class="email-header">
        ${this.showLogo ? `
          <div class="logo-container">
            <a href="{{baseUrl}}" class="logo">{{companyName}}</a>
          </div>
        ` : ''}
        <h1>${title}</h1>
        ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
      </div>
    `;
  }

  private replaceVars(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.variables[key] !== undefined ? String(this.variables[key]) : match;
    });
  }
}

// Footer Builder
class FooterBuilder {
  private variables: EmailTemplateData;
  private socialLinks: Array<{ label: string; url: string; icon?: string }> = [];
  private showSocialLinks: boolean;

  constructor(variables: EmailTemplateData, showSocialLinks: boolean = true) {
    this.variables = variables;
    this.showSocialLinks = showSocialLinks;
  }

  withSocialLink(label: string, url: string, icon?: string): FooterBuilder {
    this.socialLinks.push({ label, url, icon: icon || '🔗' });
    return this;
  }

  withoutSocialLinks(): FooterBuilder {
    this.showSocialLinks = false;
    return this;
  }

  build(): string {
    const socialLinksHtml = this.showSocialLinks && this.socialLinks.length > 0 ? `
      <div class="social-links">
        ${this.socialLinks.map(link => `
          <a href="${this.replaceVars(link.url)}" class="social-link">
            ${link.icon || '🔗'} ${this.replaceVars(link.label)}
          </a>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="footer">
        <a href="{{baseUrl}}" class="footer-logo">{{companyName}}</a>
        <p class="footer-text">Professional Warranty Management System</p>
        
        <div class="contact-info">
          <span class="contact-icon">📧</span>
          <span>{{supportEmail}}</span>
        </div>
        <div class="contact-info">
          <span class="contact-icon">📞</span>
          <span>{{supportPhone}}</span>
        </div>
        <div class="contact-info">
          <span class="contact-icon">📍</span>
          <span>{{companyAddress}}</span>
        </div>
        
        ${socialLinksHtml}
        
        <p class="footer-text">
          Need help? Contact our support team or visit our 
          <a href="{{baseUrl}}/help">help center</a>
        </p>
        
        <p class="copyright">
          © {{currentYear}} {{companyName}}. All rights reserved.
        </p>
      </div>
    `;
  }

  private replaceVars(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.variables[key] !== undefined ? String(this.variables[key]) : match;
    });
  }
}

// Warranty Details Builder
class WarrantyDetailsBuilder {
  private details: WarrantyDetail[] = [];
  private variables: EmailTemplateData;
  private title: string = '📋 Warranty Details';

  constructor(variables: EmailTemplateData) {
    this.variables = variables;
  }

  withTitle(title: string): WarrantyDetailsBuilder {
    this.title = title;
    return this;
  }

  addDetail(label: string, value: string): WarrantyDetailsBuilder {
    this.details.push({ label, value });
    return this;
  }

  addDetails(details: WarrantyDetail[]): WarrantyDetailsBuilder {
    this.details.push(...details);
    return this;
  }

  build(): string {
    if (this.details.length === 0) {
      return '';
    }

    const detailsHtml = this.details.map(detail => `
      <div class="detail-row">
        <span class="detail-label">${this.replaceVars(detail.label)}</span>
        <span class="detail-value">${this.replaceVars(detail.value)}</span>
      </div>
    `).join('');

    return `
      <div class="warranty-details">
        <h3>${this.replaceVars(this.title)}</h3>
        ${detailsHtml}
      </div>
    `;
  }

  private replaceVars(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.variables[key] !== undefined ? String(this.variables[key]) : match;
    });
  }
}

// Timeline Builder
class TimelineBuilder {
  private items: TimelineItem[] = [];
  private variables: EmailTemplateData;

  constructor(variables: EmailTemplateData) {
    this.variables = variables;
  }

  addItem(date: string, title: string, description: string): TimelineBuilder {
    this.items.push({ date, title, description });
    return this;
  }

  addItems(items: TimelineItem[]): TimelineBuilder {
    this.items.push(...items);
    return this;
  }

  build(): string {
    if (this.items.length === 0) {
      return '';
    }

    const itemsHtml = this.items.map((item, index) => `
      <div class="timeline-item">
        <div class="timeline-icon">${index + 1}</div>
        <div class="timeline-content">
          <div class="timeline-date">${this.replaceVars(item.date)}</div>
          <div class="timeline-title">${this.replaceVars(item.title)}</div>
          <div class="timeline-description">${this.replaceVars(item.description)}</div>
        </div>
      </div>
    `).join('');

    return `
      <div class="timeline">
        ${itemsHtml}
      </div>
    `;
  }

  private replaceVars(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.variables[key] !== undefined ? String(this.variables[key]) : match;
    });
  }
}

// Features Builder
class FeaturesBuilder {
  private features: FeatureItem[] = [];
  private variables: EmailTemplateData;

  constructor(variables: EmailTemplateData) {
    this.variables = variables;
  }

  addFeature(icon: string, text: string): FeaturesBuilder {
    this.features.push({ icon, text });
    return this;
  }

  addFeatures(features: FeatureItem[]): FeaturesBuilder {
    this.features.push(...features);
    return this;
  }

  build(): string {
    if (this.features.length === 0) {
      return '';
    }

    const featuresHtml = this.features.map(feature => `
      <div class="feature-item">
        <span class="feature-icon">${feature.icon}</span>
        <span class="feature-text">${this.replaceVars(feature.text)}</span>
      </div>
    `).join('');

    return `
      <div class="features-grid">
        ${featuresHtml}
      </div>
    `;
  }

  private replaceVars(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.variables[key] !== undefined ? String(this.variables[key]) : match;
    });
  }
}

// Info Box Builder
class InfoBoxBuilder {
  private variables: EmailTemplateData;
  private type: 'info' | 'warning' | 'success' | 'error' = 'info';
  private title: string = '';
  private content: string = '';

  constructor(variables: EmailTemplateData) {
    this.variables = variables;
  }

  withTitle(title: string): InfoBoxBuilder {
    this.title = title;
    return this;
  }

  withContent(content: string): InfoBoxBuilder {
    this.content = content;
    return this;
  }

  asWarning(): InfoBoxBuilder {
    this.type = 'warning';
    return this;
  }

  asSuccess(): InfoBoxBuilder {
    this.type = 'success';
    return this;
  }

  asError(): InfoBoxBuilder {
    this.type = 'error';
    return this;
  }

  build(): string {
    const boxClass = this.type === 'warning' ? 'warning-box' : 
                     this.type === 'success' ? 'info-box success' : 
                     this.type === 'error' ? 'alert-box' : 'info-box';
    
    return `
      <div class="${boxClass}">
        <h3>${this.replaceVars(this.title)}</h3>
        <p>${this.replaceVars(this.content)}</p>
      </div>
    `;
  }

  private replaceVars(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.variables[key] !== undefined ? String(this.variables[key]) : match;
    });
  }
}

// Action Required Builder
class ActionRequiredBuilder {
  private variables: EmailTemplateData;
  private title: string = '';
  private content: string = '';
  private button?: { text: string; url: string };

  constructor(variables: EmailTemplateData) {
    this.variables = variables;
  }

  withTitle(title: string): ActionRequiredBuilder {
    this.title = title;
    return this;
  }

  withContent(content: string): ActionRequiredBuilder {
    this.content = content;
    return this;
  }

  withButton(text: string, url: string): ActionRequiredBuilder {
    this.button = { text, url };
    return this;
  }

  build(): string {
    let buttonHtml = '';
    if (this.button) {
      buttonHtml = `
        <div style="margin-top: 20px;">
          <a href="${this.replaceVars(this.button.url)}" class="button" target="_blank" style="text-decoration: none; color: white;">
            ${this.replaceVars(this.button.text)}
          </a>
        </div>
      `;
    }

    return `
      <div class="action-required">
        <h3>${this.replaceVars(this.title)}</h3>
        <p class="message">${this.replaceVars(this.content)}</p>
        ${buttonHtml}
      </div>
    `;
  }

  private replaceVars(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.variables[key] !== undefined ? String(this.variables[key]) : match;
    });
  }
}

// Main Email Builder Class - This is what users will work with
export class EmailBuilder {
  private sections: Array<{ type: string; content: string; data?: EmailTemplateData }> = [];
  private variables: EmailTemplateData = {};
  private options: EmailTemplateOptions;

  constructor(options: EmailTemplateOptions) {
    this.options = options;
    this.initializeDefaultVariables();
  }

  private initializeDefaultVariables(): void {
    this.variables = {
      baseUrl: 'https://warrantypro.com',
      currentYear: new Date().getFullYear(),
      supportEmail: 'support@warrantypro.com',
      supportPhone: '+1 (555) 123-4567',
      companyName: 'WarrantyPro',
      companyAddress: '123 Business Ave, Suite 100',
      appName: 'WarrantyPro',
      appUrl: 'https://app.warrantypro.com',
      customerName: 'Valued Customer'
    };
  }

  // Core builder method to set variables
  withVariables(variables: EmailTemplateData): EmailBuilder {
    this.variables = { ...this.variables, ...variables };
    return this;
  }

  // Header methods
  addHeader(customizer?: (builder: HeaderBuilder) => HeaderBuilder): EmailBuilder {
    const headerBuilder = new HeaderBuilder(this.options, this.variables);
    
    if (customizer) {
      customizer(headerBuilder);
    }
    
    this.sections.push({
      type: 'header',
      content: headerBuilder.build()
    });
    
    return this;
  }

  // Greeting methods
  addGreeting(name?: string, message?: string): EmailBuilder {
    const customerName = name || '{{customerName}}';
    const greeting = message || 'Welcome to {{companyName}}!';
    
    const content = `
      <div class="greeting">
        <p>Dear ${this.replaceVars(customerName)},</p>
        <p>${this.replaceVars(greeting)}</p>
      </div>
    `;
    
    this.sections.push({
      type: 'greeting',
      content
    });
    
    return this;
  }

  // Message methods
  addMessage(message: string, variables?: EmailTemplateData): EmailBuilder {
    const allVars = { ...this.variables, ...variables };
    const processedMessage = this.replaceVars(message, allVars);
    
    const content = `
      <div class="message">
        ${processedMessage.replace(/\n/g, '<br>')}
      </div>
    `;
    
    this.sections.push({
      type: 'message',
      content,
      data: variables
    });
    
    return this;
  }

  // Paragraph methods
  addParagraph(text: string, variables?: EmailTemplateData): EmailBuilder {
    const allVars = { ...this.variables, ...variables };
    const processedText = this.replaceVars(text, allVars);
    
    const content = `
      <p class="paragraph">
        ${processedText.replace(/\n/g, '<br>')}
      </p>
    `;
    
    this.sections.push({
      type: 'message',
      content,
      data: variables
    });
    
    return this;
  }

  // Button methods
  addButton(text: string, url: string, options: {
    secondary?: boolean;
    small?: boolean;
    align?: 'left' | 'center' | 'right';
  } = {}): EmailBuilder {
    const buttonClass = `button ${options.secondary ? 'button-secondary' : ''} ${options.small ? 'button-small' : ''}`;
    const align = options.align || 'center';
    
    const content = `
      <div style="text-align: ${align}; margin: 24px 0;">
        <a href="${this.replaceVars(url)}" class="${buttonClass}" target="_blank">
          ${this.replaceVars(text)}
        </a>
      </div>
    `;
    
    this.sections.push({
      type: 'button',
      content
    });
    
    return this;
  }

  // Warranty details methods
  addWarrantyDetails(customizer: (builder: WarrantyDetailsBuilder) => WarrantyDetailsBuilder): EmailBuilder {
    const detailsBuilder = new WarrantyDetailsBuilder(this.variables);
    customizer(detailsBuilder);
    
    const content = detailsBuilder.build();
    if (content) {
      this.sections.push({
        type: 'warranty',
        content
      });
    }
    
    return this;
  }

  // Timeline methods
  addTimeline(customizer: (builder: TimelineBuilder) => TimelineBuilder): EmailBuilder {
    const timelineBuilder = new TimelineBuilder(this.variables);
    customizer(timelineBuilder);
    
    const content = timelineBuilder.build();
    if (content) {
      this.sections.push({
        type: 'timeline',
        content
      });
    }
    
    return this;
  }

  // Features methods
  addFeatures(customizer: (builder: FeaturesBuilder) => FeaturesBuilder): EmailBuilder {
    const featuresBuilder = new FeaturesBuilder(this.variables);
    customizer(featuresBuilder);
    
    const content = featuresBuilder.build();
    if (content) {
      this.sections.push({
        type: 'features',
        content
      });
    }
    
    return this;
  }

  // Info box methods
  addInfoBox(customizer: (builder: InfoBoxBuilder) => InfoBoxBuilder): EmailBuilder {
    const infoBoxBuilder = new InfoBoxBuilder(this.variables);
    customizer(infoBoxBuilder);
    
    const content = infoBoxBuilder.build();
    this.sections.push({
      type: infoBoxBuilder['type'] === 'warning' ? 'warning' : 
            infoBoxBuilder['type'] === 'error' ? 'alert' : 'info',
      content
    });
    
    return this;
  }

  // Action required methods
  addActionRequired(customizer: (builder: ActionRequiredBuilder) => ActionRequiredBuilder): EmailBuilder {
    const actionBuilder = new ActionRequiredBuilder(this.variables);
    customizer(actionBuilder);
    
    const content = actionBuilder.build();
    this.sections.push({
      type: 'action',
      content
    });
    
    return this;
  }

  // Divider methods
  addDivider(): EmailBuilder {
    this.sections.push({
      type: 'divider',
      content: '<div class="divider"></div>'
    });
    
    return this;
  }

  // Footer methods
  addFooter(customizer?: (builder: FooterBuilder) => FooterBuilder): EmailBuilder {
    const footerBuilder = new FooterBuilder(this.variables, this.options.includeSocialLinks ?? true);
    
    if (customizer) {
      customizer(footerBuilder);
    }
    
    this.sections.push({
      type: 'footer',
      content: footerBuilder.build()
    });
    
    return this;
  }

  // Custom HTML methods
  addCustom(content: string, variables?: EmailTemplateData): EmailBuilder {
    this.sections.push({
      type: 'custom',
      content: this.replaceVars(content, variables),
      data: variables
    });
    
    return this;
  }

  // Build the final email
  build(): BuiltEmail {
    // First, replace variables in each section
    const processedSections = this.sections.map(section => ({
      ...section,
      content: this.replaceVars(section.content, section.data)
    }));

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.replaceVars(this.options.title)}</title>
        ${EMAIL_STYLES}
      </head>
      <body>
        <div class="email-container">
          ${processedSections.map(s => s.content).join('\n')}
        </div>
      </body>
      </html>
    `;

    return {
      html: this.replaceVars(html),
      text: this.generatePlainText(html),
      subject: this.replaceVars(this.options.title),
      previewText: this.options.previewText ? this.replaceVars(this.options.previewText) : undefined
    };
  }

  // Helper method to replace variables
  private replaceVars(text: string, customVars?: EmailTemplateData): string {
    const allVars = { ...this.variables, ...customVars };
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = allVars[key];
      if (value === undefined || value === null) {
        return match; // Return the original placeholder if variable not found
      }
      return String(value);
    });
  }

  // Generate plain text version
  private generatePlainText(html: string): string {
    let text = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n\n')
      .replace(/<\/p>/gi, '')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<h[1-6][^>]*>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '$2 ($1)')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();

    // Apply variable replacement to plain text
    text = this.replaceVars(text);
    
    return text;
  }
}

// Main Service - Just provides the builder creation method
@Injectable()
export class MailBuilderService {
  
  /**
   * Create a new email builder instance
   */
  createBuilder(options: EmailTemplateOptions): EmailBuilder {
    return new EmailBuilder(options);
  }
}