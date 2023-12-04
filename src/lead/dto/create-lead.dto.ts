import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LEAD_TYPE } from 'src/enum/lead-type.enum';
import { PROPERTY_TYPE } from 'src/enum/property-type.enum';

export class CreateLeadDto {
  @ApiProperty({ example: LEAD_TYPE.BUYER, enum: LEAD_TYPE })
  @IsString()
  @IsNotEmpty()
  leadType: LEAD_TYPE;

  @ApiProperty({ example: PROPERTY_TYPE.SINGLE_FAMILY, enum: PROPERTY_TYPE })
  @IsString()
  @IsNotEmpty()
  propertyType: PROPERTY_TYPE;

  @ApiPropertyOptional({ example: '2021-04-01' })
  @IsString()
  @IsOptional()
  propertySaleTime: string;

  @ApiPropertyOptional({ example: '2021-04-01' })
  @IsString()
  @IsOptional()
  propertyPurchaseTime: string;

  @ApiProperty({ example: { bedrooms: 2, bathrooms: 2 } })
  @IsOptional()
  preferences: JSON;

  @ApiProperty({ example: [{ city: 'Montreal', boroughs: 'Quebec' }] })
  @IsOptional()
  location: JSON;

  @ApiProperty({ example: 1 })
  @IsString()
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
  files?: any[];

  @IsOptional()
  propertyImage: string[];
}
