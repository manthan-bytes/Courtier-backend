import { IsEmail, IsNotEmpty, } from "class-validator";
import { ApiProperty, } from "@nestjs/swagger";

export class SendEmailDto {
  @ApiProperty({ example: "john@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}