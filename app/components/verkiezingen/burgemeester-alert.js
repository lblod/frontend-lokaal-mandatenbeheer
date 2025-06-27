import Component from '@glimmer/component';

export default class VerkiezingenBcsdVoorzitterAlertComponent extends Component {
  get errorMessage() {
    if (this.args.burgemeesters?.length > 0) {
      return 'Er is een burgemeester aangeduid. Voor de installatievergadering mag er enkel een aangewezen burgemeester aangeduid worden.';
    } else if (this.args.aangewezenBurgemeesters?.length > 1) {
      return `Er moet exact één aangewezen burgemeester zijn. Er werden er ${this.args.aangewezenBurgemeesters?.length} gevonden.`;
    }
    return null;
  }
}
