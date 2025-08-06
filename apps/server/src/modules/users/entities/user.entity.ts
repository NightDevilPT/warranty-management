import { Document, Types } from 'mongoose';
import { ROLES } from '../interface/user.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

type OrganizationTypes = Types.ObjectId | 'global';

@Schema({ _id: false })
export class UserRoles {
  @Prop({ type: String, enum: ROLES, required: true })
  role: ROLES; // Changed from [ROLES] to ROLES since it's a single value

  @Prop({ type: Types.ObjectId || String, required: true }) // Fixed the type definition
  organizationId: OrganizationTypes;

  @Prop({ type: Types.ObjectId || String, required: true }) // Fixed the type definition
  rootOrganizationId: OrganizationTypes;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true, index: true })
  firstName: string;

  @Prop({ required: true, trim: true, index: true })
  lastName: string;

  @Prop({ type: String, unique: true, index: true, required: true })
  username: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    index: true,
    trim: true,
  })
  email: string;

  @Prop({ type: String, default: null, required: false })
  avatar?: string | null;

  @Prop({
    required: true,
    trim: true,
    index: true,
    unique: true,
    match: /^\+?[1-9]\d{1,14}$/, // Optional: E.164 phone number regex pattern
  })
  contact: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: String, default: null, select: true })
  token?: string | null;

  @Prop({ type: Number, default: null, select: true })
  tokenExpire?: number | null;

  @Prop({ type: [UserRoles], default: [] }) // Fixed the type from 'a' to UserRoles and default to empty array
  roles?: UserRoles[];

  @Prop({ type: Boolean, default: false, select: true })
  verified?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Settings', default: null })
  settingsId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Permissions', default: null })
  permissionId?: Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Optional: Add indexes explicitly if you want (index decorators also work)
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ organizationId: 1 }); // Fixed from tenantId to organizationId to match your schema
