import { Injectable } from '@nestjs/common';
import { AccountsService } from './accounts/accounts.service';

@Injectable()
export class AppService {
  constructor(private readonly accountsService: AccountsService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getAnswer(): Promise<string> {
    const accounts = await this.accountsService.getUserAccounts();
    const currentAccountValue =
      this.accountsService.sumAccountsCurrentAmount(accounts);
    const transactions = await this.accountsService.getUserFullHistory(
      accounts,
    );
    const amountOverTime =
      this.accountsService.calculateAccountAmountOverTimeFromCurrent(
        transactions,
        currentAccountValue,
      );

    return JSON.stringify(amountOverTime);
  }
}
