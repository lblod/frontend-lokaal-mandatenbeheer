import Model, { attr, hasMany } from '@ember-data/model';
import {
  KANDIDATENLIJST_DISTRICTSRAAD,
  KANDIDATENLIJST_GEMEENTERAAD,
  KANDIDATENLIJST_KAMER_VOLKSVERTEGENWOORDIGING,
  KANDIDATENLIJST_OCMW,
  KANDIDATENLIJST_PROVINCIERAAD,
  KANDIDATENLIJST_SENAAT,
  KANDIDATENLIJST_VLAAMS_PARLEMENT,
} from 'frontend-lmb/utils/well-known-uris';

export default class RechtstreekseVerkiezingModel extends Model {
  @attr('date') datum;
  @attr('date') geldigheid;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: 'verkiezing',
  })
  bestuursorganenInTijd;

  @hasMany('kandidatenlijst', {
    async: true,
    inverse: 'verkiezing',
  })
  kandidatenlijsten;

  get getType() {
    return this.asyncGetType();
  }

  async asyncGetType() {
    const type = (await this.kandidatenlijsten).slice().at(0).get('lijsttype');
    return typeMapping[type.get('uri')];
  }
}

const typeMapping = {
  [KANDIDATENLIJST_GEMEENTERAAD]: 'Gemeenteraad',
  [KANDIDATENLIJST_OCMW]: 'OCMW',
  [KANDIDATENLIJST_DISTRICTSRAAD]: 'Districtsraad',
  [KANDIDATENLIJST_PROVINCIERAAD]: 'Provincieraad',
  [KANDIDATENLIJST_VLAAMS_PARLEMENT]: 'Vlaams Parlement',
  [KANDIDATENLIJST_SENAAT]: 'Senaat',
  [KANDIDATENLIJST_KAMER_VOLKSVERTEGENWOORDIGING]:
    'Kamer van volksvertegenwoordiging',
};
