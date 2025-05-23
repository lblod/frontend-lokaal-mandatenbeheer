import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenPersoonMandatarisReworkController extends Controller {
  @service currentSession;

  @tracked isDeleteModalOpen;
  @tracked isEditModalOpen;
  @tracked mandatarisFormValues;

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
}
