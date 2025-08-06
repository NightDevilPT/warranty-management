import { verifyAdminEmailTemplate } from '../templates/verify-admin-email';
import { forgotPasswordTemplate } from '../templates/forget-password-email';
import { verifyConsumerEmailTemplate } from '../templates/verify-consumer-email';
import { verifyCompanyAdminAndPartnerEmailTemplate } from '../templates/verify-partner-company-admin-email';

// template.types.ts
export enum TemplateEnum {
  VERIFY_ADMIN_EMAIL = 'verify-admin-email',
  VERIFY_COMPANY_EMAIL = 'verify-company-email',
  VERIFY_CONSUMER_EMAIL = 'verify-consumer-email',
  FORGET_PASSWORD = 'forget-password',
  // You can add more templates here as needed
}

export interface TemplatePayloadMap {
  [TemplateEnum.VERIFY_ADMIN_EMAIL]: {
    username: string;
    url: string;
  };
  [TemplateEnum.FORGET_PASSWORD]: {
    username: string;
    url: string;
  };
  [TemplateEnum.VERIFY_COMPANY_EMAIL]: {
    username: string;
    url: string;
  };
  [TemplateEnum.VERIFY_CONSUMER_EMAIL]: {
    username: string;
    url: string;
  };
  // You can define other template payloads here as needed
}

export const templateFunctionMap: {
  [K in TemplateEnum]: (payload: TemplatePayloadMap[K]) => string;
} = {
  [TemplateEnum.VERIFY_ADMIN_EMAIL]: verifyAdminEmailTemplate,
  [TemplateEnum.FORGET_PASSWORD]: forgotPasswordTemplate,
  [TemplateEnum.VERIFY_COMPANY_EMAIL]:
    verifyCompanyAdminAndPartnerEmailTemplate,
  [TemplateEnum.VERIFY_CONSUMER_EMAIL]: verifyConsumerEmailTemplate,
};
