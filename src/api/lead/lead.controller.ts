import { Controller, Post, Body, UseInterceptors, UploadedFiles, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { BaseResponseDto } from 'src/helper/base-response.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetLeadListDto } from './dto/get-lead-list.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { ROLES } from 'src/enum/roles.enum';

@Controller('lead')
@ApiTags('Lead')
export class LeadController {
  constructor(private readonly leadService: LeadService) { }

  /**
   * Create Lead Endpoint
   * @Body createLeadDto 
   * @returns BaseResponseDto
   */
  @Post("create")
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  async create(@Body() createLeadDto: CreateLeadDto, @UploadedFiles() files): Promise<BaseResponseDto> {
    return this.leadService.create(createLeadDto, files);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() createLeadDto: CreateLeadDto): Promise<BaseResponseDto> {
    return await this.leadService.update(+id, createLeadDto);
  }

  @Put('updateImage/:id')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  async updateImage(@Param('id') id: string, @UploadedFiles() files): Promise<BaseResponseDto> {
    return await this.leadService.updateImage(+id, files);
  }

  @Post('admin/getAllLead')
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(ROLES.ADMIN)
  async findAll(@Body() getLeadListDto: GetLeadListDto): Promise<BaseResponseDto> {
    return await this.leadService.findAll(getLeadListDto);
  }

  @Post('admin/getLead/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(ROLES.ADMIN)
  async findOne(@Param('id') id: number): Promise<BaseResponseDto> {
    return await this.leadService.findOne(id);
  }

  @Put('admin/updateLead/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(ROLES.ADMIN)
  async updateLead(@Param('id') id: number, @Body() updateLeadDto: UpdateLeadDto): Promise<BaseResponseDto> {
    return await this.leadService.updateLead(id, updateLeadDto);
  }

  @Delete('admin/deleteLead/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(ROLES.ADMIN)
  async delete(@Param('id') id: number): Promise<BaseResponseDto> {
    return await this.leadService.delete(id);
  }
}
