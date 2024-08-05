import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task, timeout } from 'ember-concurrency';
import { SEARCH_TIMEOUT } from 'frontend-lmb/utils/constants';
import { FRACTIETYPE_ONAFHANKELIJK } from 'frontend-lmb/utils/well-known-uris';

const TEMPORARY_FRACTIE_URI = 'http://temporary-fractie';
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
    console.log(`load fracties`);
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
    if (!onafhankelijkeFractie && !this.onafhankelijkeTmpFractie) {
      console.log(`set onafhank to TEMP URI`);
      this.onafhankelijkeTmpFractie = {
        uri: TEMPORARY_FRACTIE_URI,
        naam: 'Independant',
        fractietype: { uri: FRACTIETYPE_ONAFHANKELIJK },
      };
      fracties = [...fracties, this.onafhankelijkeTmpFractie];
    }

    if (
      !(await this.isFractiesIncludingOnafhankelijk(fracties)) &&
      !this.args.isInCreatingForm
    ) {
      fracties = [
        ...fracties,
        onafhankelijkeFractie ?? this.onafhankelijkeTmpFractie,
      ];
    }

    this.fractieOptions = fracties;
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
    console.log({ fractie });
    const selected = await this.handlePossibleOnafhankelijkeFractie(fractie);
    console.log(`setting fractie`, selected);
    this._fractie = selected;
    this.args.onSelect(selected);
  }

  async handlePossibleOnafhankelijkeFractie(fractie) {
    console.log({
      selected: fractie.uri ?? null,
      current: this._fractie?.uri ?? null,
      tempOnafhankelijk: this.onafhankelijkeTmpFractie?.uri ?? null,
    });
    if (this._fractie && fractie.uri === this._fractie.uri) {
      console.log(`same option`);
      return fractie;
    }
    if (
      fractie &&
      this.onafhankelijkeTmpFractie &&
      this.onafhankelijkeTmpFractie.uri !== TEMPORARY_FRACTIE_URI &&
      fractie.uri !== this.onafhankelijkeTmpFractie.uri
    ) {
      await this.onafhankelijkeTmpFractie.destroyRecord();
      this.onafhankelijkeTmpFractie = null;
      console.log(`Destroyed the temp onahfnkelijke`);
    }
    if (
      this.onafhankelijkeTmpFractie &&
      this.onafhankelijkeTmpFractie.uri === TEMPORARY_FRACTIE_URI &&
      fractie.uri === TEMPORARY_FRACTIE_URI
    ) {
      this.onafhankelijkeTmpFractie =
        await this.fractieService.createOnafhankelijkeFractie(
          this.bestuursorganen,
          this.args.bestuurseenheid
        );
      console.log(`created temnp `);
      return this.onafhankelijkeTmpFractie;
    }

    console.log(`just return fractie`);
    return fractie;
  }

  search = task({ restartable: true }, async (searchData) => {
    await timeout(SEARCH_TIMEOUT);
    let searchResults = await this.fetchFracties(searchData);
    return searchResults;
  });
}
