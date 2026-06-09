import { CreateUserHandler } from './handlers/create-user.handler';
import { UpdateProfileHandler } from './handlers/update-profile.handler';
import { UploadProfilePictureHandler } from './handlers/upload-profile-picture.handler';
import { ChangePasswordHandler } from './handlers/change-password.handler';

export const UserCommandHandlers = [
  CreateUserHandler,
  UpdateProfileHandler,
  UploadProfilePictureHandler,
  ChangePasswordHandler,
];
