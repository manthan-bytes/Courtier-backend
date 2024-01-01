import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LEAD_TYPE } from 'src/enum/lead-type.enum';
import { PROPERTY_TYPE } from 'src/enum/property-type.enum';

export class UpdateLeadDto {
  @ApiPropertyOptional({ example: LEAD_TYPE.BUYER, enum: LEAD_TYPE })
  @IsString()
  @IsOptional()
  leadType: LEAD_TYPE;

  @ApiPropertyOptional({ example: PROPERTY_TYPE.SINGLE_FAMILY, enum: PROPERTY_TYPE })
  @IsString()
  @IsOptional()
  propertyType: PROPERTY_TYPE;

  @ApiPropertyOptional({ example: '2021-04-01' })
  @IsString()
  @IsOptional()
  propertySaleTime: string;

  @ApiPropertyOptional({ example: '2021-04-01' })
  @IsString()
  @IsOptional()
  propertyPurchaseTime: string;

  @ApiPropertyOptional({ example: { bedrooms: 2, bathrooms: 2 } })
  @IsOptional()
  preferences: JSON;

  @ApiPropertyOptional({ example: [{ city: 'Montreal', boroughs: 'Quebec' }] })
  @IsOptional()
  location: string;
}
