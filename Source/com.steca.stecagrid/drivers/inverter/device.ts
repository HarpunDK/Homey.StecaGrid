import Homey from 'homey';
import _ from 'underscore';
import { StecaDeviceStrategy } from '../../Service/StecaDeviceStrategy';
import { IStecaDevice } from '../../Service/IStecaDevice';

class StecaDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('StecaDevice has been initialized');
    
    
    var stecaPullInterval = +(this.homey.settings.get("StecaGridPullInterval") || "30");
    var deviceData = this.getData();
    var stecaDeviceVersion = deviceData.id;
    stecaDeviceVersion = stecaDeviceVersion.split('#')[0];
    
    this.log("DEVICE", "-->", stecaDeviceVersion);
    
    // RESETTING
    this.setCapabilityOptions("meter_power", { "units": { "en": "W" } });
    await this.setCapabilityValue("meter_power", 0);
    await this.setCapabilityValue("production_capability", 0);
    await this.setCapabilityValue("temperature_capability", 0);
    await this.setCapabilityValue("voltage_capability", 0);

    if (this.hasCapability("ac_voltage_capability"))
      await this.setCapabilityValue("ac_voltage_capability", 0);

    //await this.setCapabilityValue("measure_power", 1);
    var stecaDeviceStrategy = new StecaDeviceStrategy(stecaDeviceVersion);


    await this.loadCurrentData(stecaDeviceStrategy);
    this.homey.setInterval(async () => {
      await this.loadCurrentData(stecaDeviceStrategy,);
    }, stecaPullInterval * 1000 /* pull every 2. minute */);



  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('StecaDevice has been added');

    // On add, load global settings ip settings to local device settings
    this.setSettings({ "device-ip": this.homey.settings.get("StecaGridBaseUrl") });
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
  
  public loadCurrentData = async (stecaDevice : IStecaDevice) => {
    
    var deviceBaseUrl = this.ResolveDeviceBaseUrl();
    var inverterData = await stecaDevice.GetData(deviceBaseUrl);
    this.log("InverterData", "READ", inverterData);
    
    await this.setCapabilityValue("meter_power", inverterData.ProductionTotal);
    await this.setCapabilityValue("production_capability", inverterData.Power);
    await this.setCapabilityValue("temperature_capability", inverterData.Temperature); 
    await this.setCapabilityValue("voltage_capability", inverterData.Voltage);
    await this.setCapabilityValue("alarm_capability", inverterData.HasError);

    if (this.hasCapability("ac_voltage_capability"))
      await this.setCapabilityValue("ac_voltage_capability", 0);

    if (this.hasCapability("measure_power"))
      await this.setCapabilityValue("measure_power", inverterData.Power);
  }

  private ResolveDeviceBaseUrl = () : string => {
    var stecaBaseUrl = this.homey.settings.get("StecaGridBaseUrl");

    var overrideDeviceIp = this.getSetting("override-device-ip") ?? false;
    if (overrideDeviceIp) {
      stecaBaseUrl = this.getSetting("device-ip");
    }

    this.log("StecaBaseUrl", stecaBaseUrl);
    return stecaBaseUrl;
  }

}

module.exports = StecaDevice;
