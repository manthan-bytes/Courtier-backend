import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "john@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: "12345678" })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ example: "Abc@1234" })
  @IsString()
  @IsNotEmpty()
  password: string;

}