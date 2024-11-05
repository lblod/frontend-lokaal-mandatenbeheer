import Component from '@glimmer/component';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { orderMandatarissenByRangorde } from 'frontend-lmb/utils/rangorde';

export default class DraftMandatarisListComponent extends Component {
  @service toaster;
  @service store;
  @service fractieApi;
  @service installatievergadering;

  @tracked isEditing;
  @tracked isEditFormInitialized;
  @tracked mandatarisEdit;

  constructor() {
    super(...arguments);
  }

  get mandatarissen() {
    return this.args.mandatarissen;
  }

  get mandatarisPersonCount() {
    return new Set(
      this.args.mandatarissen.map((item) => item.isBestuurlijkeAliasVan?.id)
    ).size;
  }

  get resortedMandatarissen() {
    return orderMandatarissenByRangorde(
      [...this.mandatarissen],
      this.installatievergadering.sortedMandatarissen
    );
  }

  @action
  async removeMandataris(mandataris) {
    this.args.updateMandatarissen({ removed: [mandataris] });
    mandataris
      .destroyRecord()
      .then(() => {
        const succesMessage = 'Mandataris succesvol verwijderd.';
        this.toaster.success(succesMessage, 'Succes', { timeOut: 5000 });
        this.installatievergadering.forceRecomputeBCSD();
      })
      .catch(() => {
        const errorMessage =
          'Er ging iets mis bij het verwijderen van de mandataris. Probeer het later opnieuw.';
        this.toaster.error(errorMessage, 'Error');
      });
  }

  @action
  async openEditMandataris(mandataris) {
    this.isEditing = true;
    this.mandatarisEdit = mandataris;
  }

  @action
  async closeEditMandataris() {
    this.isEditing = false;
    this.mandatarisEdit = null;
  }

  @action
  async saveMandatarisChanges({ instanceId }) {
    await this.fractieApi.updateCurrentFractie(instanceId);
    this.isEditFormInitialized = false;
    const updatedMandataris = await this.store.findRecord(
      'mandataris',
      instanceId
    );
    this.args.updateMandatarissen({ updated: updatedMandataris });
    this.closeEditMandataris();
    this.installatievergadering.forceRecomputeBCSD();
  }
}
