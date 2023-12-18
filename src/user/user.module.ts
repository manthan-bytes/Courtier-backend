import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User } from "./entities/user.entity";
import { ErrorHandlerService } from "src/utils/error-handler.service";
import { EmailService } from "src/helper/email-helper.service";
import { Lead } from "src/lead/entities/lead.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Lead])],
  controllers: [UserController],
  providers: [UserService, ErrorHandlerService, EmailService],
  exports: [UserService],
})
export class UserModule { }
