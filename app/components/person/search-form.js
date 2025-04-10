import Component from '@glimmer/component';

import { service } from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task, timeout } from 'ember-concurrency';

export default class SharedPersoonPersoonSearchFormComponent extends Component {
  @service store;
  @service('verkiezing') verkiezingService;

  @tracked pageSize = 20;
  @tracked queryParams;
  @tracked error;
  @tracked page;

  @tracked personen;
  @tracked achternaam;
  @tracked voornaam;
  @tracked rijksregisternummer;

  get allowCreate() {
    return !this.args.onlyElected;
  }

  get searchTerms() {
    return [this.voornaam, this.achternaam, this.rijksregisternummer]
      .filter((t) => t)
      .join(', ');
  }

  get isQuerying() {
    return this.search.isRunning || this.getPersoon.isRunning;
  }

  get hasSearched() {
    return this.search.performCount > 0;
  }

  get showDefaultHead() {
    return this.args.showDefaultHead ?? true;
  }

  constructor() {
    super(...arguments);
    this.personen = A();
  }

  @action
  setVoornaam(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    this.voornaam = event.target.value.trim();
    this.search.perform();
  }

  @action
  setAchternaam(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    this.achternaam = event.target.value.trim();
    this.search.perform();
  }

  @action
  setRijksregisternummer(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    this.rijksregisternummer = event.target.value.trim();
    this.search.perform();
  }

  search = task({ restartable: true }, async () => {
    await timeout(300);

    if (!(this.achternaam || this.voornaam || this.rijksregisternummer)) {
      this.queryParams = {};
      this.personen = [];
      return;
    }

    const extraFilter = {};
    if (
      this.args.onlyElected &&
      this.args.bestuursorgaanIT &&
      (await this.args.bestuursorgaanIT.hasElections())
    ) {
      extraFilter.verkiezingsresultaten = {
        kandidatenlijst: {
          verkiezing: {
            'bestuursorganen-in-tijd': {
              ':id:': this.args.bestuursorgaanIT.id,
            },
          },
        },
      };
    }

    let queryParams = {
      sort: 'achternaam',
      include: ['geboorte', 'identificator', 'geslacht'].join(','),
      filter: {
        achternaam: this.achternaam || undefined,
        'gebruikte-voornaam': this.voornaam || undefined,
        identificator:
          (this.rijksregisternummer &&
            this.rijksregisternummer.replace(/\D+/g, '')) ||
          undefined,
        ...extraFilter,
      },
      page: {
        size: this.pageSize,
        number: 0,
      },
    };
    this.queryParams = queryParams;
    this.personen = await this.getPersoon.perform(queryParams);
    if (this.personen.meta.pagination.self.number !== this.page) {
      this.page = 0;
    }
  });

  getPersoon = task(async (queryParams) => {
    let personen = null;
    try {
      personen = await this.store.query('persoon', queryParams);
    } catch (e) {
      this.error = true;
    }
    return personen;
  });

  resetAfterError() {
    this.error = false;
    this.search.cancelAll({ resetState: true });
  }

  @action
  async selectPage(page = 0) {
    this.page = page;
    let queryParams = this.queryParams;
    queryParams['page'] = { number: page };
    this.personen = await this.getPersoon.perform(queryParams);
  }

  @action
  selectPersoon(persoon) {
    this.args.onSelect(persoon);
  }

  @action
  cancel() {
    this.args.onCancel();
  }

  @action
  toggleError() {
    this.resetAfterError();
  }

  @action
  handleCreatePersonClick() {
    if (!(this.achternaam || this.voornaam || this.rijksregisternummer)) {
      this.args.onCreateNewPerson();
    } else {
      this.args.onCreateNewPerson({
        voornaam: this.voornaam,
        achternaam: this.achternaam,
        rijksregisternummer: this.rijksregisternummer,
      });
    }
  }
}
