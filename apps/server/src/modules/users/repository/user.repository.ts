// user/user.repository.ts
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'common/repository/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel);
  }

  async findUserByEmailWithPassword(email: string): Promise<User | null> {
    return this.model.findOne({ email: email.toLowerCase() }).select('email password roles verified firstName lastName').exec();
  }
}
