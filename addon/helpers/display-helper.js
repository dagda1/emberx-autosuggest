import Ember from 'ember';

var get = Ember.get;

export default Ember.Handlebars.registerBoundHelper('displayHelper', function displayHelper(context, searchPath) {
  return new Ember.Handlebars.SafeString(get(context, searchPath));
});
