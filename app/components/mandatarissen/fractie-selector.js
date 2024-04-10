import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { FRACTIETYPE_ONAFHANKELIJK } from 'frontend-lmb/utils/well-known-uris';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service() store;
  @service() currentSession;

  @tracked _fractie;
  @tracked bestuursorganenId;
  @tracked fractieOptions = [];

  constructor() {
    super(...arguments);
    if (this.args.fractie) {
      this._fractie = this.args.fractie;
    }
    if (this.args.bestuursorganen) {
      this.bestuursorganenId = this.args.bestuursorganen.map((o) =>
        o.get('id')
      );
    }

    this.loadFracties();
  }

  async loadFracties() {
    let fracties = await this.fetchFracties();

    let onafhankelijke = fracties.find((f) =>
      f.get('fractietype.isOnafhankelijk')
    );
    if (!onafhankelijke) {
      onafhankelijke = await this.createOnafhankelijkeFractie();
      fracties = [...fracties, onafhankelijke];
    }

    if (this.isUpdatingFractie && this.mandataris && this._fractie) {
      if (await this.isFractieIndependent(this._fractie)) {
        const mandataries = await this.store.query('mandataris', {
          include: 'heeft-lidmaatschap,heeft-lidmaatschap.binnen-fractie',
          filter: {
            bekleedt: { id: this.mandataris.bekleedt.id },
            'is-bestuurlijke-alias-van': {
              id: this.mandataris.isBestuurlijkeAliasVan.id,
            },
          },
        });

        const fractiesForMandataries = [];
        for (const mandate of mandataries) {
          const lidmaatschap = await mandate.heeftLidmaatschap;
          if (!lidmaatschap) {
            continue;
          }
          const fractie = await lidmaatschap.binnenFractie;
          if (!fractie) {
            continue;
          }

          if (
            !fractiesForMandataries.find(
              (fractieModel) => fractieModel.id == fractie.id
            )
          ) {
            fractiesForMandataries.push(fractie);
          }
        }
        this.fractieOptions = fractiesForMandataries;
      } else {
        const independentFractie = await this.getIndependentFractie(fracties);
        if (independentFractie) {
          this.fractieOptions = [this._fractie, independentFractie];
        } else {
          console.warning(`Creating a new independent fractie`);
          // should we create a new independent fractie here?
          const newIndependentFractie =
            await this.createOnafhankelijkeFractie();
          this.fractieOptions = [newIndependentFractie];
        }
      }
    } else {
      this.fractieOptions = fracties;
    }
  }

  async fetchFracties(searchData) {
    let queryParams = {
      sort: 'naam',
      include: 'fractietype',
      filter: {
        'bestuursorganen-in-tijd': {
          id: this.bestuursorganenId.join(','),
        },
      },
    };
    if (searchData) {
      queryParams.filter.naam = searchData;
    }
    let fracties = await this.store.query('fractie', queryParams);
    // Only show one onafhankelijke fractie
    return fracties.filter((obj, index) => {
      return (
        !obj.get('fractietype.isOnafhankelijk') ||
        index ===
          fracties.findIndex((o) => o.get('fractietype.isOnafhankelijk'))
      );
    });
  }

  async createOnafhankelijkeFractie() {
    const onafhankelijkeFractieType = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_ONAFHANKELIJK,
      })
    ).at(0);
    const onafhankelijke = this.store.createRecord('fractie', {
      naam: 'Onafhankelijk',
      fractietype: onafhankelijkeFractieType,
      bestuursorganenInTijd: this.args.bestuursorganen,
      bestuurseenheid: this.args.bestuurseenheid,
    });
    onafhankelijke.save();
    return onafhankelijke;
  }

  @action
  select(fractie) {
    this._fractie = fractie;
    this.args.onSelect(fractie);
  }

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    let searchResults = await this.fetchFracties(searchData);
    return searchResults;
  });

  async isFractieIndependent(fractie) {
    return await fractie.get('fractietype.isOnafhankelijk');
  }

  // REMOVE: This is always one yes?
  async getIndependentFractie(fracties) {
    for (const fractie of fracties) {
      const isIndependent = await this.isFractieIndependent(fractie);

      if (isIndependent) {
        return fractie;
      }
    }
    return null;
  }

  get mandataris() {
    return this.args.mandataris;
  }

  get isUpdatingFractie() {
    const state = this.args.isUpdatingFractie;
    if (state && typeof state == 'boolean') {
      return this.args.isUpdatingFractie;
    }

    return false;
  }
}
