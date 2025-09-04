import { TemplateEnum } from 'services/mail/helpers/template-generator';
import { ROLES } from 'src/modules/users/interface/user.interface';

export interface RoleConfig {
  urlKey: string;
  template: TemplateEnum;
}

export const RoleConfigUrlMap: Record<string, RoleConfig> = {
  [ROLES.ADMIN]: {
    urlKey: 'ADMIN_URL',
    template: TemplateEnum.VERIFY_ADMIN_EMAIL,
  },
  [ROLES.COMPANY_ADMIN]: {
    urlKey: 'COMPANY_URL',
    template: TemplateEnum.VERIFY_COMPANY_EMAIL,
  },
  [ROLES.PARTNER]: {
    urlKey: 'COMPANY_URL',
    template: TemplateEnum.VERIFY_COMPANY_EMAIL,
  },
  default: {
    urlKey: 'CONSUMER_URL',
    template: TemplateEnum.VERIFY_CONSUMER_EMAIL,
  },
};
