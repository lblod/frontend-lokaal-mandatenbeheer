import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { getApplicationContextMetaTtl } from 'frontend-lmb/utils/form-context/application-context-meta-ttl';
import { task } from 'ember-concurrency';
import { INSTALLATIEVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarissenPersoonMandatarisController extends Controller {
  @service router;
  @service store;
  @service fractieApi;
  @service('mandataris') mandatarisService;

  @tracked isChanging;
  @tracked isCorrecting;
  @tracked periodeHasLegislatuur;
  @tracked behandeldeVergaderingen;

  @tracked correctedMandataris = false;
  @tracked updatedStateMandataris = false;
  @tracked newMandataris;

  @tracked formInitialized;

  get bestuursorganenTitle() {
    const bestuursfunctie = this.model.mandataris.bekleedt
      .get('bestuursfunctie')
      .get('label');
    return (
      `${bestuursfunctie}, ` +
      this.model.bestuursorganen
        .map((elem) => elem.isTijdsspecialisatieVan.get('naam'))
        .join(' - ')
    );
  }

  get persoon() {
    return this.model.mandataris.isBestuurlijkeAliasVan;
  }

  @action
  async closeModals() {
    this.isChanging = false;
    this.isCorrecting = false;
    this.formInitialized = false;
    await this.mandatarisService.removeDanglingFractiesInPeriod(
      this.model.mandataris.id
    );
  }

  @action
  async onUpdateState(newMandataris) {
    this.editMode = null;
    this.closeModals();
    this.newMandataris = newMandataris;
    this.updatedStateMandataris = true;
  }

  @action
  callbackAfterUpdate() {
    if (this.newMandataris != this.model.mandataris) {
      this.router.transitionTo(
        'mandatarissen.mandataris',
        this.newMandataris.id
      );
    }
  }

  @action
  async onSave({ instanceTtl }) {
    this.editMode = null;
    const store = new ForkingStore();
    store.parse(instanceTtl, SOURCE_GRAPH, 'text/turtle');

    await this.fractieApi.updateCurrentFractie(this.model.mandataris.id);

    this.correctedMandataris = true;
    setTimeout(() => this.router.refresh(), 1000);
    this.closeModals();
  }

  @action
  async buildMetaTtl() {
    return getApplicationContextMetaTtl(this.model.bestuursorganen);
  }

  checkLegislatuur = task(async () => {
    const mandaat = await this.model.mandataris.bekleedt;
    const bestuursorganen = await mandaat.bevatIn;

    if (!bestuursorganen[0]) {
      this.periodeHasLegislatuur = false;
      this.behandeldeVergaderingen = null;
      return;
    }

    const bestuursperiode = await bestuursorganen[0].heeftBestuursperiode;
    this.periodeHasLegislatuur =
      (await bestuursperiode.installatievergaderingen).length >= 1;

    this.behandeldeVergaderingen = await this.store.query(
      'installatievergadering',
      {
        'filter[status][:uri:]': INSTALLATIEVERGADERING_BEHANDELD_STATUS,
        'filter[bestuursperiode][:id:]': bestuursperiode.id,
      }
    );
  });

  get isDisabledBecauseLegislatuur() {
    if (
      this.periodeHasLegislatuur &&
      this.behandeldeVergaderingen &&
      this.behandeldeVergaderingen.length === 0
    ) {
      return true;
    }

    return false;
  }

  get toolTipText() {
    if (this.isDisabledBecauseLegislatuur) {
      return 'Tijdens het voorbereiden van een legislatuur is het niet mogelijk mandatarissen van die legislatuur te bewerken.';
    }
    if (!this.model.mandataris.isActive) {
      return 'Het is niet mogelijk de status van een mandataris aan te passen die niet actief is';
    }
    return '';
  }
}
