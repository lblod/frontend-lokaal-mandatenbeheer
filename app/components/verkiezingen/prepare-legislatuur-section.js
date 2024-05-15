import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';
import { syncNewMandatarisMembership } from 'frontend-lmb/utils/sync-new-mandataris-membership';
import {
  BURGEMEESTER_BESTUURSORGAAN_URI,
  RMW_BESTUURSORGAAN_URI,
  VB_BESTUURSORGAAN_URI,
} from 'frontend-lmb/utils/well-known-uris';

const CREATE_MODE = 'create';

export default class PrepareLegislatuurSectionComponent extends Component {
  @service toaster;
  @service store;
  @service router;

  @tracked editMode = null;

  @action
  createMandataris() {
    this.editMode = CREATE_MODE;
  }

  get isCreating() {
    return this.editMode === CREATE_MODE;
  }

  get isBurgemeester() {
    return this.args.bestuursorgaan.hasBestuursorgaanClassificatie(
      BURGEMEESTER_BESTUURSORGAAN_URI
    );
  }

  get isRMW() {
    return this.args.bestuursorgaan.hasBestuursorgaanClassificatie(
      RMW_BESTUURSORGAAN_URI
    );
  }
  get isLidVanVB() {
    return this.args.bestuursorgaan.hasBestuursorgaanClassificatie(
      VB_BESTUURSORGAAN_URI
    );
  }

  @action
  cancel() {
    this.editMode = null;
  }

  @action
  async onCreate({ instanceTtl, instanceId }) {
    this.editMode = null;
    await syncNewMandatarisMembership(this.store, instanceTtl, instanceId);
    setTimeout(() => this.router.refresh(), 1000);
  }

  @action
  async buildSourceTtl(instanceUri) {
    return await buildNewMandatarisSourceTtl(this.store, instanceUri);
  }

  @action
  buildMetaTtl() {
    return getBestuursorganenMetaTtl([this.args.bestuursorgaan]);
  }
}
