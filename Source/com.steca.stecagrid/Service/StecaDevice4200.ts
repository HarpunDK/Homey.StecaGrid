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
        var endpoint = `${this.baseUrl}/gen.measurements.table.js`;

        try {
            
            //
            var response = await axios.get(endpoint).then();
            var dataTextStr = response.data;
            //var dataTextStr = "document.write(\"<table class='invisible'><tr class='invisible'><th class='invisible'><h3>Inverter</h3></th><th class='invisible'><h3></h3></th></tr><tr class='invisible'><td class='invisible' valign='top' align='center'><table><tr><th>Name</th><th>Value</th><th>Unit</th></tr><tr><td>P DC</td><td align='right'> 777 </td><td>W</td></tr><tr><td>U DC</td><td align='right'>   1.10</td><td>V</td></tr><tr><td>I DC</td><td align='right'> 555 </td><td>A</td></tr><tr><td>U AC</td><td align='right'> 444 </td><td>V</td></tr><tr><td>I AC</td><td align='right'> 333 </td><td>A</td></tr><tr><td>F AC</td><td align='right'> 22 </td><td>Hz</td></tr><tr><td>P AC</td><td align='right'> 11 </td><td>W</td></tr></table></td><td class='invisible' valign='top' align='center'></table></td></tr></table>\");"
            
            console.log("TEXT", "-->", dataTextStr);
  
            const start_p = dataTextStr.indexOf('P AC') + 27;
            const tmpFromStart_p = dataTextStr.substring(start_p);
            const end_p = tmpFromStart_p.indexOf('<');
            const tmpDone_p = tmpFromStart_p.substring(0, end_p);
            const dataInt_p = parseInt(tmpDone_p, 10);
            const power = Number.isNaN(dataInt_p) ? 0 : dataInt_p;
            
            return new DeviceReadInfo(power, 0, 0, false); // Error read  
          } catch (e:any){
              console.error("Error occured during load of data.", endpoint, "ERROR", e);
              
          }
  
          return new DeviceReadInfo(0, 0, 0, true); // Error read  
    }
}