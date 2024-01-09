import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as ejs from "ejs";
import * as path from "path";
import axios from "axios";
import { User } from "./entities/user.entity";
import { BaseResponseDto } from "src/helper/base-response.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ErrorHandlerService } from "src/utils/error-handler.service";
import { MESSAGE } from "src/constant/message";
import { ROLES } from "src/enum/roles.enum";
import { EmailService } from "src/helper/email-helper.service";
import { SendEmailDto } from "./dto/send-email.dto";
import { Lead } from "../lead/entities/lead.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { GetUserListDto } from "./dto/get-user-list.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Lead) private readonly leadRepository: Repository<Lead>,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly emailService: EmailService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<BaseResponseDto> {
    try {
      const userData = {
        ...createUserDto,
        role: ROLES.USER,
      };
      const userExists = await this.userRepository.findOne({
        where: { email: userData.email },
      });
      if (userExists) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: MESSAGE.USER_ALREADY_EXISTS,
          data: null,
        };
      }
      const user = await this.userRepository.save(userData);
      return {
        statusCode: HttpStatus.CREATED,
        message: MESSAGE.USER_CREATED_SUCCESS,
        data: user,
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
      });

      if (user) {
        return {
          statusCode: HttpStatus.OK,
          message: MESSAGE.USER_GET_SUCCESS,
          data: user,
        };
      }
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

  async update(
    id: number,
    createUserDto: CreateUserDto
  ): Promise<BaseResponseDto> {
    try {
      const user = await this.userRepository.count({ where: { id: id } });

      if (user) {
        await this.userRepository.update(
          { id: id },
          {
            name: createUserDto.name,
            email: createUserDto.email,
            phone: createUserDto.phone,
          }
        );

        return {
          statusCode: HttpStatus.OK,
          message: MESSAGE.USER_UPDATED_SUCCESS,
        };
      }

      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: MESSAGE.USER_NOT_EXISTS,
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

  async sendEmail(sendEmailDto: SendEmailDto): Promise<BaseResponseDto> {
    try {
      const { email, type, leadId } = sendEmailDto;
      const user = await this.userRepository.findOne({
        where: { email: email },
      });

      if (!user) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: MESSAGE.USER_NOT_EXISTS,
        };
      }

      const leadDetails = await this.leadRepository.findOne({
        where: { id: leadId },
        relations: ["userId"],
      });

      if (!leadDetails) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: MESSAGE.LEAD_NOT_EXISTS,
        };
      }

      const location = JSON.parse(leadDetails.location);
      const locationCity = location.map((item) => item.city);
      const locationBoroughs = location.map((item) => item.boroughs);
      leadDetails['boroughs'] = locationBoroughs;
      leadDetails.location = locationCity;


      let ejsHtml;
      if (type === "buyer") {
        if (!leadDetails.preferences) {
          ejsHtml = await ejs.renderFile(
            path.join(process.cwd(), "/src/email-template/buyer-template-without-preferance.ejs"),
            { data: user, leadDetails },
            { async: true }
          );
        } else {
          ejsHtml = await ejs.renderFile(
            path.join(process.cwd(), "/src/email-template/buyer-template.ejs"),
            { data: user, leadDetails },
            { async: true }
          );
        }

      } else if (type === "seller") {

        if (!leadDetails.preferences) {
          ejsHtml = await ejs.renderFile(
            path.join(process.cwd(), "/src/email-template/seller-template-without-preferance.ejs"),
            { data: user, leadDetails },
            { async: true }
          );
        } else {
          ejsHtml = await ejs.renderFile(
            path.join(process.cwd(), "/src/email-template/seller-template.ejs"),
            { data: user, leadDetails },
            { async: true }
          );
        }

      }
      await this.emailService.sendEmail(process.env.EMAIL_USER, "Lead Details", ejsHtml);

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.EMAIL_SENT_SUCCESS,
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

  async generateResponse(question: any): Promise<any> {
    try {
      const apiUrl = process.env.CHATGPT_ENDPOINT;
      const apiKey = process.env.CHATGPT_API_KEY;

      const realEstateContext = {
        generalInfo: `
            This ChatBot is specialized in responding to real-estate related questions for the region of Quebec, Canada. Topics covered is anything directly or indirectly related to real-estate activities in Quebec, Canada and courtierXpertInfo. If a question falls outside these topic types, the response will be: “I’m sorry, but I’m specifically trained on answering questions regarding real-estate. The faq information is provided for insipiration”
          `,
          faq : {
          "What legal disclosures must I make when selling a property in Quebec?":
            "Sellers in Quebec must disclose any known defects that could affect the value or enjoyment of the property, including latent defects not visible through a normal inspection.",

          "How is the real estate commission structured in Quebec?":
            "In Quebec, commission rates are negotiable and typically range between 4% to 6% of the sale price, split between the buyer's and seller's agents.",

          "What is a certificate of location, and do I need one to sell my property?":
            "A certificate of location is a document prepared by a land surveyor that shows the property boundaries and any encroachments. It's typically required in a real estate transaction.",

          "How can I determine the asking price for my property?":
            "The asking price is usually based on a comparative market analysis, considering similar properties in the area, market conditions, and the property's condition. Consider requesting a free home evaluation by completing the digital journey above.",

          "What are the tax implications of selling my property in Quebec?":
            "In Quebec, you may be subject to capital gains tax if the property sold is not your primary residence. It's essential to consult with a tax advisor for specific advice.",

          "What are the steps involved in buying a home in Quebec?":
            "The process typically involves pre-approval for a mortgage, property searching, making an offer, getting a home inspection, finalizing the mortgage, and closing the deal. It's advisable to work with a real estate agent and a notary.",

          "Do I need a notary to buy a house in Quebec?":
            "Yes, in Quebec, a notary plays a crucial role in real estate transactions, handling legal documents, title searches, and the transfer of ownership.",

          "What is the 'welcome tax' (taxe de bienvenue)?":
            "The 'welcome tax,' officially known as the transfer duties, is a tax paid by the buyer to the municipality where the property is located. It's calculated based on the purchase price or municipal evaluation, whichever is higher.",

          "How much down payment do I need for purchasing a property?":
            "In Canada, a minimum down payment of 5% is generally required, but if it's less than 20%, you'll need mortgage loan insurance.",

          "Can I buy a property in Quebec as a non-resident?":
            "Yes, non-residents can buy property in Quebec, but there may be additional requirements, such as a higher down payment and different tax implications."
        },
        courtierXpertInfo: {
          intro: `
              Welcome to CourtierXpert - The Future of Real Estate at Your Fingertips. We're revolutionizing the way you buy and sell properties with our cutting-edge platform, designed for seamless, efficient, and cost-effective real estate transactions.
            `,
          reasonsToChooseUs: [
            "1. Virtual Selling Real Estate Broker: Experience the future with our virtual broker system. Get a free, no-obligation, and accurate home evaluation in less than 24 hours! Simply upload images of your property to our website, and let our team and advanced algorithms do the rest.",
            "2. Save Time and Money: Time = Money, So Save Both! Enjoy significant savings with our online broker services. We've streamlined the traditional process to offer you the same high-quality service at a more accessible price point.",
            "3. 7/7 Assistance: Our dedicated team is available 7 days a week to assist you with any queries or concerns. Whether you're a night owl or an early bird, we're here to help at your convenience.",
            "4. Maximum Exposure for Your Listing: Your property deserves the spotlight. That's why we list it on MLS and enhance its visibility with targeted private paid ads, ensuring it reaches the right audience.",
            "5. Hybrid Approach: Prefer the traditional method? No problem! We connect you with the finest local real estate brokers, handpicked for their expertise and track record, to ensure you receive top-tier service.",
            "6. AI-Powered Support: Got questions? Our AI chatbot is ready to provide instant, personalized responses to all your real estate inquiries. And if you need more in-depth assistance, our expert support team is just a call away."
          ]
        }
      };

      const realEstateContextMessages = Object.entries(realEstateContext).map(([key, value]) => ({
        role: "system",
        content: `${key}: ${JSON.stringify(value)}`
      }));

      const assistant_context = `RULES:use maximum of 75 words. Respond succinctly and in a friendly manner. Do not provide Links. Do no reference Sources. Just provide Authoritative information in a succinct and friendly manner.`

      const response = await axios.post(apiUrl, {
        model: "gpt-4-1106-preview",
        temperature: 0.8,
        max_tokens: 75,
        messages: [
          ...realEstateContextMessages,
          { role: "user", content: `${question?.question}\n\n${assistant_context}` }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      // Log the entire response object for inspection

      // Return the response or a specific property of the response
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error asking question:', error.message);
      console.error('Error details:', error.response ? error.response.data : 'No response');
      return 'Error asking question';
    }
  }

  async addUser(createUserDto: CreateUserDto): Promise<BaseResponseDto> {
    try {
      const userData = {
        ...createUserDto,
        role: ROLES.USER,
      };
      const userExists = await this.userRepository.findOne({
        where: { email: userData.email },
      });
      if (userExists) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: MESSAGE.USER_ALREADY_EXISTS,
          data: null,
        };
      }
      const user = await this.userRepository.save(userData);
      return {
        statusCode: HttpStatus.CREATED,
        message: MESSAGE.USER_CREATED_SUCCESS,
        data: user,
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

  async findAll(getUserListDto: GetUserListDto): Promise<BaseResponseDto> {
    try {
      const { page, limit } = getUserListDto;
      const skip = page * limit - limit;
      const [result, total] = await this.userRepository.findAndCount({
        where: { role: ROLES.USER },
        take: limit,
        skip: skip,
      });

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.USER_GET_SUCCESS,
        data: {
          result,
          total,
        },
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }

  async findOne(id: number): Promise<BaseResponseDto> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new HttpException(MESSAGE.USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
      }

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.USER_GET_SUCCESS,
        data: user
      };
    } catch (error) {
      await this.errorHandlerService.HttpException(error);
    }
  }


  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<BaseResponseDto> {
    try {
      const existsUser = await this.userRepository.findOneBy({ id });
      if (!existsUser) {
        throw new HttpException(MESSAGE.USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
      }

      await this.userRepository.update(id, updateUserDto);

      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.USER_UPDATED_SUCCESS
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(id: number): Promise<BaseResponseDto> {
    try {
      const existsUser = await this.userRepository.findOneBy({ id });
      if (!existsUser) {
        throw new HttpException(MESSAGE.USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
      }
      await this.userRepository.delete(id);
      return {
        statusCode: HttpStatus.OK,
        message: MESSAGE.USER_DELETED_SUCCESS
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
