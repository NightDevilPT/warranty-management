import { Injectable } from '@nestjs/common';
import { IUser } from '@workspace/types';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getUser(): IUser {
    return {
      id: 1,
      name: 'John Doe',
      age: 30,
    };
  }
}
