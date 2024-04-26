import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';
import { inject as service } from '@ember/service';

const CHANGE_MODE = 'change';
const CORRECT_MODE = 'correct';
const BEKRACHTIG_MODE = 'bekrachtig';

export default class MandatenbeheerMandatarisEditPromptComponent extends Component {
  @tracked editMode = null;
  @service store;
  @service router;

  get isChanging() {
    return this.editMode === CHANGE_MODE;
  }

  get isCorrecting() {
    return this.editMode === CORRECT_MODE;
  }

  get isBekrachtiging() {
    return this.editMode === BEKRACHTIG_MODE;
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
  bekrachtig() {
    this.editMode = BEKRACHTIG_MODE;
  }

  @action
  cancel() {
    this.editMode = null;
  }

  @action
  async onSave({ instanceTtl }) {
    this.editMode = null
    const store = new ForkingStore();
    store.parse(instanceTtl, SOURCE_GRAPH, 'text/turtle');
    const mandatarisUri = this.args.mandataris.uri;

    await syncMandatarisMembership(mandatarisUri, this.store, {
      store,
      sourceGraph: SOURCE_GRAPH,
    });

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
  async onBekrachtig() {
    this.editMode = null;
    this.args.mandataris.isDraft = false;
    this.args.mandataris.save();
  }

  @action
  async buildMetaTtl() {
    return getBestuursorganenMetaTtl(this.args.bestuursorganen);
  }
}
