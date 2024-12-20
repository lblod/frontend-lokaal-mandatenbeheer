import Component from '@glimmer/component';

import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { restartableTask } from 'ember-concurrency';

import { foldMandatarisses } from 'frontend-lmb/utils/fold-mandatarisses';

export default class MandatarissenPersoonTable extends Component {
  @service store;

  @tracked tableRows = A();
  @tracked openPersons = A();

  displayType = {
    persoon: 'model',
    subRow: 'mandaten',
  };

  showMandatenForPerson = restartableTask(async (persoonId, clickedObject) => {
    const mandatarissen = await this.store.query('mandataris', {
      'filter[is-bestuurlijke-alias-van][:id:]': persoonId,
      'filter[bekleedt][bevat-in][heeft-bestuursperiode][:id:]':
        this.args.bestuursperiode.id,
      'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      include: ['bekleedt', 'bekleedt.bestuursfunctie'].join(','),
    });
    const foldedMandatarissen = await foldMandatarisses(null, mandatarissen);
    const subRows = await Promise.all(
      foldedMandatarissen.map(async (foldedMandataris) => {
        const mandataris = foldedMandataris.mandataris;
        const mandaat = await mandataris.bekleedt;
        const bestuursfunctie = await mandaat.bestuursfunctie;
        return {
          type: this.displayType.subRow,
          data: {
            orgaan: null,
            mandaat: {
              label: bestuursfunctie.label,
              routeModelIds: [persoonId, mandataris.id],
            },
          },
        };
      })
    );
    const clickedIndex = this.tableRows.indexOf(clickedObject);
    delete clickedObject.iconSubRowOpen;
    const clickedReplacement = {
      iconSubRowOpen: 'nav-up',
      ...clickedObject,
    };
    this.tableRows.replace(clickedIndex, 1, [clickedReplacement, ...subRows]);
  });

  setupTableRows = restartableTask(async () => {
    this.tableRows.clear();
    const withModelType = this.args.content.map((persoonModel) => {
      return {
        iconSubRowOpen: 'nav-down',
        type: this.displayType.persoon,
        data: persoonModel,
      };
    });
    this.tableRows.pushObjects(withModelType);
  });
}
