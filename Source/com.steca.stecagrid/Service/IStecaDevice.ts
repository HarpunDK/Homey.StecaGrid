import { DeviceReadInfo } from "../Domain/DeviceReadInfo";

export interface IStecaDevice {

    GetSupportedDevice():string;

    GetData() : Promise<DeviceReadInfo>

}