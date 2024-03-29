import { registerFormFields } from '@lblod/ember-submission-form-fields';
import RdfInstanceSelectorComponent from 'frontend-lmb/components/rdf-input-fields/instance-selector';
import RdfInstanceMultiSelectorComponent from 'frontend-lmb/components/rdf-input-fields/instance-multi-selector';
import RDFAddressSelectorComponent from 'frontend-lmb/components/rdf-input-fields/address-selector';
import RDFPersonSelectorComponent from 'frontend-lmb/components/rdf-input-fields/person-selector';
import RDFMandatarisFractieSelectorComponent from 'frontend-lmb/components/rdf-input-fields/mandataris-fractie-selector';
import RDFMandatarisMandaatSelectorComponent from 'frontend-lmb/components/rdf-input-fields/mandataris-mandaat-selector';
import RDFRijksRegisterInput from 'frontend-lmb/components/rdf-input-fields/rijksregister-input';
import RDFGeboorteDatumInput from 'frontend-lmb/components/rdf-input-fields/geboorte-datum-input';
import RDFArchivedInput from 'frontend-lmb/components/rdf-input-fields/archived-input';
import RDFAMandatarisReplacementSelector from 'frontend-lmb/components/rdf-input-fields/mandataris-replacement-selector';

export const registerCustomFormFields = () => {
  registerFormFields([
    {
      displayType: 'http://lblod.data.gift/display-types/instanceSelector',
      edit: RdfInstanceSelectorComponent,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/instanceMultiSelector',
      edit: RdfInstanceMultiSelectorComponent,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/addressSelector',
      edit: RDFAddressSelectorComponent,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/personSelector',
      edit: RDFPersonSelectorComponent,
    },
    {
      displayType:
        'http://lblod.data.gift/display-types/mandatarisFractieSelector',
      edit: RDFMandatarisFractieSelectorComponent,
    },
    {
      displayType:
        'http://lblod.data.gift/display-types/mandatarisMandaatSelector',
      edit: RDFMandatarisMandaatSelectorComponent,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/rijksregisterInput',
      edit: RDFRijksRegisterInput,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/geboorteDatumInput',
      edit: RDFGeboorteDatumInput,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/archivedInput',
      edit: RDFArchivedInput,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/mandatarisReplacement',
      edit: RDFAMandatarisReplacementSelector,
    },
  ]);
};
