import axios from 'axios';

import { DeviceReadInfo } from "../Domain/DeviceReadInfo";
import { IStecaDevice } from "./IStecaDevice";

export class StecaDevice4200 implements IStecaDevice {

    constructor(public baseUrl: string) {
        
    }

    public GetSupportedDevice(): string {
        return "Inverter 4200";
    }

    public async GetData() : Promise<DeviceReadInfo> {
        
        // Endpoint: /gen.events.table.js
        try {
            var response = await axios.get(`${this.baseUrl}/gen.measurements.table.js`).then();
            var dataTextStr = response.data;
            
            //console.log("TEXT", "-->", dataTextStr);
  
            const start_p = dataTextStr.indexOf('P AC') + 27;
            const tmpFromStart_p = dataTextStr.substring(start_p);
            const end_p = tmpFromStart_p.indexOf('<');
            const tmpDone_p = tmpFromStart_p.substring(0, end_p);
            const dataInt_p = parseInt(tmpDone_p, 10);
            const power = Number.isNaN(dataInt_p) ? 0 : dataInt_p;
            
            return new DeviceReadInfo(power, 0, 0, false); // Error read  
          } catch (e:any){
              console.error("Error occured during load of data.");
              
          }
  
          return new DeviceReadInfo(0, 0, 0, true); // Error read  
    }
}