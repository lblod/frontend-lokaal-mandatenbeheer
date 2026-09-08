import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task as trackedTask } from 'reactiveweb/ember-concurrency';
import { task } from 'ember-concurrency';
import { showErrorToast } from 'frontend-lmb/utils/toasts';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service store;
  @service currentSession;
  @service('fractie') fractieService;
  @service fractieApi;
  @service persoonApi;
  @service toaster;

  @tracked _fractie;
  @tracked showTempError = false;

  loadFracties = task({ restartable: true }, async () => {
    if (this.args.limitPersonFractionsToCurrent) {
      // The current fractie is always the only one you can select if it is set!
      const currentFractie = await this.persoonApi.getCurrentFractie(
        this.args.person.id,
        this.args.bestuursperiode.id
      );
      if (currentFractie) {
        return [currentFractie];
      }

      return await this.fractieApi.samenwerkingForBestuursperiode(
        this.args.bestuursperiode.id
      );
    }

    const samenwerkingsFracties =
      await this.fractieApi.samenwerkingForBestuursperiode(
        this.args.bestuursperiode.id
      );
    const availableFractions = [...samenwerkingsFracties];
    if (!this.args.isCreating) {
      let onafhankelijkeFractie =
        await this.fractieService.getOrCreateOnafhankelijkeFractie(
          this.args.person,
          this.args.bestuursperiode,
          this.args.bestuurseenheid
        );
      availableFractions.push(onafhankelijkeFractie);
    }
    return availableFractions;
  });

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
      if (!bestuurseenheid.isOCMW || !fractie) {
        return true;
      }
      const response = await fetch(
        `/mandataris-api/personen/${this.args.person.id}/check-fraction`,
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

  options = trackedTask(this, this.loadFracties, () => [
    this.args.person,
    this.args.bestuursperiode,
  ]);
}
