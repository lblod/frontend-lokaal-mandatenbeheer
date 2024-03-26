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
    {
      route: 'organen.fracties.index',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        { label: 'Beheer fracties' },
      ],
    },
    {
      route: 'organen.fracties.new',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        {
          label: 'Fractiebeheer',
          link: 'organen.fracties',
        },
        { label: 'Voeg fractie toe' },
      ],
    },
    {
      route: 'organen.fracties.edit',
      crumbs: [
        {
          label: 'Bestuursorganen',
          link: 'organen',
        },
        {
          label: 'Fractiebeheer',
          link: 'organen.fracties',
        },
        { label: 'Bewerk' },
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

  verkiezingen = [
    {
      route: 'verkiezingen.index',
      crumbs: [{ label: 'Verkiezingen' }],
    },
    {
      route: 'verkiezingen.verkiezingsuitslag',
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

  formbeheer = [
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
  bread = this.bestuursorganen.concat(
    this.mandatarissen,
    this.verkiezingen,
    this.leidinggevendenbeheer,
    this.formbeheer
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
