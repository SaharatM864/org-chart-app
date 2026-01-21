import { Config } from 'driver.js';

export const DEFAULT_DRIVER_CONFIG: Config = {
  animate: true,
  showProgress: true,
  smoothScroll: true,
  overlayOpacity: 0.75,
  // Default buttons text
  nextBtnText: 'Next',
  prevBtnText: 'Back',
  doneBtnText: 'Finish',
  allowClose: true,
  disableActiveInteraction: true,
  overlayClickBehavior: 'close',
  allowKeyboardControl: true,
};
