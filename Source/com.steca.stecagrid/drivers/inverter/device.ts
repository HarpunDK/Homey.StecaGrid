import Homey from 'homey';
import axios from 'axios';
import _ from 'underscore';
import moment from 'moment';
import xml from 'xml-js';

class StecaDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('StecaDevice has been initialized');
    
    const stecaBaseUrl = this.homey.settings.get("StecaGridBaseUrl");
    
    // RESETTING
    await this.setCapabilityValue("meter_power", 0);
    await this.setCapabilityValue("measure_temperature", 0);
    await this.setCapabilityValue("measure_voltage", 0);
    //await this.setCapabilityValue("measure_power", 1);


    await this.loadCurrentData(stecaBaseUrl);
    this.homey.setInterval(async () => {
      await this.loadCurrentData(stecaBaseUrl);
    }, 2 * 60 * 1000 /* pull every 2. minute */);



  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('StecaDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log("StecaDevice settings where changed");
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('StecaDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('StecaDevice has been deleted');
  }
  
  public loadCurrentData = async (baseUrl:string) => {
      var currentTimestamp = moment().utc().valueOf();

      var response = await axios.get(`${baseUrl}/measurements.xml?${currentTimestamp}`).then();
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

        // this.log("READ", matchingPowerAttr, matchingTempAttr, matchingVoltageAttr);

        if (matchingPowerAttr != null)
           await this.setCapabilityValue("meter_power", (+matchingPowerAttr._attributes.Value /1000)); // Spinning up

        if (matchingTempAttr != null)
          await this.setCapabilityValue("measure_temperature", +matchingTempAttr._attributes.Value); // Spinning up

        if (matchingVoltageAttr != null)
          await this.setCapabilityValue("measure_voltage", +matchingVoltageAttr._attributes.Value); // Spinning up

      }

  }

}

module.exports = StecaDevice;
