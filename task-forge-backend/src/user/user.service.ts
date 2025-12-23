import { Injectable } from '@nestjs/common';
import { prisma } from 'lib/prisma';
import {
  errorResponse,
  successResponse,
} from 'src/common/helper/response.helper';

@Injectable()
export class UserService {
  async getUsers(): Promise<any> {
    try {
      return successResponse(
        'User fetched successfully',
        await prisma.user.findMany(),
      );
    } catch (error: any) {
      return errorResponse('User fetching failed', error.message);
    }
  }
}
