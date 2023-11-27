import { DeviceReadInfo } from "../Domain/DeviceReadInfo";
import { IStecaDevice } from "./IStecaDevice";

export class StecaDevice4200 implements IStecaDevice {

    constructor(baseUrl: string) {
        
    }

    public GetSupportedDevice(): string {
        return "Inverter 4200";
    }

    public async GetData() : Promise<DeviceReadInfo> {
        
        
        
        
        
        
        
        
        return new DeviceReadInfo(4200, 4200, 4200, true);
    }


}