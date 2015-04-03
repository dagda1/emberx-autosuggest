import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return Ember.A([
      Ember.Object.create({id: 1, name: "Bob Hoskins"}),
      Ember.Object.create({id: 2, name: "Michael Collins"}),
      Ember.Object.create({id: 3, name: "Paul Cowan"})
    ]);
  }
});
