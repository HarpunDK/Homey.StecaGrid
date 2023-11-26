import Homey from 'homey';

class StecaDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('StecaDriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      {
        name: "StecaGrid 6003",
        data: {
          id: "Inverter"
        }
      },
      {
        name: "StecaGrid 4200",
        data: {
          id: "Inverter<"
        }
      }
    ];
  }

}

module.exports = StecaDriver;
