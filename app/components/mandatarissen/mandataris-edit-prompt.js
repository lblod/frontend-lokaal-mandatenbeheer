import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';
import { inject as service } from '@ember/service';
import { queryRecord } from 'frontend-lmb/utils/query-record';
import { MANDATARIS_BEKRACHTIGD_STATE } from 'frontend-lmb/utils/well-known-uris';

const CHANGE_MODE = 'change';
const CORRECT_MODE = 'correct';

export default class MandatenbeheerMandatarisEditPromptComponent extends Component {
  @tracked editMode = null;
  @tracked publicationStatusOptions = [];
  @tracked selectedPublicationStatus;
  @service store;
  @service router;

  get isChanging() {
    return this.editMode === CHANGE_MODE;
  }

  get isCorrecting() {
    return this.editMode === CORRECT_MODE;
  }

  get mandataris() {
    return this.args.mandataris;
  }

  constructor() {
    super(...arguments);

    this.loadPublicationStatusOptions();
  }

  async getBekrachtigdStatus() {
    return await queryRecord(this.store, 'mandataris-publication-status', {
      'filter[:uri:]': MANDATARIS_BEKRACHTIGD_STATE,
    });
  }

  async loadPublicationStatusOptions() {
    const publicationStatus = await this.mandataris.publicationStatus;
    const bekrachtigdStatus = await this.getBekrachtigdStatus();

    if (!publicationStatus || publicationStatus.isBekrachtigd) {
      this.publicationStatusOptions = [bekrachtigdStatus];
      this.selectedPublicationStatus = bekrachtigdStatus;
      return;
    }

    this.publicationStatusOptions = this.args.publicationStatuses;
    this.selectedPublicationStatus = publicationStatus;
  }

  @action
  changeStatus() {
    this.editMode = CHANGE_MODE;
  }

  @action
  correct() {
    this.editMode = CORRECT_MODE;
  }

  @action
  cancel() {
    this.editMode = null;
  }

  @action
  async onSave({ instanceTtl }) {
    this.editMode = null;
    const store = new ForkingStore();
    store.parse(instanceTtl, SOURCE_GRAPH, 'text/turtle');
    const mandatarisUri = this.args.mandataris.uri;

    await syncMandatarisMembership(mandatarisUri, this.store, {
      store,
      sourceGraph: SOURCE_GRAPH,
    });

    this.args.mandataris.modified = new Date();
    await this.args.mandataris.save();

    setTimeout(() => this.router.refresh(), 1000);
  }

  @action
  onUpdateState(newMandataris) {
    this.editMode = null;
    if (
      newMandataris != this.args.mandataris &&
      this.args.onMandatarisChanged
    ) {
      this.args.onMandatarisChanged(newMandataris);
    }
  }

  @action
  async onUpdatePublicationStatus(publicationStatus) {
    this.mandataris.publicationStatus = publicationStatus;
    await this.mandataris.save();
  }

  @action
  async buildMetaTtl() {
    return getBestuursorganenMetaTtl(this.args.bestuursorganen);
  }
}
