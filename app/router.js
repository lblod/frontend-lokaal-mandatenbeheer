import EmberRouter from '@ember/routing/router';
import config from 'frontend-lmb/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('switch-login');
  this.route('mock-login');

  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });

  this.route('contact');

  this.route('legaal', function () {
    this.route('disclaimer');
    this.route('cookieverklaring');
    this.route('toegankelijkheidsverklaring');
  });

  this.route('organen', function () {
    this.route('orgaan', { path: '/:id' }, function () {
      this.route('mandatarissen');
      this.route('edit');
      this.route('mandataris', function () {
        this.route('new');
      });
      this.route('mandaten');
    });
    this.route('fracties');
  });

  this.route('mandaat', function () {
    this.route('edit', { path: '/:id/edit' });
  });

  this.route('mandatarissen', function () {
    this.route('search');
    this.route('persoon', { path: '/:id/persoon' });
    this.route('mandataris', { path: '/:id/mandataris' });
  });

  this.route('verkiezingen', function () {
    this.route('verkiezingsuitslag', { path: '/:id/verkiezingsuitslag' });
    this.route('installatievergadering');
  });

  this.route('leidinggevenden', function () {
    this.route(
      'bestuursfunctie',
      { path: '/:bestuursfunctie_id' },
      function () {
        this.route('contact-info');
        this.route('functionarissen', function () {
          this.route('edit', { path: '/:functionaris_id/edit' });
          this.route('new');
        });
      }
    );
  });

  this.route('forms', function () {
    this.route('form', { path: '/:id' }, function () {
      this.route('new');
      this.route('instances');
      this.route('instance', { path: '/instance/:instance_id' });
      this.route('edit');
    });
  });

  this.route('under-construction');

  this.route('error/404', {
    path: '/*wildcard',
  });
});
