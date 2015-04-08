import Ember from 'ember';

var get = Ember.get;

function displayHelper(context, searchPath) {
  return new Ember.Handlebars.SafeString(get(context, searchPath));
}

export default Ember.Handlebars.makeBoundHelper(displayHelper);
