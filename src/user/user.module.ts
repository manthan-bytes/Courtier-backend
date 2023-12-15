import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User } from "./entities/user.entity";
import { ErrorHandlerService } from "src/utils/error-handler.service";
import { EmailService } from "src/helper/email-helper.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService, ErrorHandlerService, EmailService],
  exports: [UserService],
})
export class UserModule { }
