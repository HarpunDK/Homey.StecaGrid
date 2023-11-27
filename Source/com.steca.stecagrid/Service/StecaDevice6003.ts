import axios from 'axios';
import _ from 'underscore';
import moment from 'moment';
import xml from 'xml-js';

import { DeviceReadInfo } from "../Domain/DeviceReadInfo";
import { IStecaDevice } from "./IStecaDevice";

export class StecaDevice6003 implements IStecaDevice {

    constructor(public baseUrl: string) {
        
    }

    public GetSupportedDevice(): string {
        return "Inverter 6003";
    }

    public async GetData() : Promise<DeviceReadInfo> {
        // Get data from endpoint: /measurements.xml + timestamp
        console.log("STRATEGY ACTIVATED", 6003);

        var currentTimestamp = moment().utc().valueOf();

        try {
          var response = await axios.get(`${this.baseUrl}/measurements.xml?${currentTimestamp}`).then();
          // this.log("RESP", response.data);

          var dataJsonStr = xml.xml2json(response.data, {compact: true});
          var dataJson = JSON.parse(dataJsonStr);
          //this.log("Json", "-->", dataJson);

          if (dataJson.root != null && dataJson.root.Device != null) {
            // Data available:

            var matchingPowerAttr = _.find(dataJson.root.Device.Measurements.Measurement, (measurement:any) => {
              return measurement._attributes.Type === "AC_Power";
            });

            var matchingTempAttr = _.find(dataJson.root.Device.Measurements.Measurement, (measurement:any) => {
              return measurement._attributes.Type === "Temp";
            });

            var matchingVoltageAttr = _.find(dataJson.root.Device.Measurements.Measurement, (measurement:any) => {
              return measurement._attributes.Type === "DC_Voltage";
            });

            console.log("READ", matchingPowerAttr, matchingTempAttr, matchingVoltageAttr);
            
            var power = 0;
            var temperature = 0;
            var voltage = 0;

            if (matchingPowerAttr != null)
               power = +(matchingPowerAttr._attributes.Value != null ? matchingPowerAttr._attributes.Value : 0) /1000;

            if (matchingTempAttr != null)
              temperature = +matchingTempAttr._attributes.Value;

            if (matchingVoltageAttr != null)
              voltage = +matchingVoltageAttr._attributes.Value;

            return new DeviceReadInfo(power, voltage, temperature, false);
          }
        } catch (e:any){
            console.error("Error occured during load of data.", e);
            
        }

        return new DeviceReadInfo(0, 0, 0, true); // Error read
    }


}