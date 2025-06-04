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
  this.route('impersonate');

  this.route('auth', { path: '/authorization' }, function () {
    this.route('callback');
    this.route('login');
    this.route('logout');
    this.route('switch');
  });

  this.route('contact');
  this.route('settings');
  this.route('system-notifications');

  this.route('legaal', function () {
    this.route('disclaimer');
    this.route('cookieverklaring');
    this.route('toegankelijkheidsverklaring');
  });

  this.route('organen', function () {
    this.route('orgaan', { path: '/:id' }, function () {
      this.route('mandatarissen');
      this.route('bulk-bekrachtiging');
      this.route('edit-rangorde');
      this.route('mandataris', function () {
        this.route('new');
      });
    });
    this.route('fracties');
  });

  this.route('mandatarissen', function () {
    this.route('search');
    this.route('mandataris', { path: '/:mandataris_id/mandataris' });
    this.route('persoon', { path: '/:id/persoon' }, function () {
      this.route('mandaten');
      this.route('mandataris', { path: '/:mandataris_id/mandataris' });
    });
    this.route('upload');
  });

  this.route('verkiezingen', function () {
    this.route('verkiezingsuitslag', { path: '/:id/verkiezingsuitslag' });
    this.route('installatievergadering');
  });

  this.route('codelijsten', function () {
    this.route('overzicht');
    this.route('new');
    this.route('detail', { path: '/:id/detail' });
  });

  this.route('custom-forms', { path: '/eigen-gegevens' }, function () {
    this.route('index', { path: '/' });
    this.route('new');
    this.route('instances', { path: '/:id/instances' }, function () {
      this.route('index', { path: '/' });
      this.route('instance', { path: '/:instance_id' });
      this.route('new');
      this.route('definition', { path: '/bewerk-formulier-definitie' });
    });
  });

  this.route('under-construction');
  this.route('lokaal-beheerd');

  this.route('admin-panel', function () {
    this.route('global-system-message');
  });

  this.route('session-expired');
  this.route('report');

  this.route('error/404', {
    path: '/*wildcard',
  });
});
