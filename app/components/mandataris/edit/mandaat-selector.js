import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

function getMandaatOptions() {
  return trackedFunction(async () => {
    return await this.store.query('mandaat', {
      sort: 'bestuursfunctie.label',
      include: 'bestuursfunctie',
      'filter[bevat-in][:id:]': this.args.currentBestuursorgaan.id,
    });
  });
}

export default class MandatarisMandaatSelector extends Component {
  @service store;
  @service persoonApi;

  @tracked errorValidations = [];
  @tracked warningValidations = [];
  @tracked hasBeenFocused = false;
  @tracked mandaat = null;

  @use(getMandaatOptions) getMandaatOptions;

  constructor() {
    super(...arguments);
    this.mandaat = this.args.mandaat;
  }

  get mandaatOptions() {
    return this.getMandaatOptions?.value ?? [];
  }

  get canShowValidationMessages() {
    return this.hasBeenFocused;
  }

  get errors() {
    return this.canShowValidationMessages ? this.errorValidations : [];
  }

  get hasErrors() {
    return this.errors.length > 0;
  }

  get warnings() {
    return this.canShowValidationMessages ? this.warningValidations : [];
  }

  get hasWarnings() {
    return this.warnings.length > 0;
  }

  @action
  async updateMandaat(mandate) {
    this.mandaat = mandate;
    this.hasBeenFocused = true;
    await this.updateValidations();
    this.args.onUpdate(mandate, { hasErrors: this.args.required && !mandate });
  }

  async updateValidations() {
    this.errorValidations = [];
    await this.checkPersonMandates();
    this.args.onValidate(this.hasErrors);
  }

  async checkPersonMandates() {
    const person = await this.args.mandataris.get('isBestuurlijkeAliasVan');
    if (!person || !this.mandaat) {
      return;
    }
    const activeMandatees = await this.persoonApi.getPersonMandateesWithMandate(
      person.id,
      this.mandaat.id
    );
    if (
      activeMandatees.length === 0 ||
      activeMandatees.some((mand) => mand.uri === this.args.mandataris.uri)
    ) {
      return;
    }
    this.errorValidations = [
      {
        valid: false,
        resultMessage:
          'Deze persoon heeft dit mandaat al in deze bestuursperiode',
      },
    ];
  }
}
