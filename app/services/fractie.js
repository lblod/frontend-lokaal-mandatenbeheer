import Service from '@ember/service';

import { service } from '@ember/service';

export default class FractieService extends Service {
  @service store;

  async isMandatarisFractieOnafhankelijk(mandataris) {
    const lid = await mandataris.heeftLidmaatschap;
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
