import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from '../helpers/start-app';

var application,
    get = Ember.get,
    controller;

module('Acceptance: Customisations', {
  beforeEach: function() {
    application = startApp();
    // FIXME: find a better way of getting to the container
    controller = application.__container__.lookup('controller:customisations');
  },

  afterEach: function() {
    Ember.run(function() {
      get(controller, 'tags').clear();
    });

    Ember.run(application, 'destroy');
  }
});

test("Can prepend a customisation in each suggestion", function(assert){
  visit('/customisations').then(function(){
    assert.equal(get(controller, 'content.length'), 3, "precon - 3 possible selections exist");

    assert.equal(Ember.$('ul.suggestions').is(':visible'), false, "precon - results ul is initially not displayed");
  })
    .fillInWithInputEvent('input.autosuggest', 'Paul', 'input').then(function(){
      var el = find('.results .suggestions li.result span');
      assert.equal(el.length, 1, "1 search result exists");

      var img = el.find('img.avatar');
      assert.equal('Paul Cowan', img.attr('alt'));
    });
});

test("Can prepend a customisation to each chosen selection", function(assert){
  visit('/customisations').then(function(){
    assert.equal(get(controller, 'content.length'), 3, "precon - 3 possible selections exist");

    assert.equal(Ember.$('ul.suggestions').is(':visible'), false, "precon - results ul is initially not displayed");
  })
    .fillInWithInputEvent('input.autosuggest', 'Paul', 'input')
    .click('.results .suggestions li.result').then(function(){
      var el = find('.selections li.selection');

      assert.equal(el.length, 1, "1 selection element has been added");
      var img = el.find('img.avatar');
      assert.equal('Paul Cowan', img.attr('alt'));
    });
});

