import { Injectable } from '@nestjs/common';
import { IUser } from '@workspace/types';
import { ApiResponse } from 'interfaces/api-response.interface';

@Injectable()
export class AppService {
  checkHealth(): ApiResponse<{message: string}> {
    return {
      status: 'success',
      statusCode: 200,
      message: 'Server is running',
      data: { message: 'Server is running' },
    };
  }
}
