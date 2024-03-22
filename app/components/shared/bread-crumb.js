import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SharedBreadCrumbComponent extends Component {
  @service router;

  bestuursorganen = [
    {
      route: 'organen.index',
      crumbs: [{ label: 'Bestuursorganen' }],
    },
    {
      route: 'organen.orgaan.index',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        { label: 'Detail' },
      ],
    },
    {
      route: 'organen.orgaan.mandaten',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        { label: 'Mandaten' },
      ],
    },
    {
      route: 'organen.orgaan.mandatarissen',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        { label: 'Mandatarissen' },
      ],
    },
    {
      route: 'organen.orgaan.mandataris.new',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        {
          label: 'Mandatarissen',
          link: 'organen.orgaan.mandatarissen',
        },
        { label: 'Voeg mandaat toe' },
      ],
    },
    {
      route: 'organen.beheer.index',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        { label: 'Beheer bestuursorganen' },
      ],
    },
    {
      route: 'organen.beheer.new',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        { label: 'Beheer bestuursorganen', link: 'organen.beheer' },
        { label: 'Voeg bestuursorgaan toe' },
      ],
    },
    {
      route: 'organen.beheer.edit',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        { label: 'Beheer bestuursorganen', link: 'organen.beheer' },
        { label: 'Bewerk bestuursorgaan' },
      ],
    },
  ];

  mandatarissen = [
    {
      route: 'mandatarissen.search',
      crumbs: [{ label: 'Mandatarissen' }],
    },
    {
      route: 'mandatarissen.persoon',
      crumbs: [
        {
          label: 'Mandatarissen',
          link: 'mandatarissen.search',
        },
        { label: 'Details persoon' },
      ],
    },
    {
      route: 'mandatarissen.mandataris',
      crumbs: [
        {
          label: 'Mandatarissen',
          link: 'mandatarissen.search',
        },
        { label: 'Details mandaat' },
      ],
    },
  ];

  mandatenbeheer = [
    {
      route: 'mandatenbeheer.mandatarissen.index',
      crumbs: [{ label: 'Mandatenbeheer' }],
    },
    {
      route: 'mandatenbeheer.fracties.index',
      crumbs: [
        {
          label: 'Mandatenbeheer',
          link: 'mandatenbeheer.mandatarissen',
        },
        { label: 'Beheer fracties' },
      ],
    },
    {
      route: 'mandatenbeheer.fracties.new',
      crumbs: [
        {
          label: 'Mandatenbeheer',
          link: 'mandatenbeheer.mandatarissen',
        },
        {
          label: 'Fractiebeheer',
          link: 'mandatenbeheer.fracties',
        },
        { label: 'Voeg fractie toe' },
      ],
    },
    {
      route: 'mandatenbeheer.fracties.edit',
      crumbs: [
        {
          label: 'Mandatenbeheer',
          link: 'mandatenbeheer.mandatarissen',
        },
        {
          label: 'Fractiebeheer',
          link: 'mandatenbeheer.fracties',
        },
        { label: 'Bewerk' },
      ],
    },
  ];

  verkiezingen = [
    {
      route: 'verkiezingen',
      crumbs: [{ label: 'Verkiezingen' }],
    },
    {
      route: 'verkiezingsuitslag',
      crumbs: [
        {
          label: 'Verkiezingen',
          link: 'verkiezingen',
        },
        { label: 'Verkiezingsuitslag' },
      ],
    },
  ];

  leidinggevendenbeheer = [
    {
      route: 'leidinggevendenbeheer.index',
      crumbs: [{ label: 'Leidinggevendenbeheer' }],
    },
    {
      route: 'leidinggevendenbeheer.bestuursfunctie.functionarissen.index',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer',
        },
        { label: 'Functionaris' },
      ],
    },
    {
      route: 'leidinggevendenbeheer.bestuursfunctie.functionarissen.edit',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer',
        },
        { label: 'Bewerk functionaris' },
      ],
    },
    {
      route: 'leidinggevendenbeheer.bestuursfunctie.functionarissen.new',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer',
        },
        { label: 'Nieuwe aanstellingsperiode' },
      ],
    },
    {
      route: 'leidinggevendenbeheer.bestuursfunctie.contact-info',
      crumbs: [
        {
          label: 'Leidinggevendenbeheer',
          link: 'leidinggevendenbeheer',
        },
        { label: 'Bewerk contactgegevens' },
      ],
    },
  ];

  legacy = [
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
  bread = this.bestuursorganen.concat(
    this.mandatarissen,
    this.mandatenbeheer,
    this.verkiezingen,
    this.leidinggevendenbeheer,
    this.legacy
  );

  get crumbsForRoute() {
    const results = this.bread.filter(
      (value) => value.route === this.router.currentRouteName
    );
    if (results.length <= 0) {
      return [];
    }
    return results[0].crumbs;
  }
}
