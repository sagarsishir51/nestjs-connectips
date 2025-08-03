import {BadRequestException, Inject, Injectable, InternalServerErrorException} from '@nestjs/common';
import {
    CONNECT_IPS_CONFIG_OPTIONS,
    CONNECT_IPS_PAYMENT_TEST_URL,
    CONNECT_IPS_PAYMENT_URL,
    CONNECT_IPS_VALIDATE_TEST_URL,
    CONNECT_IPS_VALIDATE_URL,
    ConnectIpsDto,
    ConnectIpsOptions,
    ConnectIpsRequestDto,
    ConnectIpsResponseDto,
    ConnectIpsValidateRequestDto,
    PaymentMode
} from "./connectIps.interface";
import {HttpService} from "@nestjs/axios";
import * as crypto from 'crypto';
import {firstValueFrom} from "rxjs";
import * as fs from "node:fs";
import forge from 'node-forge';

@Injectable()
export class ConnectIpsService {
    private readonly paymentMode = null;
    private readonly paymentUrlTest = null;
    private readonly paymentUrl = null;
    private readonly validateUrlTest = null;
    private readonly validateUrl = null;
    private readonly merchantId = null;
    private readonly appId = null;
    private readonly appName = null;
    private readonly pfxPassword = null;
    private readonly pfxPath = null;
    private readonly basicAuthPassword = null;

    constructor(@Inject(CONNECT_IPS_CONFIG_OPTIONS) private readonly options: ConnectIpsOptions, private readonly httpService: HttpService) {
        if (!options.merchantId) {
            throw new InternalServerErrorException("Merchant Id for connectips payment is missing")
        }
        if (!options.appId) {
            throw new InternalServerErrorException("App Id Ket for connectips payment is missing")
        }
        if (!options.appName) {
            throw new InternalServerErrorException("App Name for connectips payment is missing")
        }
        if (!options.pfxPassword) {
            throw new InternalServerErrorException("PFX Password for connectips payment is missing")
        }
        if (!options.pfxPath) {
            throw new InternalServerErrorException("PFX Path for connectips payment is missing")
        }
        if (!options.basicAuthPassword) {
            throw new InternalServerErrorException("Basic Auth Password for connectips payment is missing")
        }
        if (!fs.existsSync(options.pfxPath)) {
            throw new Error(`PFX file not found at path: ${options.pfxPath}`);
        }
        this.paymentMode = options.paymentMode || PaymentMode.TEST;
        this.paymentUrlTest = options.paymentUrlTest || CONNECT_IPS_PAYMENT_TEST_URL;
        this.paymentUrl = options.paymentUrl || CONNECT_IPS_PAYMENT_URL;
        this.validateUrlTest = options.validateUrlTest || CONNECT_IPS_VALIDATE_TEST_URL;
        this.validateUrl = options.validateUrl || CONNECT_IPS_VALIDATE_URL;
        this.merchantId = options.merchantId;
        this.appId = options.appId;
        this.appName = options.appName;
        this.pfxPassword = options.pfxPassword;
        this.pfxPath = options.pfxPath;
        this.basicAuthPassword = options.basicAuthPassword;
    }

    private static getMessage(fieldNameList: string[], data: object) {
        const keyValuePairs = fieldNameList.map(fieldName => `${fieldName}=${data[fieldName]}`);
        return keyValuePairs.join(',');
    }

    init(data: ConnectIpsRequestDto):ConnectIpsDto {
        let {
            transactionAmount, transactionId , transactionDate, transactionCurrency , referenceId, remarks,
            particulars
        } = data;
        if (!transactionAmount || !transactionId || !transactionDate || !transactionCurrency || !referenceId || !remarks || !particulars) {
            throw new BadRequestException("Data missing for initiating connectips payment");
        }

        const connectIpsData: ConnectIpsDto = {
            MERCHANTID:this.merchantId,
            APPID:this.appId,
            APPNAME:this.appName,
            TXNID:transactionId,
            TXNDATE:transactionDate,
            TXNCRNCY:transactionCurrency,
            TXNAMT:transactionAmount,
            REFERENCEID:referenceId,
            REMARKS:remarks,
            PARTICULARS:particulars,
            TOKEN:'TOKEN',
            PAYMENTURL:
                this.paymentMode.localeCompare(PaymentMode.TEST) == 0
                    ? this.paymentUrlTest
                    : this.paymentUrl
        };
        // STEP 1: Generate token string without the actual signature
        const fieldNameString = "MERCHANTID,APPID,APPNAME,TXNID,TXNDATE,TXNCRNCY,TXNAMT,REFERENCEID,REMARKS,PARTICULARS,TOKEN"
        const message = ConnectIpsService.getMessage(fieldNameString.split(','), connectIpsData);

        connectIpsData.TOKEN = this.generateSignature(message);
        return connectIpsData;
    }

    async validate(data: any):Promise<ConnectIpsResponseDto> {
        const {transactionAmount,transactionId} = data;
        if (!transactionAmount) {
            throw new BadRequestException('Transaction Amount is missing for validating connectips payment');
        }
        if (!transactionId) {
            throw new BadRequestException('Transaction Id is missing for validating connectips payment');
        }
        const connectIpsDataForMessage = {
            "MERCHANTID": this.merchantId,
            "APPID": this.appId,
            "REFERENCEID":transactionId,
            "TXNAMT": transactionAmount
        }
        const fieldNameString = "MERCHANTID,APPID,REFERENCEID,TXNAMT"
        const message = ConnectIpsService.getMessage(fieldNameString.split(','), connectIpsDataForMessage);
        const serverSignature = this.generateSignature(message);
        const connectIpsValidateRequestDto:ConnectIpsValidateRequestDto={
            merchantId:connectIpsDataForMessage.MERCHANTID,
            appId:connectIpsDataForMessage.APPID,
            referenceId:connectIpsDataForMessage.REFERENCEID,
            txnAmt:connectIpsDataForMessage.TXNAMT,
            token:serverSignature
        }
        const basicAuth = 'Basic ' + Buffer.from(`${this.appId}:${this.basicAuthPassword}`).toString('base64');
        const validateUrl =
            this.paymentMode.localeCompare('TEST') == 0
                ? this.validateUrlTest
                : this.validateUrl;
        try {
            const response = await firstValueFrom(
                this.httpService.post(validateUrl,connectIpsValidateRequestDto,{
                    headers:{
                        Authorization: basicAuth
                    }
                    }
                ),
            );
            if (response?.status == 200 && response.data) {
                return {
                    transactionId: response?.data?.referenceId,
                    transactionAmount: response?.data?.txnAmt,
                    status: response?.data?.status,
                }
            }
            throw new InternalServerErrorException('Unexpected response from connectips verification endpoint.');
        }catch (error:any) {
            throw new InternalServerErrorException(`Error in payment verification \n ${error?.message}`);
        }
    }

    private generateSignature(message:string) {
        const pfxPassword = this.pfxPassword;

        const pfxBuffer = fs.readFileSync(this.pfxPath);
        const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, pfxPassword);

        let privateKey = null;
        for (const safeContent of p12.safeContents) {
            for (const safeBag of safeContent.safeBags) {
                if (safeBag.type === forge.pki.oids.keyBag || safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
                    privateKey = forge.pki.privateKeyToPem(safeBag.key);
                }
            }
        }

        if (!privateKey) {
            throw new InternalServerErrorException("Private key not found in PFX");
        }
        const signer = crypto.createSign('RSA-SHA256');
        signer.update(message);
        const signature = signer.sign(privateKey);
        return signature.toString('base64');
    }
}
