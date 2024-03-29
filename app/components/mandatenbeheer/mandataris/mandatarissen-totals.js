import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MandatenbeheerMandatarissenTotalsComponent extends Component {
  @service() store;

  @tracked isOpen = false;
  @tracked mandatarissenTotals;

  getMandatenForOrgaan(bestuursorgaan) {
    const queryParams = {
      filter: {
        'bevat-in': {
          id: bestuursorgaan.get('id'),
        },
      },
      include: [
        'bestuursfunctie',
        'bevat-in',
        'bevat-in.is-tijdsspecialisatie-van',
      ].join(','),
    };
    return this.store.query('mandaat', queryParams);
  }

  getMandatarissenForMandaat(mandaat) {
    const queryParams = {
      filter: {
        bekleedt: {
          id: mandaat.get('id'),
        },
      },
    };
    return this.store.query('mandataris', queryParams);
  }

  @dropTask
  async getMandatarissenTotals() {
    const bestuursorganen = this.args.bestuursorganen;

    const orgaanMandatenMap = await Promise.all(
      bestuursorganen.map(async (orgaan) => {
        return {
          orgaan,
          mandaten: await this.getMandatenForOrgaan(orgaan),
        };
      })
    );

    const mapMandatenToMandatarissen = async (mandaat) => {
      return {
        naam: await mandaat.get('bestuursfunctie.label'),
        aantal: (await this.getMandatarissenForMandaat(mandaat)).meta.count,
      };
    };

    const mandatarissenOrgaanMap = await Promise.all(
      orgaanMandatenMap.map(async (e) => {
        return {
          orgaan: e.orgaan,
          mandaten: await Promise.all(
            e.mandaten.map(mapMandatenToMandatarissen)
          ),
        };
      })
    );

    this.mandatarissenTotals = mandatarissenOrgaanMap;
  }

  @action
  toggleOpen() {
    if (!this.isOpen) {
      this.getMandatarissenTotals.perform();
    }
    this.isOpen = !this.isOpen;
  }
}
