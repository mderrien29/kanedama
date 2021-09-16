import { Injectable } from '@nestjs/common';
import { AnswerDto } from 'src/common/dtos/answer.dto';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class AppService {
  constructor(private readonly accountsService: AccountsService) {}

  public async getAnswer(): Promise<AnswerDto> {
    const accounts = await this.accountsService.getUserAccounts();
    const answer = await this.accountsService.getUserMetrics(accounts);
    return answer;
  }
}
