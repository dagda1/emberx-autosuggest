import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from '../helpers/start-app';

var application;

module('XAutosuggest - Choose and Select from simple array', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('x-autosuggest DOM elements are setup', function(assert) {
  visit('/core');

  assert.expect(4);

  andThen(function() {
    assert.ok(Ember.$('div.autosuggest'), "autosuggest component in view");
    assert.ok(Ember.$('input.autosuggest').length, "suggestion input in DOM.");
    assert.ok(Ember.$('ul.selections').length, "selections ul in DOM");
    assert.equal(Ember.$('ul.suggestions').is(':visible'), false, "results ul is initially not displayed");
  });
});
