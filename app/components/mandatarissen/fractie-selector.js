import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service store;
  @service currentSession;
  @service bestuursperioden;
  @service('fractie') fractieService;
  @service fractieApi;
  @service persoonApi;

  @tracked _fractie;
  @tracked bestuursorganen = [];
  @tracked bestuursorganenId;
  @tracked fractieOptions = [];
  onafhankelijkeTmpFractie;

  constructor() {
    super(...arguments);
    if (this.args.fractie) {
      this._fractie = this.args.fractie;
    }
    this.load();
  }

  async willDestroy() {
    super.willDestroy(...arguments);
    if (
      this._fractie &&
      this.onafhankelijkeTmpFractie &&
      this._fractie.uri !== this.onafhankelijkeTmpFractie.uri
    ) {
      await this.onafhankelijkeTmpFractie.destroy();
    }
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
    const person = await this.getPerson();

    if (this.args.isUpdatingState) {
      fracties = await this.persoonApi.getMandatarisFracties(
        person.id,
        this.args.bestuursperiode.id
      );
    }

    if (!this.args.isUpdatingState && !this.args.isInCreatingForm) {
      fracties = await this.fractieApi.forBestuursperiode(
        this.args.bestuursperiode.id
      );
    }

    if (!this.args.isUpdatingState && this.args.isInCreatingForm) {
      const currentFractie = await this.persoonApi.getCurrentFractie(
        person.id,
        this.args.bestuursperiode.id
      );

      if (currentFractie) {
        fracties = [currentFractie];
      } else {
        fracties = await this.fractieApi.forBestuursperiode(
          this.args.bestuursperiode.id
        );
      }
    }

    const onafhankelijkeFractie =
      await this.fractieService.findOnafhankelijkeFractieForPerson(person);
    if (!onafhankelijkeFractie) {
      this.onafhankelijkeTmpFractie =
        await this.fractieService.createOnafhankelijkeFractie(
          this.bestuursorganen,
          this.args.bestuurseenheid
        );
      fracties = [...fracties, this.onafhankelijkeTmpFractie];
    }

    this.fractieOptions = fracties;
  }

  async getPerson() {
    if (this.args.mandataris) {
      return await this.args.mandataris.isBestuurlijkeAliasVan;
    }

    return this.args.person;
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
