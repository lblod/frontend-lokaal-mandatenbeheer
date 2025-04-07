import Controller from '@ember/controller';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenPersoonMandatarisReworkController extends Controller {
  @service currentSession;

  @tracked selectedReplacement = false;
  @tracked isDeleteModalOpen;
  @tracked isEditModalOpen;

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
}
