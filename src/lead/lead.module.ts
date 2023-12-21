import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { ErrorHandlerService } from 'src/utils/error-handler.service';
import { Lead } from './entities/lead.entity';
import { S3HelperService } from 'src/helper/s3-helper.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
  ],
  controllers: [LeadController],
  providers: [LeadService, ErrorHandlerService, S3HelperService],
  exports: [LeadService],
})
export class LeadModule { }
