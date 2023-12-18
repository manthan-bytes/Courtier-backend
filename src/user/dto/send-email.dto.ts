import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SendEmailDto {
  @ApiProperty({ example: "john@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "buyer" })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: "1" })
  @IsNumber()
  @IsNotEmpty()
  leadId: number;
}
