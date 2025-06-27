import Component from '@glimmer/component';

const fieldsToDiff = [
  { label: 'Status', path: 'status.label' },
  { label: 'Fractie', path: 'heeftLidmaatschap.binnenFractie.naam' },
  { label: 'Rangorde', path: 'rangorde' },
];

export default class MandatarissenTimelineDiff extends Component {
  get diffs() {
    if (!this.args.event.previousMandataris) {
      return [];
    }
    return fieldsToDiff
      .map((field) => {
        const old = this.args.event.previousMandataris.get(field.path);
        const current = this.args.event.mandataris.get(field.path);
        if (old != current) {
          return {
            field: field.label,
            old,
            current,
          };
        }
      })
      .filter((diff) => !!diff);
  }
}
