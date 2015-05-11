import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from '../helpers/start-app';

var application,
    get = Ember.get,
    controller;

module('XAutosuggest - Ember Data source tests', {
  beforeEach: function() {
    application = startApp();
    // FIXME: find a better way of getting to the container
    controller = application.__container__.lookup('controller:core');
  },

  afterEach: function() {
    Ember.run(function() {
      get(controller, 'tags').clear();
    });

    Ember.run(application, 'destroy');
  }
});
