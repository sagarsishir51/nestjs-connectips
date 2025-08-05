## Introduction
This is a simple wrapper for ConnectIps Payment [nestjs-connectips](https://github.com/sagarsishir51/nestjs-connectips). Just ping us or open a pull request and contribute :)

## Installation

```bash
$ npm i --save nestjs-connectips 
$ yarn add nestjs-connectips 
```

#### Importing module Async

```typescript
import { ConnectIpsModule } from 'nestjs-connectips';
@Module({
  imports: [
      ConnectIpsModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService<AllConfig>) => ({
              paymentMode: configService.get("----your value-----", {infer: true}),
              merchantId: configService.get("----your key-----", {infer: true}),
              appId: configService.get("----your key-----", {infer: true}),
              appName: configService.get("----your key-----", {infer: true}),
              pfxPassword: configService.get("----your key-----", {infer: true}),
              basicAuthPassword: configService.get("----your key-----", {infer: true}),
              pfxPath: configService.get("----your key-----", {infer: true}),
          })
      }),
  ],
  providers: [],
  exports: [],
})
export class YourModule {}
```
#### Calling Init Method to initialize payment

```typescript
import { ConnectIpsService,ConnectIpsRequestDto } from 'nestjs-connectips';

@Injectable()
export class YourService {
  constructor(private connectIpsService: ConnectipsService) {}
    
    async initPayment(){
        //...your code
        const connectIpsRequestDto: ConnectIpsRequestDto = {
            transactionId:'transactionId-1',
            //in paisa
            transactionAmount: 10,
            transactionDate: '2020-10-11',
            transactionCurrency: 'NPR',
            referenceId: 'referenceId',
            remarks: "remarks",
            particulars: "particulars",
        };
        const initData = await this.connectIpsService.init(connectIpsRequestDto);
        //...use initData where required as use case
    
  }
}
```

#### Calling Validate Method for ConnectIps

```typescript
import { ConnectIpsService,ConnectIpsResponseDto } from 'nestjs-connectips';

@Injectable()
export class YourService {
  constructor(private connectIpsService: ConnectIpsService) {}
    
    async verifyPayment(data){
        //...your code
        const {transactionAmount,transactionId} = data;
        const response = await this.connectIpsService.validate({transactionAmount,transactionId});
        //..your code can verify the response data with your business logic and response format
  }
}
```

## License

This package is MIT licensed.
