import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class MandatarisStatusPillComponent extends Component {
  @service store;
  @service currentSession;

  get owners() {
    if (!this.args.owners) {
      return [];
    }
    return this.args.owners.map((eenheid) => {
      return {
        skin:
          eenheid.id == this.currentSession.group.id ? 'success' : 'default',
        label: eenheid.naam,
      };
    });
  }
}
