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
    {
      route: 'leidinggevendenbeheer.bestuursfuncties.index',
      crumbs: [{ label: 'Leidinggevendenbeheer' }],
    },
    {
      route:
        'leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.index',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Functionaris' },
      ],
    },
    {
      route:
        'leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.edit',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Bewerk functionaris' },
      ],
    },
    {
      route:
        'leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.new.index',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Nieuwe aanstellingsperiode' },
      ],
    },
    {
      route:
        'leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.new.periode',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Nieuwe aanstellingsperiode' },
      ],
    },
    {
      route:
        'leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.new-person',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Voeg nieuwe persoon toe' },
      ],
    },
    {
      route:
        'leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.contact-info',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Bewerk contactgegevens' },
      ],
    },
    {
      route: 'formbeheer.index',
      crumbs: [{ label: 'Formbeheer' }],
    },
    {
      route: 'formbeheer.form.instances',
      crumbs: [
        { label: 'Formbeheer', link: 'formbeheer' },
        { label: 'Form instances' },
      ],
    },
    {
      route: 'formbeheer.form.new',
      crumbs: [
        { label: 'Formbeheer', link: 'formbeheer' },
        { label: 'Form', link: 'formbeheer.form.instances' },
        { label: 'Nieuwe form instance' },
      ],
    },
    {
      route: 'formbeheer.form.instance',
      crumbs: [
        { label: 'Formbeheer', link: 'formbeheer' },
        { label: 'Form', link: 'formbeheer.form.instances' },
        { label: 'Bewerk form instance' },
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
