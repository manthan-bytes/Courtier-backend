import { Controller, Post, Body, UseInterceptors, UploadedFiles, Put, Param } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { BaseResponseDto } from 'src/helper/base-response.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) { }

  /**
   * Create Lead Endpoint
   * @Body createLeadDto 
   * @returns BaseResponseDto
   */
  @Post("create")
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './propertyImages',
      filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
      },
    }),
  }))
  @ApiConsumes('multipart/form-data')
  async create(@Body() createLeadDto: CreateLeadDto, @UploadedFiles() files): Promise<BaseResponseDto> {
    return this.leadService.create(createLeadDto, files);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() createLeadDto: CreateLeadDto): Promise<BaseResponseDto> {
    return await this.leadService.update(+id, createLeadDto);
  }

}
