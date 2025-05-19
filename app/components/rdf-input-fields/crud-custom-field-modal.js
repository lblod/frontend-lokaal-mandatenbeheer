import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { consume } from 'ember-provide-consume-context';

import { JSON_API_TYPE, SOURCE_GRAPH } from 'frontend-lmb/utils/constants';
import { FIELD_OPTION, FORM, EXT, PROV } from 'frontend-lmb/rdf/namespaces';
import { showErrorToast } from 'frontend-lmb/utils/toasts';
import {
  LIBRARY_ENTREES,
  LINK_TO_FORM_CUSTOM_DISPLAY_TYPE,
  TEXT_CUSTOM_DISPLAY_TYPE,
} from 'frontend-lmb/utils/well-known-uris';
import { Literal, NamedNode } from 'rdflib';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

export default class RdfInputFieldCrudCustomFieldModalComponent extends Component {
  @consume('form-context') formContext;
  @use(getLibraryFieldOptions) getLibraryFieldOptions;

  @service store;
  @service toaster;
  @service formReplacements;
  @service customForms;

  @tracked isRemovingField;
  @tracked isFieldRequired;
  @tracked isShownInSummary;
  @tracked wantsToRemove;

  customFieldEntry = this.store.createRecord('library-entry', {
    name: 'Eigen veld',
  });

  @tracked displayTypes = [];

  @tracked fieldName;
  @tracked libraryFieldType = this.customFieldEntry;
  @tracked displayType;
  @tracked conceptScheme;
  @tracked conceptSchemeOnLoad;
  @tracked linkedFormTypeUri;

  constructor() {
    super(...arguments);

    let withValue = TEXT_CUSTOM_DISPLAY_TYPE;
    if (!this.args.isCreating) {
      const { label, displayType } = this.args.field;

      this.fieldName = label;
      withValue = displayType;
      this.getConceptSchemeFromTtl().then((cs) => {
        this.conceptScheme = cs;
        this.conceptSchemeOnLoad = cs;
      });
    }
    this.isFieldRequired = this.args.isRequiredField ?? false;
    this.isShownInSummary = this.originalIsShownInSummary;
    this.store
      .query('display-type', {
        sort: 'label',
      })
      .then((displayTypes) => {
        if (this.args.isForFormExtension) {
          const allowedTypes = displayTypes.filter(
            (type) => type.uri !== LINK_TO_FORM_CUSTOM_DISPLAY_TYPE
          );
          this.displayTypes = allowedTypes;
        } else {
          this.displayTypes = displayTypes;
        }
        this.displayType = this.displayTypes.find((t) => t.uri === withValue);
      });
  }

  async getConceptSchemeFromTtl() {
    const store = new ForkingStore();
    store.parse(
      this.formContext.formDefinition?.formTtl,
      SOURCE_GRAPH,
      'text/turtle'
    );
    const conceptSchemeNode = store.any(
      new NamedNode(this.args.field.uri.value),
      FIELD_OPTION('conceptScheme'),
      undefined,
      SOURCE_GRAPH
    );

    const conceptSchemeUri = conceptSchemeNode?.value || null;
    if (!conceptSchemeUri) {
      return null;
    }

    const models = await this.store.query('concept-scheme', {
      'filter[:uri:]': conceptSchemeUri,
      page: { size: 1 },
    });

    return models.at(0) ?? null;
  }

  get isShowInSummaryToggleDisabled() {
    return this.args.show || this.displayType?.isLinkToForm;
  }

  get deleteWillLoseData() {
    return this.libraryFieldType?.uri !== null;
  }

  @action
  updateFieldName(event) {
    this.fieldName = event.target?.value;
  }

  @action
  updateLinkedFormTypeUri(uri) {
    this.linkedFormTypeUri = uri;
  }

  @action
  toggleIsRequired() {
    this.isFieldRequired = !this.isFieldRequired;
  }

  @action
  toggleShowInSummary() {
    this.isShownInSummary = !this.isShownInSummary;
  }

  updateField = task(async () => {
    await this.customForms.updateCustomFormField(
      this.formContext.formDefinition.id,
      this.args.field.uri.value,
      {
        label: this.fieldName,
        displayTypeUri: this.displayType.uri,
        conceptSchemeUri: this.conceptScheme?.uri,
        isRequired: this.isFieldRequired,
        isShownInSummary: this.isShownInSummary,
      }
    );
    this.formContext.onFormUpdate();
  });

  createField = task(async () => {
    try {
      const result = await fetch(
        `/form-content/${this.formContext.formDefinition.id}/fields`,
        {
          method: 'POST',
          headers: {
            'Content-Type': JSON_API_TYPE,
          },
          body: JSON.stringify({
            displayType: this.displayType.uri,
            libraryEntryUri: this.libraryFieldType.uri,
            name: this.fieldName,
            isRequired: !!this.isFieldRequired,
            showInSummary: !!this.isShownInSummary,
            conceptScheme: this.conceptScheme?.uri,
            linkedFormTypeUri: this.linkedFormTypeUri,
          }),
        }
      );

      const body = await result.json();
      const newFormId = body.id;
      this.formReplacements.setReplacement(
        this.formContext.formDefinition.id,
        newFormId
      );
      this.formContext.onFormUpdate();
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het opslaan van het veld.'
      );
      return;
    }
  });

  @action
  selectLibraryFieldType(libraryEntry) {
    this.libraryFieldType = libraryEntry;
    this.displayType =
      this.displayTypes.find(
        (t) => t?.uri === libraryEntry.get('displayType.uri')
      ) || this.displayTypes.find((t) => t?.uri === TEXT_CUSTOM_DISPLAY_TYPE);
  }

  @action
  selectDisplayType(displayType) {
    this.displayType = displayType;
  }

  @action
  selectConceptScheme(conceptScheme) {
    this.conceptScheme = conceptScheme;
  }

  @action
  onCancel() {
    if (this.wantsToRemove) {
      this.wantsToRemove = false;
      return;
    }
    this.closeModal();
  }

  @action
  async onRemove() {
    if (!this.wantsToRemove) {
      this.wantsToRemove = true;
      return;
    }
    this.isRemovingField = true;
    await this.customForms.removeFormField(
      this.args.field.uri.value,
      this.args.form.uri
    );
    this.formContext.onFormUpdate();
    this.isRemovingField = false;
  }

  @action
  closeModal() {
    this.args.onCloseModal();
  }

  get conceptSchemes() {
    return this.store
      .query('concept-scheme', {
        page: { size: 9999 }, // Not ideal
      })
      .then((entries) => {
        return [...entries].sort((a, b) =>
          a.displayLabel.localeCompare(b.displayLabel)
        );
      });
  }

  get libraryEntryUri() {
    if (!this.args.field) {
      return null;
    }

    const localStore = new ForkingStore();
    localStore.parse(
      this.formContext.formDefinition.formTtl,
      SOURCE_GRAPH,
      'text/turtle'
    );
    const libraryEntree = localStore.any(
      this.args.field.uri,
      PROV('wasDerivedFrom'),
      null,
      SOURCE_GRAPH
    );

    return libraryEntree?.value;
  }

  get forkingStore() {
    const forkingStore = new ForkingStore();
    forkingStore.parse(
      this.formContext.formDefinition.formTtl,
      SOURCE_GRAPH,
      'text/turtle'
    );
    return forkingStore;
  }

  get isCustomForm() {
    const forkingStore = this.forkingStore;
    return (
      forkingStore.any(
        null,
        EXT('isCustomForm'),
        new Literal(
          'true',
          null,
          new NamedNode('http://www.w3.org/2001/XMLSchema#boolean')
        )
      ) && !forkingStore.any(null, EXT('extendsForm'), null, SOURCE_GRAPH)
    );
  }

  get libraryFieldOptions() {
    return this.getLibraryFieldOptions?.value || [];
  }

  get originalIsShownInSummary() {
    const forkingStore = this.forkingStore;
    if (!this.args.field?.uri) {
      return false;
    }
    return !!forkingStore.any(
      this.args.field.uri,
      FORM('showInSummary'),
      null,
      SOURCE_GRAPH
    );
  }

  get canSaveChanges() {
    if (this.args.isCreating) {
      return (
        this.hasValidFieldName &&
        this.libraryFieldType &&
        this.hasConceptSchemeSelected &&
        this.hasLinkToFormSelected
      );
    }

    return this.fieldHasChanged;
  }

  get hasConceptSchemeSelected() {
    if (!this.displayType?.isConceptSchemeSelector) {
      return true;
    }

    return this.conceptScheme;
  }

  get hasLinkToFormSelected() {
    if (!this.displayType?.isLinkToForm) {
      return true;
    }

    return this.linkedFormTypeUri;
  }

  get fieldHasChanged() {
    return (
      (this.hasValidFieldName && this.fieldName !== this.args.field.label) ||
      this.displayType.uri !== this.args.field.displayType ||
      this.isFieldRequired != this.args.isRequiredField ||
      this.isShownInSummary != this.args.isShownInSummary ||
      this.conceptSchemeOnLoad?.id !== this.conceptScheme?.id
    );
  }

  get hasValidFieldName() {
    return this.fieldName && this.fieldName.trim().length > 1;
  }

  get canSelectTypeForEntry() {
    if (this.args.isCreating) {
      return this.libraryFieldType === this.customFieldEntry;
    }

    return !LIBRARY_ENTREES.includes(this.libraryEntryUri);
  }

  get saveTooltipText() {
    if (this.args.isCreating) {
      return 'Vul eerst al de velden in';
    }

    return 'Geen aanpassingen gevonden';
  }

  get title() {
    if (this.args.isCreating) {
      return 'Voeg een veld toe';
    }

    return 'Pas een veld aan';
  }
}

function getLibraryFieldOptions() {
  return trackedFunction(async () => {
    const allOptions = await this.store.query('library-entry', {
      sort: 'name',
      include: 'display-type',
    });
    const usedOptions = this.forkingStore
      .match(null, PROV('wasDerivedFrom'), null, SOURCE_GRAPH)
      .map((triple) => triple.object.value);
    const unused = allOptions.filter((entry) => {
      return entry.uri && usedOptions.indexOf(entry.uri) < 0;
    });
    return [this.customFieldEntry, ...unused];
  });
}
