// apps/server/src/modules/users/dto/upload-profile-picture.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePictureDto {
  @ApiProperty({
    description: 'Profile picture file (jpg, jpeg, png, webp - max 5MB)',
    type: 'string',
    format: 'binary',
    required: true,
  })
  profilePicture: Express.Multer.File;
}
