import axios from 'axios';
import _ from 'underscore';
import xml from 'xml-js';

import { DeviceReadInfo } from "../Domain/DeviceReadInfo";
import { IStecaDevice } from "./IStecaDevice";

export class StecaDevice4200 implements IStecaDevice {

    constructor(public baseUrl: string) {
        
    }

    public GetSupportedDevice(): string {
        return "Inverter 4200";
    }

    public async GetData() : Promise<DeviceReadInfo> {
        try {
          var response = await axios.get(`${this.baseUrl}/all.xml`).then();
          //console.log("RESP", response.data);

          var dataJsonStr = xml.xml2json(response.data, {compact: true});
          var dataJson = JSON.parse(dataJsonStr);
          //console.log("Json", "-->", dataJson.root.Device);

          if (dataJson.root != null && dataJson.root.Device != null) {
            // Data available:

            var matchingPowerAttr = _.find(dataJson.root.Device.Measurements.Measurement, (measurement:any) => {
              return measurement._attributes.Type === "AC_Power";
            });
            
            var matchingTempAttr = _.find(dataJson.root.Device.Measurements.Measurement, (measurement:any) => {
              return measurement._attributes.Type === "Temp";
            });

            var matchingAcVoltageAttr = _.find(dataJson.root.Device.Measurements.Measurement, (measurement:any) => {
              return measurement._attributes.Type === "AC_Voltage";
            });

            var matchingVoltageAttr = _.find(dataJson.root.Device.Measurements.Measurement, (measurement:any) => {
              return measurement._attributes.Type === "DC_Voltage";
            });

            var productionTotalAttr = _.find(dataJson.root.Device.Yields.Yield, (yieldElement:any) => {
              return yieldElement.Type === "Produced" && yieldElement.Slot == "Total";
            });

            //console.log("READ", matchingPowerAttr, matchingTempAttr, matchingVoltageAttr);
            
            var power = 0;
            var temperature = 0;
            var voltage = 0;
            var ac_voltage = 0;

            if (matchingPowerAttr != null)
               power = +(matchingPowerAttr._attributes.Value != null ? matchingPowerAttr._attributes.Value : 0);

            if (matchingTempAttr != null)
              temperature = +matchingTempAttr._attributes.Value;

            if (matchingVoltageAttr != null)
              voltage = +matchingVoltageAttr._attributes.Value;

            if (matchingAcVoltageAttr != null)
              ac_voltage = +matchingAcVoltageAttr._attributes.Value;

            var productionTotal = power;
            if (productionTotalAttr != null){
              productionTotal = +dataJson.root.Device.Yields.Yield.YieldValue._attributes["Value"];
              productionTotal = productionTotal / 1000;
            }

            return new DeviceReadInfo(power, voltage, ac_voltage, temperature, productionTotal, false);
          }
        } catch (e:any){
            console.error("Error occured during load of data.", e);
            
        }

        return new DeviceReadInfo(0, 0, 0, 0, 0, true); // Error read
    }


}