import Component from '@glimmer/component';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

const fieldsToDiff = [
  { label: 'Status', path: 'status.label' },
  { label: 'Fractie', path: 'heeftLidmaatschap.binnenFractie.naam' },
  { label: 'Rangorde', path: 'rangorde' },
  {
    label: 'beleidsdomeinen',
    path: 'beleidsdomein',
    valueFormatter: (codes) => codes.map((code) => code.label).join(', '),
  },
];

function getDifferences() {
  return trackedFunction(async () => {
    if (!this.args.event.previousMandataris) {
      return [];
    }
    const diffs = await Promise.all(
      fieldsToDiff.map(async (field) => {
        let formatter = (displayValue) => displayValue;
        if (field.valueFormatter) {
          formatter = field.valueFormatter;
        }
        const old = formatter(
          await this.args.event.previousMandataris.get(field.path)
        );
        const current = formatter(
          await this.args.event.mandataris.get(field.path)
        );
        if (old != current) {
          return {
            field: field.label,
            old,
            current,
          };
        }
      })
    );

    return diffs.filter((diff) => !!diff);
  });
}
export default class MandatarissenTimelineDiff extends Component {
  @use(getDifferences) getDifferences;

  get diffs() {
    return this.getDifferences?.value || [];
  }
}
