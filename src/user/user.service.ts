import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as ejs from 'ejs';
import * as path from 'path';
import { User } from "./entities/user.entity";
import { BaseResponseDto } from "src/helper/base-response.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ErrorHandlerService } from "src/utils/error-handler.service";
import { MESSAGE } from "src/constant/message";
import { ROLES } from "src/enum/roles.enum";
import { EmailService } from "src/helper/email-helper.service";
import { SendEmailDto } from "./dto/send-email.dto";
import { Lead } from "src/lead/entities/lead.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Lead) private readonly leadRepository: Repository<Lead>,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly emailService: EmailService
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

  async getUserByEmail(email: string) {

    try {
      const user = await this.userRepository.findOne({ where: { email: email } });

      if (user) {
        return {
          statusCode: HttpStatus.OK,
          message: MESSAGE.USER_GET_SUCCESS,
          data: user,
        }
      }
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }


  }

  async update(id: number, createUserDto: CreateUserDto): Promise<BaseResponseDto> {
    try {
      const user = await this.userRepository.count({ where: { id: id } });

      if (user) {
        await this.userRepository.update({ id: id }, { name: createUserDto.name, email: createUserDto.email, phone: createUserDto.phone })

        return {
          statusCode: HttpStatus.OK,
          message: MESSAGE.USER_UPDATED_SUCCESS
        }
      }

      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: MESSAGE.USER_NOT_EXISTS
      }
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }

  }

  async sendEmail(sendEmailDto: SendEmailDto): Promise<BaseResponseDto> {
    try {
      const { email, type, leadId } = sendEmailDto;
      const user = await this.userRepository.findOne({ where: { email: email }, });

      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: MESSAGE.USER_NOT_EXISTS
        };
      }

      const leadDetails = await this.leadRepository.findOne({
        where: { id: leadId },
        relations: ['userId'],
      });

      if (!leadDetails) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: MESSAGE.LEAD_NOT_EXISTS,
        };
      }

      const location = JSON.parse(leadDetails.location);
      const locationCity = location ? location.map((item) => item.city): '';
      const locationBoroughs = location ? location.map((item) => item.boroughs): '';

      leadDetails['boroughs'] =  locationBoroughs || '';
      leadDetails.location = locationCity;
      let ejsHtml;
      if (type === "buyer") {
        if (!leadDetails.preferences) {
          ejsHtml = await ejs.renderFile(
            path.join(process.cwd(), "/src/email-template/buyer-template-without-preferance.ejs"),
            { data: user, leadDetails },
            { async: true }
          );
        } else {
          ejsHtml = await ejs.renderFile(
            path.join(process.cwd(), "/src/email-template/buyer-template.ejs"),
            { data: user, leadDetails },
            { async: true }
          );
        }
       
      } else if (type === "seller") {

        if (!leadDetails.preferences) {
          ejsHtml = await ejs.renderFile(
            path.join(process.cwd(), "/src/email-template/seller-template-without-preferance.ejs"),
            { data: user, leadDetails },
            { async: true }
          );
        } else {
          ejsHtml = await ejs.renderFile(
            path.join(process.cwd(), "/src/email-template/seller-template.ejs"),
            { data: user, leadDetails },
            { async: true }
          );
        }
       
      }
      await this.emailService.sendEmail(user.email, "Lead Details", ejsHtml);

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.EMAIL_SENT_SUCCESS
      }

    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }
}
