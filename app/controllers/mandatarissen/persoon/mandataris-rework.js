import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { getApplicationContextMetaTtl } from 'frontend-lmb/utils/form-context/application-context-meta-ttl';

export default class MandatarissenPersoonMandatarisReworkController extends Controller {
  @service router;
  @service store;
  @service fractieApi;
  @service currentSession;
  @service('mandataris') mandatarisService;

  @tracked isChanging;
  @tracked isCorrecting;

  @tracked correctedMandataris = false;
  @tracked updatedStateMandataris = false;
  @tracked selectedReplacement = false;
  @tracked newMandataris;

  @tracked formInitialized;

  @tracked isDeleteModalOpen;

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

  get isDisabledBecauseLegislatuur() {
    return (
      this.model.periodeHasLegislatuur &&
      this.model.behandeldeVergaderingen &&
      this.model.behandeldeVergaderingen.length === 0 &&
      !this.model.isDistrictEenheid
    );
  }

  get toolTipText() {
    return 'Tijdens het voorbereiden van een legislatuur is het niet mogelijk een mandaat in die legislatuur te bewerken.';
  }

  get warningTextOCMWLinkToGemeente() {
    return `Let op! Deze mandataris heeft een gelinkte mandataris in de gemeente.
      Bij het aanpassen van deze gegevens wordt deze koppeling verbroken.
      Het doorstromen van gegevens van de gemeente naar OCMW zal
      hierdoor ook niet meer gebeuren. Om een wijziging aan beide mandaten te
      maken, gelieve dit te doen in de gemeente.`;
  }

  get notOwnedByUs() {
    return (
      this.model.owners &&
      !this.model.owners.find(
        (eenheid) => eenheid.id == this.currentSession.group?.id
      )
    );
  }
}
