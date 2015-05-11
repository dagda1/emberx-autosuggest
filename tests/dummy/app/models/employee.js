import Ember from 'ember';

var Employee = DS.Model.extend({
  firstName: DS.attr('string'),
  surname: DS.attr('string'),
  age: DS.attr('number'),
  fullName: Ember.computed('firstName', 'surname', function(){
    return this.get('firstName') + " " + this.get('surname');
  })
});

Employee.reopenClass({
  FIXTURES: [
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
    }
  ]
});

export default Employee;
