import Ember from 'ember';
import Pretender from 'pretender';
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
    controller = application.__container__.lookup('controller:data');

    var employees = [
    {
      id: 1,
      firstName: 'Carol',
      surname: 'Bazooka',
      age: 42
    },
    {
      id: 2,
      firstName: 'Bob',
      surname: 'Smith',
      age: 67
    },
    {
      id: 3,
      firstName: 'Michael',
      surname: 'Carruthers',
      age: 67
    },
    {
      id: 4,
      firstName: 'Patrick',
      surname: 'Bateman',
      age: 67
    },
    {
      id: 5,
      firstName: 'Tim',
      surname: 'Price',
      age: 67
    }];

    let server = new Pretender(function(){
      // this.get('/employees', function(request) {
      //   return Ember.A(employees);
      // });

      this.get('/employees/:name', function(request){
        let query = request.params.name || '';

        if(query === '') {
          return [];
        }

        return Ember.A(employees).filter(function(employee){
          var fullName =  employee.firstName + " " + employee.surname;
          return fullName.toLowerCase().search(query.toLowerCase()) !== -1;
        });
      });
    });
  },

  afterEach: function() {
    Ember.run(function() {
      get(controller, 'chosenEmployees').clear();
    });

    Ember.run(application, 'destroy');
  }
});


test("Search results should be filtered and visible", function(assert){
  assert.expect(4);

  visit('/data').then(function(){
    assert.equal(Ember.$('ul.suggestions').is(':visible'), false, "precon - results ul is initially not displayed");
  });

  fillInWithInputEvents('input.autosuggest', 'Carol', 'input');

  andThen(function(){
    assert.ok(Ember.$('ul.suggestions').is(':visible'), "results ul is displayed.");
    var el = find('.results .suggestions li.result span');
    assert.equal(el.length, 1, "1 search result exists");
    assert.equal(el.text().trim(), "Carol Bazooka", "1 search result is visible.");
  });
});

test("A chosen selection is added to the destination", function(assert){
  visit('/data');

  fillInWithInputEvents('input.autosuggest', 'Carol', 'input')
    .click('.results .suggestions li.result');

    andThen(function(){
      assert.equal(get(controller, 'chosenEmployees.length'), 1, "1 selection has been added.");
      var el = find('.selections li.selection');

      assert.equal(el.length, 1, "1 selection element has been added");

      assert.ok(/Carol Bazooka/.test(el.first().text()), "Correct text displayed in element.");

      var suggestions = find('.results .suggestions li.result');
      assert.ok(!suggestions.is(':visible'));

      var noResults = find('.suggestions .no-results');
      assert.equal(noResults.is(':visible'), false, "No results message is not displayed.");
    });
});
