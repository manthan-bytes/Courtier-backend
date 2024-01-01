import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { ROLES } from "src/enum/roles.enum";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { BaseResponseDto } from "src/helper/base-response.dto";
import { SendEmailDto } from "./dto/send-email.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { GetUserListDto } from "./dto/get-user-list.dto";

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

  @Post('sendEmail')
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<BaseResponseDto> {
    return await this.userService.sendEmail(sendEmailDto);
  }

  @Post('chatbot')
  async chatbot(@Body() question: string): Promise<BaseResponseDto> {
    return await this.userService.generateResponse(question);
  }

  @Post('admin/addUser')
  async addUser(@Body() createUserDto: CreateUserDto): Promise<BaseResponseDto> {
    return await this.userService.addUser(createUserDto);
  }

  @Post('admin/getAllUser')
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(ROLES.ADMIN)
  async findAll(@Body() getUserListDto: GetUserListDto): Promise<BaseResponseDto> {
    return await this.userService.findAll(getUserListDto);
  }

  @Get("admin/findOne/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(ROLES.ADMIN)
  async findOne(@Param("id") id: number): Promise<BaseResponseDto> {
    return await this.userService.findOne(id);
  }

  @Put("admin/updateUser/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(ROLES.ADMIN)
  async updateUser(
    @Param("id") id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<BaseResponseDto> {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete("admin/delete/:id")
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(ROLES.ADMIN)
  async remove(@Param("id") id: number): Promise<BaseResponseDto> {
    return await this.userService.remove(id);
  }
}
