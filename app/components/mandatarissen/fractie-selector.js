import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task } from 'ember-concurrency';
import { showErrorToast } from 'frontend-lmb/utils/toasts';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service store;
  @service currentSession;
  @service('fractie') fractieService;
  @service fractieApi;
  @service persoonApi;
  @service mandatarisApi;
  @service toaster;

  @tracked _fractie;
  @tracked person;
  @tracked fractieOptions = [];
  @tracked showTempError = false;

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
    if (!(await this.isValidFractieForPerson(fractie))) {
      showErrorToast(
        this.toaster,
        'Deze fractie komt niet overeen met de fractie van deze persoon aan de zijde van de gemeente. Doe je een correctie, pas dan eerst de fractie aan aan de zijde van de gemeente.'
      );
      this.triggerTempError();
      return;
    }
    this._fractie = fractie;
    await this.args.onSelect(this._fractie);
  }

  triggerTempError() {
    this.showTempError = true;
    setTimeout(() => {
      this.showTempError = false;
    }, 3000);
  }

  async isValidFractieForPerson(fractie) {
    try {
      const bestuurseenheid = this.currentSession.group;
      if (!bestuurseenheid.isOCMW) {
        return true;
      }
      const response = await fetch(
        `/mandataris-api/personen/${this.person.id}/check-fraction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': JSON_API_TYPE,
          },
          body: JSON.stringify({
            bestuursperiodeId: this.args.bestuursperiode.id,
            fractieId: fractie.id,
          }),
        }
      );
      return (await response.json()).ok;
    } catch (e) {
      console.error('Error checking fraction validity:', e);
      return false;
    }
  }

  get title() {
    return this.args.title || 'Fractie';
  }
}
