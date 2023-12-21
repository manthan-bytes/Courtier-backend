import { Controller, Post, Body, UseInterceptors, UploadedFiles, Put, Param } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { BaseResponseDto } from 'src/helper/base-response.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
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
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  @ApiConsumes('multipart/form-data')
  async create(@Body() createLeadDto: CreateLeadDto, @UploadedFiles() files): Promise<BaseResponseDto> {
    return this.leadService.create(createLeadDto, files);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() createLeadDto: CreateLeadDto): Promise<BaseResponseDto> {
    return await this.leadService.update(+id, createLeadDto);
  }

  @Put('updateImage/:id')
  @UseInterceptors(FilesInterceptor('files', 10, {
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  @ApiConsumes('multipart/form-data')
  async updateImage(@Param('id') id: string, @UploadedFiles() files): Promise<BaseResponseDto> {
    return await this.leadService.updateImage(+id, files);
  }
}
