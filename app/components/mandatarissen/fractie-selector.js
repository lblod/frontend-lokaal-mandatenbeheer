import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { FRACTIETYPE_ONAFHANKELIJK } from 'frontend-lmb/utils/well-known-uris';

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
    this.fractieOptions = [];
    const person = await this.getPerson();

    if (this.args.isUpdatingState) {
      this.fractieOptions = await this.persoonApi.getMandatarisFracties(
        person.id,
        this.args.bestuursperiode.id
      );
    }

    if (!this.args.isUpdatingState && !this.args.isInCreatingForm) {
      this.fractieOptions = await this.fractieApi.forBestuursperiode(
        this.args.bestuursperiode.id
      );
    }

    if (!this.args.isUpdatingState && this.args.isInCreatingForm) {
      const currentFractie = await this.persoonApi.getCurrentFractie(
        person.id,
        this.args.bestuursperiode.id
      );

      if (currentFractie) {
        this.fractieOptions = [currentFractie];
        return;
      } else {
        this.fractieOptions = await this.fractieApi.forBestuursperiode(
          this.args.bestuursperiode.id
        );
      }
    }

    const onafhankelijkeFractie =
      await this.fractieService.findOnafhankelijkeFractieForPerson(person);
    if (!onafhankelijkeFractie) {
      const onafhankelijkeTmpFractie =
        await this.fractieService.createOnafhankelijkeFractie(
          this.bestuursorganen,
          this.args.bestuurseenheid
        );
      this.fractieOptions = [...this.fractieOptions, onafhankelijkeTmpFractie];
    }

    if (
      !(await this.isFractiesIncludingOnafhankelijk(this.fractieOptions)) &&
      !this.args.isInCreatingForm
    ) {
      this.fractieOptions = [...this.fractieOptions, onafhankelijkeFractie];
    }
  }

  async isFractiesIncludingOnafhankelijk(fracties) {
    const onafhankelijke = await Promise.all(
      fracties.map(async (fractie) => {
        const type = await fractie.fractietype;
        return type.uri === FRACTIETYPE_ONAFHANKELIJK;
      })
    );

    return onafhankelijke.includes(true);
  }

  async getPerson() {
    if (this.args.mandataris) {
      return await this.args.mandataris.isBestuurlijkeAliasVan;
    }

    return this.args.person;
  }

  @action
  async select(fractie) {
    this._fractie = fractie;
    this.args.onSelect(this._fractie);
  }

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    let searchResults = await this.fetchFracties(searchData);
    return searchResults;
  });
}
