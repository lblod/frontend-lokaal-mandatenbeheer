import { plural, singular, irregular } from '@ember-data/request-utils/string';

plural(/$/, 'en');
plural(/e$/, 'es');
plural(/e([lnr])$/, 'e$1s');
plural(/([aiuo])$/, '$1s');
plural(/([^aiuoe])([aiuo])([a-z])$/, '$1$2$3$3en'); // TODO: this is a bit hack
plural(/uis$/, 'uizen');
plural(/ief$/, 'ieven');
plural(/or$/, 'oren');
plural(/ie$/, 'ies');
plural(/eid$/, 'eden');
plural(/aa([a-z])$/, 'a$1en');
plural(/uu([a-z])$/, 'u$1en');
plural(/oo([a-z])$/, 'o$1en');
singular(/en$/, '');
singular(/es$/, 'e');
singular(/e([lnr])s$/, 'e$1');
singular(/([aiuo])s$/, '$1');
singular(/([^aiuoe])([aiuo])([a-z])\3en$/, '$1$2$3'); // TODO: this is a bit hack
singular(/uizen$/, 'uis');
singular(/ieven$/, 'ief');
singular(/ies$/, 'ie');
singular(/eden$/, 'eid');
singular(/a([a-z])en$/, 'aa$1');
singular(/u([a-z])en$/, 'uu$1');
singular(/o([a-z])en$/, 'oo$1');
singular(/([auio])s$/, '$1s');
irregular('behandeling-van-agendapunt', 'behandelingen-van-agendapunten');
irregular('rechtsgrond-artikel', 'rechtsgronden-artikel');
irregular('rechtsgrond-besluit', 'rechtsgronden-besluit');
irregular('editor-document', 'editor-documents');
irregular('editor-document-status', 'editor-document-statuses');
irregular('export', 'exports');
irregular('account', 'accounts');
irregular('identificator', 'identificatoren');
irregular('file', 'files');
irregular('document-status', 'document-statuses');
irregular('validation', 'validations');
irregular('validation-execution', 'validation-executions');
irregular('validation-error', 'validation-errors');
irregular('inzending-voor-toezicht', 'inzendingen-voor-toezicht');
irregular(
  'toezicht-account-acceptance-status',
  'toezicht-account-acceptance-statuses'
);
irregular('toezicht-fiscal-period', 'toezicht-fiscal-periods');
irregular('form-solution', 'form-solutions');
irregular('dynamic-subform', 'dynamic-subforms');
irregular('form-input', 'form-inputs');
irregular(
  'inzending-voor-toezicht-form-version',
  'inzending-voor-toezicht-form-versions'
);
irregular('adres', 'adressen');
irregular('submission', 'submissions');
irregular('concept', 'concepts');
irregular('time-block', 'time-blocks');
irregular('application-form-entry', 'application-form-entries');

irregular('nationality', 'nationalities');

irregular('system-notification', 'system-notifications');
irregular('global-system-message', 'global-system-messages');

irregular('werkingsgebied', 'werkingsgebieden');

irregular('bestuurseenheid-contact', 'bestuurseenheid-contacten');
irregular('library-entry', 'library-entries');
