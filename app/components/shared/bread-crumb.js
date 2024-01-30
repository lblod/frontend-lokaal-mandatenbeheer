import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SharedBreadCrumbComponent extends Component {
  @service router;

  bread = [
    {
      route: 'legacy.mandatenbeheer.mandatarissen.index',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        { label: 'Mandatenbeheer' },
      ],
    },
    {
      route: 'legacy.mandatenbeheer.mandatarissen.edit',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Mandatenbeheer',
          link: 'legacy.mandatenbeheer.mandatarissen',
        },
        { label: 'Bewerk' },
      ],
    },
    {
      route: 'legacy.mandatenbeheer.mandatarissen.new',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Mandatenbeheer',
          link: 'legacy.mandatenbeheer.mandatarissen',
        },
        { label: 'Voeg mandaat toe' },
      ],
    },
    {
      route: 'legacy.mandatenbeheer.mandatarissen.new-person',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Mandatenbeheer',
          link: 'legacy.mandatenbeheer.mandatarissen',
        },
        { label: 'Voeg nieuwe persoon toe' },
      ],
    },
    {
      route: 'legacy.mandatenbeheer.fracties.index',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Mandatenbeheer',
          link: 'legacy.mandatenbeheer.mandatarissen',
        },
        { label: 'Beheer fracties' },
      ],
    },
    {
      route: 'legacy.leidinggevendenbeheer.bestuursfuncties.index',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        { label: 'Leidinggevendenbeheer' },
      ],
    },
    {
      route:
        'legacy.leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.index',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Leidinggevendenbeheer',
          link: 'legacy.leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Functionaris' },
      ],
    },
    {
      route:
        'legacy.leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.edit',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Leidinggevendenbeheer',
          link: 'legacy.leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Bewerk functionaris' },
      ],
    },
    {
      route:
        'legacy.leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.new.index',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Leidinggevendenbeheer',
          link: 'legacy.leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Nieuwe aanstellingsperiode' },
      ],
    },
    {
      route:
        'legacy.leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.new.periode',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Leidinggevendenbeheer',
          link: 'legacy.leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Nieuwe aanstellingsperiode' },
      ],
    },
    {
      route:
        'legacy.leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.functionarissen.new-person',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Leidinggevendenbeheer',
          link: 'legacy.leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Voeg nieuwe persoon toe' },
      ],
    },
    {
      route:
        'legacy.leidinggevendenbeheer.bestuursfuncties.bestuursfunctie.contact-info',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        {
          label: 'Leidinggevendenbeheer',
          link: 'legacy.leidinggevendenbeheer.bestuursfuncties',
        },
        { label: 'Bewerk contactgegevens' },
      ],
    },
    {
      route: 'legacy.formbeheer.index',
      crumbs: [{ label: 'Legacy', link: 'legacy' }, { label: 'Formbeheer' }],
    },
    {
      route: 'legacy.formbeheer.form.instances',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        { label: 'Formbeheer', link: 'legacy.formbeheer' },
        { label: 'Form instances' },
      ],
    },
    {
      route: 'legacy.formbeheer.form.new',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        { label: 'Formbeheer', link: 'legacy.formbeheer' },
        { label: 'Form', link: 'legacy.formbeheer.form.instances' },
        { label: 'Nieuwe form instance' },
      ],
    },
    {
      route: 'legacy.formbeheer.form.instance',
      crumbs: [
        { label: 'Legacy', link: 'legacy' },
        { label: 'Formbeheer', link: 'legacy.formbeheer' },
        { label: 'Form', link: 'legacy.formbeheer.form.instances' },
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
