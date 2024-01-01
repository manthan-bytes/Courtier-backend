import { Body, Controller, Param, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { BaseResponseDto } from "src/helper/base-response.dto";
import { RegisterDto } from "./dto/register.dto";
import { ApiBody, ApiTags } from "@nestjs/swagger";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("/register")
  async create(@Body() registerDto: RegisterDto): Promise<BaseResponseDto> {
    return await this.authService.register(registerDto);
  }

  @Post("/login")
  async login(@Body() loginDto: LoginDto): Promise<BaseResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post("/forgot-password")
  @ApiBody({
    schema: {
      example: {
        email: "john@gmail.com",
      },
    },
  })
  async forgotPassword(
    @Body("email") email: string,
  ): Promise<BaseResponseDto> {
    return await this.authService.forgotPassword(email);
  }

  @Post("/password-reset/:token")
  @ApiBody({
    schema: {
      example: {
        password: "Abc@1234",
      },
    },
  })
  async resetPassword(
    @Param("token") token: string,
    @Body("password") password: string,
  ): Promise<BaseResponseDto> {
    return await this.authService.resetPassword(token, password);
  }
}
