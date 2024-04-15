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
    let fracties = [];

    if (this.args.isUpdatingState && this._fractie) {
      fracties = await this.getFractiesWhenUpdateState();
    } else {
      fracties = await this.fetchFracties();
    }

    let onafhankelijke = fracties.find((f) =>
      f.get('fractietype.isOnafhankelijk')
    );

    if (!onafhankelijke) {
      onafhankelijke = await this.createOnafhankelijkeFractie();
      this.fractieOptions = [...fracties, onafhankelijke];
      return;
    }

    this.fractieOptions = fracties;
  }

  async getFractiesWhenUpdateState() {
    const mandatarissen = await this.store.query('mandataris', {
      include: 'heeft-lidmaatschap,heeft-lidmaatschap.binnen-fractie',
      filter: {
        bekleedt: { id: this.args.mandataris.bekleedt.id },
        'is-bestuurlijke-alias-van': {
          id: this.args.mandataris.isBestuurlijkeAliasVan.id,
        },
      },
    });
    const fracties = await this.fractiesVanMandatarissen(mandatarissen);

    return fracties;
  }

  async fractiesVanMandatarissen(mandatarissen) {
    const fracties = [];
    let containsOnafhankelijke = false;
    for (const mandate of mandatarissen) {
      const lidmaatschap = await mandate.heeftLidmaatschap;
      if (!lidmaatschap) {
        continue;
      }
      const fractie = await lidmaatschap.binnenFractie;
      if (!fractie) {
        continue;
      }

      if (!fracties.find((fractieModel) => fractieModel.id == fractie.id)) {
        fracties.push(fractie);
      }

      if (fractie.get('fractietype.isOnafhankelijk')) {
        containsOnafhankelijke = true;
      }
    }

    if (!containsOnafhankelijke) {
      let onafhankelijke = await this.fetchOnafhankelijkeFractie();
      return onafhankelijke ? [...fracties, onafhankelijke] : fracties;
    }

    return fracties;
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

  async fetchOnafhankelijkeFractie() {
    const onafhankelijke = await this.store.query('fractie', {
      page: { size: 1 },
      'filter[fractietype][:uri:]': FRACTIETYPE_ONAFHANKELIJK,
      include: 'fractietype',
    });
    return onafhankelijke.length ? onafhankelijke[0] : null;
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
}
