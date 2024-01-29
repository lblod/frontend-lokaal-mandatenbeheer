import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { FUNCTIONARIS_STATUS_CODE_AANGESTELD } from 'frontend-lmb/utils/well-known-uris';

export default class LeidinggevendenbeheerFunctionarisFormComponent extends Component {
  @service() store;

  @tracked statusOptions;

  constructor() {
    super(...arguments);
    this.getBestuursInfo();
  }

  get isValid() {
    return Boolean(this.args.model.start);
  }

  @action
  handleDateChange(attributeName, isoDate, date) {
    this.args.model[attributeName] = date;
  }

  async getBestuursInfo() {
    const bestuursfunctie = await this.args.model.get('bekleedt');
    const bestuursfunctieCode = await bestuursfunctie.rol;

    let queryParams = {};
    if (bestuursfunctieCode.isLeidinggevendAmbtenaar) {
      queryParams = {
        filter: {
          ':uri:': FUNCTIONARIS_STATUS_CODE_AANGESTELD,
        },
      };
    } else {
      queryParams = {
        sort: 'label',
        page: { size: 100 },
      };
    }

    const statusOptions = await this.store.query(
      'functionaris-status-code',
      queryParams
    );
    this.statusOptions = statusOptions;
  }
}
