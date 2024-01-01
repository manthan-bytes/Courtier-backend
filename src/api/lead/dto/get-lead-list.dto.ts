import { IsNumber, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class GetLeadListDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  limit: number;
}