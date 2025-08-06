import { Injectable } from '@nestjs/common';
import { IUser } from '@workspace/types';
import { IApiResponse } from 'interfaces/api-response.interface';

@Injectable()
export class AppService {
  checkHealth(): IApiResponse<{message: string}> {
    return {
      status: 'success',
      statusCode: 200,
      message: 'Server is running',
      data: { message: 'Server is running' },
    };
  }
}
