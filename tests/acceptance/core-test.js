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
    assert.ok($('div.autosuggest'), "autosuggest component in view");
    assert.ok($('input.autosuggest').length, "suggestion input in DOM.");
    assert.ok($('ul.selections').length, "selections ul in DOM");
    assert.equal($('ul.suggestions').is(':visible'), false, "results ul is initially not displayed");
  });
});


test("a no results message is displayed when no match is found", function(assert){
  assert.expect(3);

  visit('/').then(function(){
    assert.equal(Ember.$('ul.suggestions').is(':visible'), false, "precon - results ul is initially not displayed");
  });

  fillIn('input.autosuggest', 'xxxx');

  andThen(function(){
    assert.ok(Ember.$('ul.suggestions').is(':visible'), "results ul is displayed.");
    assert.equal(find('.results .suggestions .no-results').html(), "No Results.", "No results message is displayed.");
  });
});

