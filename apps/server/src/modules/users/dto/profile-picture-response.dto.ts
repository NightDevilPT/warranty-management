// apps/server/src/modules/users/dto/profile-picture-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class ProfilePictureResponseDto {
  @ApiProperty({
    description: 'URL of the uploaded profile picture',
    example:
      'http://localhost:4566/warranty-system-uploads/profiles/1234567890-abc123.jpg',
  })
  profileUrl: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Profile picture uploaded successfully',
  })
  message: string;

  constructor(
    profileUrl: string,
    message: string = 'Profile picture uploaded successfully',
  ) {
    this.profileUrl = profileUrl;
    this.message = message;
  }
}
