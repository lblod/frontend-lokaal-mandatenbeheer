import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { BESTUURSORGAAN_CLASSIFICATIE_CODE_BURGEMEESTER } from 'frontend-lmb/utils/well-known-uris';
import moment from 'moment';
import {
  getDraftStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import { queryRecord } from 'frontend-lmb/utils/query-record';
import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class MandaatBurgemeesterSelectorComponent extends Component {
  @service store;

  @tracked persoon = null;
  @tracked mandataris = null;

  get bestuurseenheid() {
    return this.args.bestuurseenheid;
  }

  get bestuursorgaanInTijd() {
    return this.args.bestuursorgaanInTijd;
  }

  get bindingStart() {
    return this.bestuursorgaanInTijd.bindingStart;
  }

  get bindingEinde() {
    return this.bestuursorgaanInTijd.bindingEinde;
  }

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    const burgemeesterMandaat = await this.getBurgemeesterMandaat();
    this.persoon = await this.loadBurgemeesterPersoon(burgemeesterMandaat);
  }

  formatToDateString(dateTime) {
    return dateTime ? moment(dateTime).format('YYYY-MM-DD') : undefined;
  }

  async getBurgemeesterMandaat() {
    return await queryRecord(this.store, 'mandaat', {
      filter: {
        'bevat-in': {
          'binding-start': this.formatToDateString(this.bindingStart),
          'binding-einde': this.formatToDateString(this.bindingEinde),
          'is-tijdsspecialisatie-van': {
            classificatie: {
              ':uri:': BESTUURSORGAAN_CLASSIFICATIE_CODE_BURGEMEESTER,
            },
            bestuurseenheid: {
              ':id:': this.bestuurseenheid.id,
            },
          },
        },
      },
    });
  }

  async createMandataris(burgemeesterMandaat) {
    const newMandataris = this.store.createRecord('mandataris', {
      rangorde: null,
      start: this.bindingStart,
      einde: this.bindingEinde,
      bekleedt: burgemeesterMandaat,
      isBestuurlijkeAliasVan: null,
      beleidsdomein: [],
      status: await getEffectiefStatus(this.store),
      publicationStatus: await getDraftStatus(this.store),
    });
    await newMandataris.save();
    return newMandataris;
  }

  async loadBurgemeesterPersoon(burgemeesterMandaat) {
    const burgemeesters = await burgemeesterMandaat.bekleedDoor;

    if (burgemeesters.length === 0) {
      this.mandataris = await this.createMandataris(burgemeesterMandaat);
      return null;
    } else if (burgemeesters.length === 1) {
      const burgemeester = burgemeesters[0];
      this.mandataris = burgemeester;
      return await burgemeester.isBestuurlijkeAliasVan;
    } else {
      const errorMessage = 'Er zijn meerdere burgemeesters gevonden.';
      console.error(errorMessage);
      showErrorToast(errorMessage);
      return null;
    }
  }

  @action
  async onUpdate(persoon) {
    this.persoon = persoon;
    this.mandataris.isBestuurlijkeAliasVan = persoon;
    await this.mandataris.save();
  }
}
