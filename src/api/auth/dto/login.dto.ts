import { ApiProperty, } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "john@gmail.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Abc@1234" })
  @IsNotEmpty()
  @IsString()
  password: string;
}
