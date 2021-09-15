import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { AnswerDto } from 'src/common/dtos/answer.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('answer')
  answer(): Promise<AnswerDto> {
    return this.appService.getAnswer();
  }
}
