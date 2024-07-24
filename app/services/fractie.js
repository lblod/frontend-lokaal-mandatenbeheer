import Service from '@ember/service';

import { service } from '@ember/service';
import { fold } from 'frontend-lmb/utils/fold-mandatarisses';

export default class FractieService extends Service {
  @service store;

  async isMandatarisFractieOnafhankelijk(mandataris) {
    // assuming that there always be a folded mandataris for the mandataris
    const foldedMandataris = (await fold([mandataris])).at(0);
    const lid = await foldedMandataris.mandataris.heeftLidmaatschap;
    if (!lid) {
      return true;
    }

    const fractie = await lid.binnenFractie;
    if (fractie) {
      const type = await fractie.fractietype;
      return type ? type.isOnafhankelijk : false;
    }

    return false;
  }
}
