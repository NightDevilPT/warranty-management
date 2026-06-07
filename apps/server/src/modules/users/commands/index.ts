import { CreateUserHandler } from './handlers/create-user.handler';
import { UploadProfilePictureHandler } from './handlers/upload-profile-picture.handler';

export const UserCommandHandlers = [
  CreateUserHandler,
  UploadProfilePictureHandler,
];
