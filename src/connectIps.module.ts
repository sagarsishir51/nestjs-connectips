import {DynamicModule, Module} from '@nestjs/common';
import {ConnectIpsService} from "./connectIps.service";
import {HttpModule} from "@nestjs/axios";
import ConnectIpsAsyncOptions, {CONNECT_IPS_CONFIG_OPTIONS} from "./connectIps.interface";

@Module({})
export class ConnectIpsModule {
    static registerAsync(options: ConnectIpsAsyncOptions): DynamicModule {
        return {
            module: ConnectIpsModule,
            imports: [HttpModule, ...options.imports],
            providers: [{
                provide: CONNECT_IPS_CONFIG_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject
            },
                ConnectIpsService
            ],
            exports: [ConnectIpsService]
        }
    }
}
