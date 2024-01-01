import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { EmailService } from "src/helper/email-helper.service";
import { BaseResponseDto } from "src/helper/base-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ROLES } from "src/enum/roles.enum";
import { MESSAGE } from "src/constant/message";
import { ErrorHandlerService } from "src/utils/error-handler.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private emailService: EmailService,
    private errorHandlerService: ErrorHandlerService,
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userTable: Repository<User>
  ) { }

  async register(registerDto: RegisterDto): Promise<BaseResponseDto> {
    try {
      const { email, password } = registerDto;

      // check if user exists with same email and same role
      const existsUser = await this.userTable.findOne({
        where: { email, role: ROLES.ADMIN },
      });
      if (existsUser) {
        throw new HttpException(MESSAGE.USER_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
      }

      const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,20}$/;

      if (!passwordRegex.test(password)) {
        throw new HttpException(
          MESSAGE.PASSWORD_VALIDATION_FAILED,
          HttpStatus.BAD_REQUEST
        );
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = this.userTable.create({
        ...registerDto,
        password: hashedPassword,
        role: ROLES.ADMIN,
      });
      await this.userTable.save(newUser);

      return {
        statusCode: HttpStatus.CREATED,
        message: MESSAGE.USER_CREATED_SUCCESS,
        data: newUser,
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

  // login
  async login(loginDto: LoginDto): Promise<BaseResponseDto> {
    try {
      const { email, password } = loginDto;
      const user = await this.userTable.findOne({
        where: { email: email },
      });

      if (!user) {
        throw new HttpException(
          MESSAGE.INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED
        );
      }

      const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,20}$/;

      if (!passwordRegex.test(loginDto.password)) {
        throw new HttpException(
          MESSAGE.PASSWORD_VALIDATION_FAILED,
          HttpStatus.BAD_REQUEST
        );
      }

      const passwordValidate = await bcrypt.compare(password, user.password);

      if (!passwordValidate) {
        throw new HttpException(
          MESSAGE.INVALID_CREDENTIALS,
          HttpStatus.BAD_REQUEST
        );
      }
      const payload = { email: user.email };

      const accessToken: string = await this.jwtService.sign(payload);

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.LOGIN_SUCCESS,
        data: {
          access_token: accessToken,
          user: user,
        },
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

  //   forgot Password
  async forgotPassword(email: string): Promise<BaseResponseDto> {
    try {
      const user = await this.userTable.findOne({
        where: { email: email },
      });

      if (!user) {
        throw new HttpException(MESSAGE.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
      }

      const payload = {
        id: user.id,
        email: user.email,
      };

      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      });

      const resetPasswordLink = `http://localhost:3000/password-reset/${token}`;

      await this.emailService.sendEmail(
        user.email,
        'Forgot Password Link',
        resetPasswordLink
      );

      user.resetPasswordToken = token;
      await this.userTable.save(user);

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.FORGOT_PASSWORD_SENT,
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

  //   Reset Password
  async resetPassword(
    token: string, password: string
  ): Promise<BaseResponseDto> {
    try {
      const decodedToken = this.jwtService.verify(token, { secret: this.configService.get('JWT_SECRET') });

      if (!decodedToken) {
        throw new HttpException(MESSAGE.PASSWORD_RESET_LINK_EXPIRED, HttpStatus.BAD_REQUEST);
      }
      const user = await this.userTable.findOne({
        where: { email: decodedToken.email },
      });

      if (!user) {
        throw new HttpException(MESSAGE.USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
      }

      if (user.resetPasswordToken !== token) {
        throw new HttpException(MESSAGE.PASSWORD_RESET_LINK_EXPIRED, HttpStatus.BAD_REQUEST);
      }

      const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,20}$/;
      const hashPassword = await bcrypt.hash(password, 10);

      if (!passwordRegex.test(password)) {
        throw new HttpException(
          MESSAGE.PASSWORD_VALIDATION_FAILED,
          HttpStatus.BAD_REQUEST
        );
      }

      if (user.password === hashPassword) {
        throw new HttpException(
          MESSAGE.PASSWORD_SAME,
          HttpStatus.BAD_REQUEST
        );
      }

      user.password = hashPassword;
      user.resetPasswordToken = null;
      await this.userTable.save(user);

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.USER_PASSWORD_UPDATED,
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }
}
