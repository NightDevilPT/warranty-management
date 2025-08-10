// src/modules/organization/dto/create-organization.dto.ts
import {
	IsString,
	IsNotEmpty,
	IsEmail,
	IsPhoneNumber,
	IsOptional,
	ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { ApiProperty } from '@nestjs/swagger';
  
  class AddressDto {
	@ApiProperty({ example: '123 Main St', required: false })
	@IsOptional()
	@IsString()
	street?: string;
  
	@ApiProperty({ example: 'New York', required: false })
	@IsOptional()
	@IsString()
	city?: string;
  
	@ApiProperty({ example: 'NY', required: false })
	@IsOptional()
	@IsString()
	state?: string;
  
	@ApiProperty({ example: '10001', required: false })
	@IsOptional()
	@IsString()
	postalCode?: string;
  
	@ApiProperty({ example: 'USA', required: false })
	@IsOptional()
	@IsString()
	country?: string;
  }
  
  export class CreateOrganizationDto {
	@ApiProperty({ example: 'Acme Corporation' })
	@IsNotEmpty()
	@IsString()
	name: string;
  
	@ApiProperty({ example: 'Pawan' })
	@IsNotEmpty()
	@IsString()
	ownerFirstName: string;
  
	@ApiProperty({ example: 'Kumar' })
	@IsNotEmpty()
	@IsString()
	ownerLastName: string;
  
	@ApiProperty({ example: 'acme-corp' })
	@IsNotEmpty()
	@IsString()
	slug: string;
  
	@ApiProperty({ 
	  example: 'https://example.com/logo.png',
	  required: false 
	})
	@IsOptional()
	@IsString()
	logo?: string = ''; // Default to null if not provided
  
	@ApiProperty({ type: AddressDto, required: false })
	@IsOptional()
	@ValidateNested()
	@Type(() => AddressDto)
	address?: AddressDto | null = null; // Default empty object
  
	@ApiProperty({ example: 'pawankumartadagsingh+1@gmail.com' })
	@IsNotEmpty()
	@IsEmail()
	email: string;
  
	@ApiProperty({ 
	  example: '+12025550123', 
	  description: 'Must be a valid international phone number' 
	})
	@IsNotEmpty()
	@IsPhoneNumber(undefined) // 'null' validates any region's phone number format
	phone: string;

	@ApiProperty({ example: 'Test@123' })
	@IsNotEmpty()
	@IsString()
	password: string;
  }