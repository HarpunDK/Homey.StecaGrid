import Homey from 'homey';

class StecaApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('StecaApp has been initialized');
  }

}

module.exports = StecaApp;
