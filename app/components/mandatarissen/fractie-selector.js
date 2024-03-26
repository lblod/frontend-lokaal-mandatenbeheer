import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

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

  @restartableTask
  *searchByName(searchData) {
    yield timeout(SEARCH_TIMEOUT);
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
    let fracties = yield this.store.query('fractie', queryParams);
    fracties = fracties.filter((f) => !f.get('fractietype.isOnafhankelijk'));
    //sets dummy
    if ('onafhankelijk'.includes(searchData?.toLowerCase())) {
      fracties.pushObject(yield this.createNewOnafhankelijkeFractie());
    }
    // so we have results when search is blank
    if (!searchData) {
      this.fractieOptions = fracties;
    }
    return fracties;
  }

  async createNewOnafhankelijkeFractie() {
    let onafFractie = (await this.store.findAll('fractietype')).find((f) =>
      f.get('isOnafhankelijk')
    );
    return this.store.createRecord('fractie', {
      naam: 'Onafhankelijk',
      fractietype: onafFractie,
      bestuursorganenInTijd: this.args.bestuursorganen,
      bestuurseenheid: this.bestuurseeneenheid,
    });
  }

  @action
  select(fractie) {
    this._fractie = fractie;
    this.args.onSelect(fractie);
  }
}
