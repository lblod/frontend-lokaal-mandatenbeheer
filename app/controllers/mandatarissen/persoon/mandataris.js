import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { syncMandatarisMembership } from 'frontend-lmb/utils/form-business-rules/mandataris-membership';
import { getBestuursorganenMetaTtl } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';
import { task } from 'ember-concurrency';
import { INSTALLATIVERGADERING_BEHANDELD_STATUS } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarissenPersoonMandatarisController extends Controller {
  @service router;
  @service store;

  @tracked isChanging;
  @tracked isCorrecting;
  @tracked inCompletedLegislatuur;

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
  closeModals() {
    this.isChanging = false;
    this.isCorrecting = false;
  }

  @action
  onUpdateState(newMandataris) {
    this.editMode = null;
    if (newMandataris != this.model.mandataris) {
      this.router.transitionTo('mandatarissen.mandataris', newMandataris.id);
    }
    this.closeModals();
  }

  @action
  async onSave({ instanceTtl }) {
    this.editMode = null;
    const store = new ForkingStore();
    store.parse(instanceTtl, SOURCE_GRAPH, 'text/turtle');
    const mandatarisUri = this.model.mandataris.uri;

    await syncMandatarisMembership(mandatarisUri, this.store, {
      store,
      sourceGraph: SOURCE_GRAPH,
    });

    setTimeout(() => this.router.refresh(), 1000);
    this.closeModals();
  }

  @action
  async buildMetaTtl() {
    return getBestuursorganenMetaTtl(this.model.bestuursorganen);
  }

  canEditAndCorrect = task(async () => {
    const mandaat = await this.model.mandataris.bekleedt;
    const bestuursorganen = await mandaat.bevatIn;

    if (!bestuursorganen[0]) {
      this.inCompletedLegislatuur = false;
      return;
    }

    const bestuursperiode = await bestuursorganen[0].heeftBestuursperiode;
    const behandeldeVergaderingen = await this.store.query(
      'installatievergadering',
      {
        'filter[status][:uri:]': INSTALLATIVERGADERING_BEHANDELD_STATUS,
        'filter[bestuursperiode][:id:]': bestuursperiode.id,
      }
    );

    this.inCompletedLegislatuur = behandeldeVergaderingen.length >= 1;
  });
}
