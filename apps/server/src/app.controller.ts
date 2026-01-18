// app.controller.ts - Updated with email template endpoints
import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('email/warranty-notification')
  getWarrantyNotificationEmail(@Query() query: any): string {
    return this.appService.getWarrantyNotificationEmail(query);
  }

  @Get('email/warranty-expiry')
  getWarrantyExpiryEmail(@Query() query: any): string {
    return this.appService.getWarrantyExpiryEmail(query);
  }

  @Get('email/welcome')
  getWelcomeEmail(@Query() query: any): string {
    return this.appService.getWelcomeEmail(query);
  }

  @Get('email/claim-submission')
  getClaimSubmissionEmail(@Query() query: any): string {
    return this.appService.getClaimSubmissionEmail(query);
  }
}