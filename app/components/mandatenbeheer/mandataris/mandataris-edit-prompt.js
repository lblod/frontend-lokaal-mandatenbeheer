import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { getBestuursorgaanMetaTtl } from '../../../utils/bestuursorgaan-meta-ttl';
import { SOURCE_GRAPH } from '../../../utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';
import { inject as service } from '@ember/service';

const TERMINATE_MODE = 'terminate';
const CORRECT_MODE = 'correct';

export default class MandatenbeheerMandatarisEditPromptComponent extends Component {
  @tracked editMode = null;
  @service store;

  get isTerminating() {
    return this.editMode === TERMINATE_MODE;
  }

  get isCorrecting() {
    return this.editMode === CORRECT_MODE;
  }

  @action
  terminate() {
    this.editMode = TERMINATE_MODE;
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

    setTimeout(() => this.args.mandataris.reload(), 1000);
  }

  @action
  buildMetaTtl() {
    return getBestuursorgaanMetaTtl(this.args.bestuursorgaan);
  }
}
