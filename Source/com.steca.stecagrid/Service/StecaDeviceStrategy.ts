import _ from 'underscore';

import { DeviceReadInfo } from "../Domain/DeviceReadInfo";
import { IStecaDevice } from "./IStecaDevice";
import { StecaDevice4200 } from "./StecaDevice4200";
import { StecaDevice6003 } from "./StecaDevice6003";

export class StecaDeviceStrategy implements IStecaDevice {

    constructor(public stecaDeviceVersion: string) {
                
    }

    public GetSupportedDevice(): string {
        return "GENERIC";
    }

    public async GetData(deviceBaseUrl: string) : Promise<DeviceReadInfo> {
        
        var strategies = this.CreateStrategies(deviceBaseUrl);
        
        var matchingStecaDevice = _.find(strategies, (strategy) => strategy.GetSupportedDevice() === this.stecaDeviceVersion);
        return await matchingStecaDevice?.GetData() || new DeviceReadInfo(0,0,0,0,0, true);
    }

    private CreateStrategies = (deviceBaseUrl: string) => {
        return [
            new StecaDevice4200(deviceBaseUrl),
            new StecaDevice6003(deviceBaseUrl)
        ]
    }

}