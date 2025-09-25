import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { MANDATARIS_VERHINDERD_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarissenPersoonMandatarisReworkController extends Controller {
  @service currentSession;
  @service router;

  @tracked isDeleteModalOpen;
  @tracked isEditModalOpen;
  @tracked mandatarisFormValues;
  @tracked newMandataris = null;
  @tracked isRangordeModalOpen = false;

  get bestuursorganenTitle() {
    return this.model.bestuursorganen.map((elem) => {
      return {
        id: elem.isTijdsspecialisatieVan.id,
        label: elem.isTijdsspecialisatieVan.get('naam'),
      };
    });
  }

  get persoon() {
    return this.model.mandataris.isBestuurlijkeAliasVan;
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

  get notOwnedByUs() {
    return (
      this.model.owners &&
      !this.model.owners.find(
        (eenheid) => eenheid.id == this.currentSession.group?.id
      )
    );
  }

  get canDeleteMandataris() {
    return (
      this.currentSession.isAdmin || this.model.mandataris.isApprovedForDeletion
    );
  }

  @action
  async openWizard() {
    this.mandatarisFormValues = {
      rangorde: this.model.mandataris.rangorde,
      start: this.model.mandataris.start,
      einde: this.model.mandataris.einde,
      bekleedt: this.model.mandataris.bekleedt,
      isBestuurlijkeAliasVan: this.model.mandataris.isBestuurlijkeAliasVan,
      fractie:
        await this.model.mandataris.heeftLidmaatschap.get('binnenFractie'),
      status: this.model.mandataris.status,
      tijdelijkeVervangingen:
        (await this.model.mandataris.tijdelijkeVervangingen) || [],
      vervangerVan: (await this.model.mandataris.vervangerVan) || [],
      beleidsdomein: (await this.model.mandataris.beleidsdomein) || [],
      contactPoints: (await this.model.mandataris.contactPoints) || [],
    };
    this.isEditModalOpen = true;
  }

  @action
  closeWizard() {
    this.mandatarisFormValues = null;
    this.isEditModalOpen = false;
  }

  @action async checkIfShouldOpenRangordeModal(
    originalMandataris,
    newMandataris
  ) {
    this.newMandataris = newMandataris;
    const mandaat = await newMandataris.bekleedt;
    if (
      mandaat.hasRangorde &&
      (await newMandataris.status).uri === MANDATARIS_VERHINDERD_STATE &&
      (await originalMandataris.status).uri !== MANDATARIS_VERHINDERD_STATE
    ) {
      this.isRangordeModalOpen = true;
    } else {
      this.navigateToNewMandataris();
    }
  }

  @action
  navigateToNewMandataris() {
    const newMandataris = this.newMandataris;
    this.newMandataris = null;
    this.isRangordeModalOpen = false;
    this.router.transitionTo('mandatarissen.mandataris', newMandataris.id);
  }
}
