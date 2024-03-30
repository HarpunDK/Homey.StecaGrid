import { DeviceReadInfo } from "../Domain/DeviceReadInfo";

export interface IStecaDevice {

    GetSupportedDevice():string;

    GetData(deviceBaseurl: string) : Promise<DeviceReadInfo>

}