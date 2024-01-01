import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User } from "../user/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from '@nestjs/config';
import { UserModule } from "../user/user.module";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { EmailService } from "src/helper/email-helper.service";
import { ErrorHandlerService } from "src/utils/error-handler.service";

@Module({
  imports: [UserModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '10d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService, ErrorHandlerService],
})
export class AuthModule { }
