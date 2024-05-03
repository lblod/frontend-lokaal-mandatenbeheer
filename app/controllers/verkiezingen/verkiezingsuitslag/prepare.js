import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { buildNewMandatarisSourceTtl } from 'frontend-lmb/utils/build-new-mandataris-source-ttl';
import { syncNewMandatarisMembership } from 'frontend-lmb/utils/sync-new-mandataris-membership';

const CREATE_MODE = 'create';

export default class PrepareInstallatievergaderingController extends Controller {
  @service store;
  @service router;

  @tracked editMode = null;
  @tracked person = null;

  @action
  createMandataris() {
    this.editMode = CREATE_MODE;
  }

  get isCreating() {
    return this.editMode === CREATE_MODE;
  }

  @action
  cancel() {
    this.person = null;
    this.editMode = null;
  }

  @action
  async onCreate({ instanceTtl, instanceId }) {
    this.editMode = null;
    await syncNewMandatarisMembership(this.store, instanceTtl, instanceId);
    // TODO not sure why the timeout is needed
    setTimeout(() => this.router.refresh(), 1000);
  }

  @action
  async buildSourceTtl(instanceUri) {
    return await buildNewMandatarisSourceTtl(
      this.store,
      instanceUri,
      this.person
    );
  }

  @action
  buildMetaTtl() {
    return getBestuursorganenMetaTtl([this.model.bestuursorgaanInTijd]);
  }

  @action
  async selectStatus(status) {
    const installatievergadering = this.model.installatievergadering;
    installatievergadering.status = status;
    await installatievergadering.save();
  }
}
