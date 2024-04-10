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
    this.fractieOptions = fracties;
  }

  async fetchFracties(searchData) {
    await timeout(SEARCH_TIMEOUT);
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
    return await this.store.query('fractie', queryParams);
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
