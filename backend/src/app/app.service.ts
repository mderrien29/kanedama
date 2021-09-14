import { Injectable } from '@nestjs/common';
import { AccountsService } from './accounts/accounts.service';

@Injectable()
export class AppService {
  constructor(private readonly accountsService: AccountsService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getAnswer(): Promise<string> {
    // return JSON.stringify(await this.accountsService.getAccounts());
    // return JSON.stringify(
    //   await this.apiService.getTransactions(
    //     'afcf2bd0-9a72-11e9-86ef-07c2f863fee7',
    //     new Date('2019-08-01'),
    //     new Date('2020-07-31'),
    //   ),
    // );
    const transactions =
      await this.accountsService.getAllUserHistory();

    return JSON.stringify(
      this.accountsService.calculateAccountAmountOverTime(
        transactionsPerAccount,
      ),
    );
  }
}
