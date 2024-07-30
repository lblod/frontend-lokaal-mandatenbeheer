import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';
import { persoonRepository } from 'frontend-lmb/repositories/persoon';
import { fractieRepository } from 'frontend-lmb/repositories/fractie';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service store;
  @service currentSession;
  @service bestuursperioden;

  @tracked _fractie;
  @tracked bestuursorganen = [];
  @tracked bestuursorganenId;
  @tracked fractieOptions = [];

  constructor() {
    super(...arguments);
    if (this.args.fractie) {
      this._fractie = this.args.fractie;
    }
    this.load();
  }

  async load() {
    await this.loadBestuursorganen();
    await this.loadFracties();
  }

  async loadBestuursorganen() {
    if (this.args.bestuursperiode) {
      this.bestuursorganen =
        await this.bestuursperioden.getRelevantTijdsspecialisaties(
          this.args.bestuursperiode
        );
      this.bestuursorganenId = this.bestuursorganen.map((o) => o.get('id'));
    }
  }

  async loadFracties() {
    let fracties = [];

    if (this.args.isUpdatingState) {
      const personFracties = await this.getPersonFracties();
      fracties = await this.getFractiesWithOnafhankelijke(personFracties);
    }

    if (!this.args.isUpdatingState && !this.args.isInCreatingForm) {
      const samenwerkendeFracties = await this.fetchFracties();
      fracties = await this.getFractiesWithOnafhankelijke(
        samenwerkendeFracties
      );
    }

    if (!this.args.isUpdatingState && this.args.isInCreatingForm) {
      const currentFractie = await this.args.person.fractie;

      if (currentFractie) {
        fracties = [currentFractie];
      } else {
        const samenwerkendeFracties = await this.fetchFracties();
        fracties = await this.getFractiesWithOnafhankelijke(
          samenwerkendeFracties
        );
      }
    }

    this.fractieOptions = fracties;
  }

  async getPersonFracties() {
    const mandaat = await this.args.mandataris.bekleedt;
    const person = await this.args.mandataris.isBestuurlijkeAliasVan;
    const uris = await fractieRepository.getAllUrisForPerson(
      person.id,
      mandaat.uri
    );

    return this.store.query('fractie', {
      'filter[:uri:]': uris.join(','),
    });
  }

  async fetchFracties(searchData) {
    let queryParams = {
      sort: 'naam',
      include: 'fractietype',
      filter: {
        'bestuursorganen-in-tijd': {
          id: this.bestuursorganenId.join(','),
        },
        fractietype: {
          ':uri:': FRACTIETYPE_SAMENWERKINGSVERBAND,
        },
      },
    };
    if (searchData) {
      queryParams.filter.naam = searchData;
    }
    return await this.store.query('fractie', queryParams);
  }

  async getFractiesWithOnafhankelijke(fracties) {
    const hasOnafhankelijkeFractie =
      await persoonRepository.findOnafhankelijkeFractie(
        this.args.person.id,
        this.args.bestuursperiode.id
      );
    if (!hasOnafhankelijkeFractie) {
      console.log('creating a uri');
      const createdUri = await fractieRepository.createOnafhankelijkeFractie(
        this.bestuursorganen.map((boit) => boit.uri),
        this.args.bestuurseenheid.uri
      );
      this.createdOnafhankelijkeFractie = {
        uri: createdUri,
        naam: 'Onafhankelijk',
      };

      return Array.from(
        new Set([...fracties, this.createdOnafhankelijkeFractie])
      );
    }

    const fractieModels = await this.store.query('fractie', {
      'filter[:uri:]': hasOnafhankelijkeFractie.uri,
    });

    return [...fracties, fractieModels.at(0)];
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
