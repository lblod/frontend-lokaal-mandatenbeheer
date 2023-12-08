import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SharedBreadCrumbComponent extends Component {
  @service router;

  bread = [
    {
      route: 'mandatenbeheer.mandatarissen.index',
      crumbs: [{ label: 'Mandatenbeheer' }],
    },
    {
      route: 'mandatenbeheer.mandatarissen.edit',
      crumbs: [
        { label: 'Mandatenbeheer', link: 'mandatenbeheer.mandatarissen' },
        { label: 'Bewerk' },
      ],
    },
    {
      route: 'mandatenbeheer.mandatarissen.new',
      crumbs: [
        { label: 'Mandatenbeheer', link: 'mandatenbeheer.mandatarissen' },
        { label: 'Voeg mandaat toe' },
      ],
    },
    {
      route: 'mandatenbeheer.mandatarissen.new-person',
      crumbs: [
        { label: 'Mandatenbeheer', link: 'mandatenbeheer.mandatarissen' },
        { label: 'Voeg nieuwe persoon toe' },
      ],
    },
    {
      route: 'mandatenbeheer.fracties.index',
      crumbs: [
        { label: 'Mandatenbeheer', link: 'mandatenbeheer.mandatarissen' },
        { label: 'Beheer fracties' },
      ],
    },
  ];

  get crumbsForRoute() {
    const results = this.bread.filter(
      (value) => value.route === this.router.currentRouteName
    );
    if (results.length <= 0) return [];
    return results[0].crumbs;
  }
}
