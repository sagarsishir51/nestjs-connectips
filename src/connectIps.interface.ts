import {FactoryProvider, ModuleMetadata} from "@nestjs/common";

export const CONNECT_IPS_CONFIG_OPTIONS = 'CONNECT_IPS_CONFIG_OPTIONS'
export const CONNECT_IPS_PAYMENT_TEST_URL = 'https://uat.connectips.com/connectipswebgw/loginpage'
export const CONNECT_IPS_PAYMENT_URL = 'https://connectips.com/connectipswebgw/loginpage'
export const CONNECT_IPS_VALIDATE_TEST_URL = 'https://uat.connectips.com/connectipswebws/api/creditor/validatetxn'
export const CONNECT_IPS_VALIDATE_URL = 'https://connectips.com/connectipswebws/api/creditor/validatetxn'

export enum PaymentMode {
    TEST = 'TEST',
    LIVE = 'LIVE',
}

export interface ConnectIpsRequestDto {
    //Transaction amount in paisa.
    transactionAmount: number;
    //Transaction Id which will be used to reconcile transaction between merchant and NCHL. Transaction Id must be unique for each app in each post request.
    transactionId: string;
    //Transaction Date is the transaction origination date. Date must be in DD-MM-YYYY format.
    transactionDate: string;
    //Currency of transaction. E.g.: NPR
    transactionCurrency: string;
    //Reference Id. Extra transaction information.
    referenceId: string;
    //Remarks related to the transaction.
    remarks: string;
    //Additional transaction Remarks.
    particulars: string;
}

export interface ConnectIpsDto {
    MERCHANTID:string;
    APPID:string;
    APPNAME:string;
    TXNID:string;
    TXNDATE:string;
    TXNCRNCY:string;
    TXNAMT:number;
    REFERENCEID:string;
    REMARKS:string;
    PARTICULARS:string;
    TOKEN:string;
    PAYMENTURL?:string;
}

export interface ConnectIpsOptions {
    merchantId: string;
    appId:string;
    appName:string;
    pfxPassword:string;
    basicAuthPassword:string;
    pfxPath:string;
    paymentUrlTest?: string;
    paymentUrl?: string;
    validateUrlTest?: string;
    validateUrl?: string;
    validateUrlMobile?: string;
    paymentMode: PaymentMode;

}

export interface ConnectIpsResponseDto {
    transactionId: string;
    transactionAmount: string;
    status: number;
}

export interface ConnectIpsValidateRequestDto {
    merchantId: string;
    appId: string;
    referenceId: number;
    txnAmt: number;
    token: string;
}


type ConnectIpsAsyncOptions =
    Pick<ModuleMetadata, 'imports'>
    & Pick<FactoryProvider<ConnectIpsOptions>, 'useFactory' | 'inject'>;


export default ConnectIpsAsyncOptions;