import Component from '@glimmer/component';

export default class GlobalSystemNotification extends Component {
  get notification() {
    return 'empty';
  }

  get show() {
    return false;
  }
}
