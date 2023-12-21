import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3 } from "aws-sdk";
import { ErrorHandlerService } from "src/utils/error-handler.service";

@Injectable()
export class S3HelperService {
  constructor(
    private readonly configService: ConfigService,
    private readonly errorHandlerService: ErrorHandlerService
  ) { }

  async uploadMultipleFiles(
    files: any[],
    folderName: string
  ): Promise<string[]> {
    const s3 = new S3({
      accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get("AWS_REGION"),
      params: {
        Bucket: this.configService.get("AWS_BUCKET_NAME"),
      },
    });

    const uploadPromises = files.map(async (file) => {
      file = await file;
      const params = {
        Bucket: this.configService.get("AWS_BUCKET_NAME"),
        Key: `${folderName}/${file.originalname}`,
        Body: file.buffer,
        ACL: "public-read",
        ContentType: file.type,
      };

      const { Location } = await s3.upload(params).promise();
      return Location;
    });

    return Promise.all(uploadPromises);
  }
}
