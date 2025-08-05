import {ConnectIpsService} from "./connectIps.service";
import {ConnectIpsOptions, ConnectIpsRequestDto, PaymentMode} from "./connectIps.interface";
import {HttpService} from "@nestjs/axios";
// Load environment variables first
import { loadEnv } from "./loadEnv";
loadEnv(); // defaults to ".env"

describe('ConnectIpsService', () => {
    let data:ConnectIpsOptions={
        paymentMode: PaymentMode.TEST, merchantId: process.env.MERCHANT_ID, appId: process.env.APP_ID,appName:process.env.APP_NAME,
        pfxPassword:process.env.PFX_PASSWORD,pfxPath:process.env.PFX_PATH,basicAuthPassword:process.env.BASIC_AUTH_PASSWORD
    }
    let connectIpsService: ConnectIpsService;

    beforeEach(() => {
        connectIpsService = new ConnectIpsService(data,new HttpService());
    });

    it('should be defined', () => {
        expect(connectIpsService).toBeDefined();
    });

    it('should init data', async () => {
        //use own set of data to test
        const requestDto:ConnectIpsRequestDto = {
            transactionId:'transactionId-2',
            transactionAmount: 1000,
            transactionDate: '2020-10-11',
            transactionCurrency: 'NPR',
            referenceId: 'referenceId',
            remarks: "remarks",
            particulars: "particulars",
        }

        const data = connectIpsService.init(requestDto);
        console.log("data",data)
        expect(data).toBeDefined();
        expect(data).toHaveProperty("MERCHANTID")
        expect(data).toHaveProperty("APPID")
        expect(data).toHaveProperty("APPNAME")
        expect(data).toHaveProperty("TXNID")
        expect(data).toHaveProperty("TXNDATE")
        expect(data).toHaveProperty("TXNCRNCY")
        expect(data).toHaveProperty("TXNAMT")
        expect(data).toHaveProperty("REFERENCEID")
        expect(data).toHaveProperty("REMARKS")
        expect(data).toHaveProperty("PARTICULARS")
        expect(data).toHaveProperty("TOKEN")
        expect(data).toHaveProperty("PAYMENTURL")
    });


    it('should validate data', async () => {
        //use own set of data to test
        const data = await connectIpsService.validate({
            transactionAmount:10,
            transactionId:"transactionId-2"
        });
        console.log("data",data)
        expect(data).toBeDefined();
        expect(data).toHaveProperty("status")
        expect(data).toHaveProperty("transactionId")
        expect(data).toHaveProperty("transactionAmount")
    });
})