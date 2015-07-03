import Ember from 'ember';
import DS from 'ember-data';
import FixtureAdapter from '../../adapters/application';
import Application from '../../app';
import Router from '../../router';
import config from '../../config/environment';

export default function startApp(attrs) {
  var application;

  var attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  var TestFixtureAdapter = FixtureAdapter.extend({
    shouldReloadAll: function(store, snapshotRecordArray) {
      return true;
    }
  });

  Ember.run(function() {
    application = Application.create(attributes);
    application.register('adapter:application', TestFixtureAdapter);
    application.setupForTesting();
    application.injectTestHelpers();
  });

  return application;
}
