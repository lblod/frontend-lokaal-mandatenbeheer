import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task } from 'ember-concurrency';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service store;
  @service currentSession;
  @service('fractie') fractieService;
  @service fractieApi;
  @service persoonApi;
  @service mandatarisApi;

  @tracked _fractie;
  @tracked person;
  @tracked fractieOptions = [];

  constructor() {
    super(...arguments);
    if (this.args.fractie) {
      this._fractie = this.args.fractie;
    }
    this.load.perform();
  }

  load = task(async () => {
    await this.loadFracties();
  });

  async loadFracties() {
    this.fractieOptions = [];
    this.person = await this.getPerson();

    if (this.args.limitPersonFractionsToCurrent) {
      // The current fractie is always the only one you can select if it is set!
      const currentFractie = await this.persoonApi.getCurrentFractie(
        this.person.id,
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

      if (this.fractieOptions.length == 0) {
        const currentFractie = await this.persoonApi.getCurrentFractie(
          this.person.id,
          this.args.bestuursperiode.id
        );
        if (currentFractie) {
          this.fractieOptions = [currentFractie];
          if (currentFractie.isOnafhankelijk) {
            return;
          }
        } else {
          this.fractieOptions =
            await this.fractieApi.samenwerkingForBestuursperiode(
              this.args.bestuursperiode.id
            );
        }
      } else if (
        this.fractieOptions.length > 1 ||
        this.fractieOptions.at(0).isOnafhankelijk
      ) {
        return;
      }

      // If the onafhankelijke fractie was already present, we returned earlier,
      // so now we can add a new onafhankelijke fractie
      let onafhankelijkeFractie =
        await this.fractieService.getOrCreateOnafhankelijkeFractie(
          this.person,
          this.args.bestuursperiode,
          this.args.bestuurseenheid
        );
      this.fractieOptions = [...this.fractieOptions, onafhankelijkeFractie];
      return;
    }

    // This is the correct mistakes, all fracties are possible. onafhankelijke is only possible if not creating
    const samenwerkingsFracties =
      await this.fractieApi.samenwerkingForBestuursperiode(
        this.args.bestuursperiode.id
      );
    let onafhankelijkeFractie =
      await this.fractieService.getOrCreateOnafhankelijkeFractie(
        this.person,
        this.args.bestuursperiode,
        this.args.bestuurseenheid
      );
    const availableFractions = [...samenwerkingsFracties];
    if (!this.args.isCreating) {
      availableFractions.push(onafhankelijkeFractie);
    }
    this.fractieOptions = availableFractions;
  }

  async getPerson() {
    if (this.args.mandataris) {
      return await this.args.mandataris.isBestuurlijkeAliasVan;
    }

    return this.args.person;
  }

  @action
  async select(fractie) {
    if (fractie?.isNew) {
      await fractie.save();
    }
    this._fractie = fractie;
    await this.args.onSelect(this._fractie, {
      hasErrors: this.args.isRequired && !fractie,
    });
  }

  get title() {
    return this.args.title || 'Fractie';
  }
}
