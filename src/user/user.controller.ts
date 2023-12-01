import { Body, Controller, Post } from "@nestjs/common";
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
}
