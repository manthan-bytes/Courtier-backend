import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {

  @ApiPropertyOptional({ example: "John Doe" })
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({ example: "john@gmail.com" })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiPropertyOptional({ example: "12345678" })
  @IsString()
  @IsOptional()
  phone: string;
}
