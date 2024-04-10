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
    this.searchByName.perform();
  }

  searchByName = task({ restartable: true }, async (searchData) => {
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
    let fracties = await this.store.query('fractie', queryParams);
    // let onafhankelijke = fracties.find(
    //   async (f) => (await f.get('fractietype')).isOnafhankelijk
    // );
    let onafhankelijke = await this.store.query('fractie', {
      filter: {
        'bestuursorganen-in-tijd': {
          id: this.bestuursorganenId.join(','),
        },
        fractietype: {
          ':uri:': FRACTIETYPE_ONAFHANKELIJK,
        },
      },
    });
    if (onafhankelijke.length == 0) {
      onafhankelijke = await this.createOnafhankelijkeFractie();
      fracties = [...fracties, onafhankelijke];
    }
    // so we have results when search is blank
    if (!searchData) {
      this.fractieOptions = fracties;
    }
    return fracties;
  });

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
}
