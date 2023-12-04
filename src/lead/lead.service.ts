import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Lead } from "./entities/lead.entity";
import { BaseResponseDto } from "src/helper/base-response.dto";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { ErrorHandlerService } from "src/utils/error-handler.service";
import { MESSAGE } from "src/constant/message";

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead) private readonly leadRepository: Repository<Lead>,
    private readonly errorHandlerService: ErrorHandlerService,
  ) { }

  // Create Lead Endpoint
  async create(createLeadDto: CreateLeadDto, files: any): Promise<BaseResponseDto> {
    try {
      const fileArray = files.map((file) => file.path);
      createLeadDto.propertyImage = fileArray;
      const lead = await this.leadRepository.save(createLeadDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: MESSAGE.LEAD_CREATED_SUCCESS,
        data: lead,
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

}