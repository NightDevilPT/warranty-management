import { UpdateProfileHandler } from './handlers/update-profile.handler';
import { ChangePasswordHandler } from './handlers/change-password.handler';
import { UploadProfilePictureHandler } from './handlers/upload-profile-picture.handler';

export const ProfileCommandHandlers = [
  UpdateProfileHandler,
  ChangePasswordHandler,
  UploadProfilePictureHandler,
];
