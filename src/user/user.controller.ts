import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { BaseResponseDto } from "src/helper/base-response.dto";

@Controller("user")
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("create")
  async create(@Body() createUserDto: CreateUserDto): Promise<BaseResponseDto> {
    return await this.userService.create(createUserDto);
  }

  @Get("getUserByEmail/:email")
  async getUserByEmail(@Param("email") email: string): Promise<BaseResponseDto> {
    return await this.userService.getUserByEmail(email);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() createUserDto: CreateUserDto): Promise<BaseResponseDto> {
    return await this.userService.update(+id, createUserDto);
  }
}
