import { forgotPasswordTemplate } from '../templates/forget-password-email';
import { verifyAdminEmailTemplate } from '../templates/verify-admin-email';

// template.types.ts
export enum TemplateEnum {
  VERIFY_EMAIL = 'verify-email',
  FORGET_PASSWORD = 'forget-password',
  // You can add more templates here as needed
}

export interface TemplatePayloadMap {
  [TemplateEnum.VERIFY_EMAIL]: {
    username: string;
    url: string;
  };
  [TemplateEnum.FORGET_PASSWORD]: {
    username: string;
    url: string;
  };
  // You can define other template payloads here as needed
}

export const templateFunctionMap: {
  [K in TemplateEnum]: (payload: TemplatePayloadMap[K]) => string;
} = {
  [TemplateEnum.VERIFY_EMAIL]: verifyAdminEmailTemplate,
  [TemplateEnum.FORGET_PASSWORD]: forgotPasswordTemplate,
};
