import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import InputFieldComponent from '@lblod/ember-submission-form-fields/components/rdf-input-fields/input-field';
import { triplesForPath } from '@lblod/submission-form-helpers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { NamedNode } from 'rdflib';
import { replaceSingleFormValue } from 'frontend-lmb/utils/replaceSingleFormValue';
import { loadBestuursorgaanUriFromContext } from 'frontend-lmb/utils/form-context/bestuursorgaan-meta-ttl';

export default class MandatarisMandaatSelector extends InputFieldComponent {
  inputId = 'input-' + guidFor(this);

  @service store;

  @tracked mandaat = null;
  @tracked initialized = false;
  @tracked bestuursorganen = [];

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    await Promise.all([this.loadProvidedValue(), this.loadBestuursorganen()]);
    this.initialized = true;
  }

  async loadBestuursorganen() {
    const bestuursorgaanUris = loadBestuursorgaanUriFromContext(
      this.storeOptions
    );

    if (!bestuursorgaanUris) {
      return;
    }

    for (let uri of bestuursorgaanUris) {
      this.bestuursorganen.push(
        (
          await this.store.query('bestuursorgaan', {
            'filter[:uri:]': uri,
          })
        )[0]
      );
    }
  }

  async loadProvidedValue() {
    const mandaatTriples = triplesForPath(this.storeOptions, false).values;
    if (!mandaatTriples.length) {
      return;
    }
    const mandaatUri = mandaatTriples[0].value;

    const matches = await this.store.query('mandaat', {
      'filter[:uri:]': mandaatUri,
    });
    this.mandaat = matches.at(0);
  }

  @action
  async updateMandaat(mandate) {
    const uri = mandate.uri;
    replaceSingleFormValue(this.storeOptions, new NamedNode(uri));
    this.hasBeenFocused = true;
    super.updateValidations();
  }
}
