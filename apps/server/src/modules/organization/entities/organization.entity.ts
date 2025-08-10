// src/modules/organization/schema/organization.schema.ts
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true, collection: 'organizations' })
export class Organization {
  // Single field index already defined in @Prop
  @Prop({ required: true, unique: true, trim: true, index: true })
  name: string;

  // Single field index already defined in @Prop
  @Prop({ required: true, unique: true, trim: true, index: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    default: null,
    index: true,
  })
  rootOrganizationId: Types.ObjectId | null;

  @Prop({ type: String })
  logo?: string;

  @Prop({
    type: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    _id: false,
  })
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;

  // Single field index already defined in @Prop
  @Prop({ required: true, trim: true, lowercase: true, index: true })
  email: string;

  // Single field index added in @Prop
  @Prop({ required: true, trim: true, index: true })
  ownerFirstName: string;

  // Single field index added in @Prop
  @Prop({ required: true, trim: true, index: true })
  ownerLastName: string;

  @Prop({ required: true, trim: true, index: true })
  phone: string;

  // Single field index already defined in @Prop
  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  companyAdmins?: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  partners?: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  consumers?: Types.ObjectId[];

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
