import { Injectable } from '@nestjs/common';
import { IUser } from '@workspace/types';

@Injectable()
export class AppService {
  getHello(): { message: string } {
    return {
      message: 'Hello World!',
    };
  }
}
