import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SharedBreadCrumbComponent extends Component {
  @service router;

  verkiezingen = [
    {
      route: 'verkiezingen.index',
      crumbs: [{ label: 'Verkiezingen' }],
    },
    {
      route: 'verkiezingen.verkiezingsuitslag.index',
      crumbs: [
        {
          label: 'Verkiezingen',
          link: 'verkiezingen',
        },
        { label: 'Verkiezingsuitslag' },
      ],
    },
    {
      route: 'verkiezingen.verkiezingsuitslag.prepare',
      crumbs: [
        {
          label: 'Verkiezingen',
          link: 'verkiezingen',
        },
        {
          label: 'Verkiezingsuitslag',
          link: 'verkiezingen.verkiezingsuitslag',
        },
        { label: 'Voorbereiding legislatuur' },
      ],
    },
  ];

  bread = this.verkiezingen;

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
