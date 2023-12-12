import Component from '@glimmer/component';
import config from 'frontend-lmb/config/environment';

export default class GlobalSystemNotification extends Component {
  get notification() {
    return config.globalSystemNotification;
  }

  get show() {
    return !config.globalSystemNotification.startsWith('{{');
  }
}
