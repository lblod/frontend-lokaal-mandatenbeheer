import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
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

  showMandatenForPerson = restartableTask(async (clickedObject, persoon) => {
    if (!persoon) {
      return;
    }

    const mandatarissen = await this.store.query('mandataris', {
      'filter[is-bestuurlijke-alias-van][:id:]': persoon.id,
      'filter[bekleedt][bevat-in][heeft-bestuursperiode][:id:]':
        this.args.bestuursperiode.id,
      'filter[bekleedt][bevat-in][is-tijdsspecialisatie-van][:has-no:original-bestuurseenheid]': true,
      include: ['bekleedt', 'bekleedt.bestuursfunctie'].join(','),
    });
    if (this.isClickedObjectOpen(clickedObject)) {
      const idsOfRowsToRemove = (
        await foldMandatarisses(null, mandatarissen)
      ).map((fold) => `${persoon.id}-${fold.mandataris.id}`);
      const rowsToRemove = this.tableRows.filter((row) =>
        idsOfRowsToRemove.includes(row.data.id)
      );
      const clickedIndex = this.tableRows.indexOf(clickedObject);
      delete clickedObject.iconSubRowOpen;
      const clickedReplacement = {
        iconSubRowOpen: 'nav-down',
        ...clickedObject,
      };
      this.tableRows.replace(clickedIndex, 1, [clickedReplacement]);
      this.tableRows.removeObjects(rowsToRemove);
    } else {
      const foldedMandatarissen = await foldMandatarisses(null, mandatarissen);
      const subRows = await Promise.all(
        foldedMandatarissen.map(async (foldedMandataris) => {
          const mandataris = foldedMandataris.mandataris;
          const mandaat = await mandataris.bekleedt;
          const bestuursfunctie = await mandaat.bestuursfunctie;
          const bestuursorganenInTijd = await mandaat.bevatIn;
          let bestuursorgaan = null;
          if (bestuursorganenInTijd.length >= 1) {
            const bestuursorgaanInTijd = bestuursorganenInTijd.at(0);
            bestuursorgaan = await bestuursorgaanInTijd.isTijdsspecialisatieVan;
          }
          return {
            type: this.displayType.subRow,
            data: {
              id: `${persoon.id}-${mandataris.id}`,
              mandataris: mandataris,
              bestuursorgaan: {
                label: bestuursorgaan?.naam,
                routeModelId: bestuursorgaan?.id,
              },
              mandaat: {
                label: bestuursfunctie.label,
                routeModelIds: [persoon.id, mandataris.id],
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
    }
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

  @action
  isClickedObjectOpen(clickedObject) {
    return clickedObject.iconSubRowOpen === 'nav-up';
  }
}
