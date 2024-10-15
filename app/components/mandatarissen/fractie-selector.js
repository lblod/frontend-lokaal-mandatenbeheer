import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task } from 'ember-concurrency';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service store;
  @service currentSession;
  @service bestuursperioden;
  @service('fractie') fractieService;
  @service fractieApi;
  @service persoonApi;
  @service mandatarisApi;

  @tracked _fractie;
  @tracked bestuursorganen = [];
  @tracked fractieOptions = [];

  constructor() {
    super(...arguments);
    if (this.args.fractie) {
      this._fractie = this.args.fractie;
    }
    this.load.perform();
  }

  load = task(async () => {
    await this.loadBestuursorganen();
    await this.loadFracties();
  });

  async loadBestuursorganen() {
    if (this.args.bestuursperiode) {
      this.bestuursorganen =
        await this.bestuursperioden.getRelevantTijdsspecialisaties(
          this.args.bestuursperiode
        );
    }
  }

  async loadFracties() {
    this.fractieOptions = [];
    const person = await this.getPerson();

    if (this.args.isInCreatingForm) {
      // The current fractie is always the only one you can select if it is set!
      const currentFractie = await this.persoonApi.getCurrentFractie(
        person.id,
        this.args.bestuursperiode.id
      );
      if (currentFractie) {
        this.fractieOptions = [currentFractie];
      } else {
        this.fractieOptions =
          await this.fractieApi.samenwerkingForBestuursperiode(
            this.args.bestuursperiode.id
          );
      }
      return;
    }

    if (this.args.isUpdatingState) {
      this.fractieOptions = await this.mandatarisApi.getMandatarisFracties(
        this.args.mandataris.id
      );

      if (
        this.fractieOptions.length <= 1 &&
        this.fractieOptions.at(0).isSamenwerkingsverband
      ) {
        let onafhankelijkeFractie =
          this.fractieService.getOrCreateOnafhankelijkeFractie(
            person,
            this.bestuursorganen,
            this.args.bestuurseenheid
          );
        this.fractieOptions = [...this.fractieOptions, onafhankelijkeFractie];
      }
      return;
    }

    // This is the correct mistakes, all fracties are possible, with onafhankelijk as well.
    const samenwerkingsFracties =
      await this.fractieApi.samenwerkingForBestuursperiode(
        this.args.bestuursperiode.id
      );
    let onafhankelijkeFractie =
      this.fractieService.getOrCreateOnafhankelijkeFractie(
        person,
        this.bestuursorganen,
        this.args.bestuurseenheid
      );
    this.fractieOptions = [...samenwerkingsFracties, onafhankelijkeFractie];
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
}
