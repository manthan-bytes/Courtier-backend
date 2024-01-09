import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ContactInfoDto {
  @ApiProperty({ example: "john@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "john" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "doe" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 1234567890 })
  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;

  @ApiProperty({ example: "Description" })
  @IsString()
  @IsOptional()
  description: string;
}
