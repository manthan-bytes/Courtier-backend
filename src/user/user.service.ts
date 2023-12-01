import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { BaseResponseDto } from "src/helper/base-response.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ErrorHandlerService } from "src/utils/error-handler.service";
import { MESSAGE } from "src/constant/message";
import { ROLES } from "src/enum/roles.enum";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly errorHandlerService: ErrorHandlerService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<BaseResponseDto> {
    try {
      const userData = {
        ...createUserDto,
        role: ROLES.USER
      }
      const userExists = await this.userRepository.findOne({ where: { email: userData.email } });
      if (userExists) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: MESSAGE.USER_ALREADY_EXISTS,
          data: null,
        }
      }
      const user = await this.userRepository.save(userData);
      return {
        statusCode: HttpStatus.CREATED,
        message: MESSAGE.USER_CREATED_SUCCESS,
        data: user,
      }
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

}
