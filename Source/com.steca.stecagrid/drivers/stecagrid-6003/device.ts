import Homey from 'homey';
import axios from 'axios';
import _ from 'underscore';
import moment from 'moment';

class StecaDevice extends Homey.Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('StecaDevice has been initialized');
    const stecaBaseUrl = this.homey.settings.get("StecaGridBaseUrl");
    
    await this.setCapabilityValue("measure_power", 0); // Spinning up
    await this.loadCurrentData(stecaBaseUrl);
    setInterval(async () => {
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
    this.log('MyDevice has been deleted');
  }
  
  public loadCurrentData = async (baseUrl:string) => {
      var currentTimestamp = moment().utc().valueOf();
      var earlierTimestamp = 1700517970849;

      var todayNoon = moment("2023-11-20 12:30", "YYYY-MM-DD hh:mm").utc().valueOf();

// Figure out etc or not
      this.log("loading data", baseUrl, "Before", earlierTimestamp, "now", currentTimestamp, currentTimestamp > earlierTimestamp, moment(earlierTimestamp), "DIFF", currentTimestamp - earlierTimestamp, "TODAY", todayNoon, moment(todayNoon));
      await this.setCapabilityValue("measure_power", 0); // Spinning up
  }

}

module.exports = StecaDevice;
