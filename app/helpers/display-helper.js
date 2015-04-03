import Ember from 'ember';

var get = Ember.get;

export function displayHelper(searchPath) {
  return new Ember.Handlebars.SafeString(get(this, searchPath));
}

export default Ember.HTMLBars.makeBoundHelper(displayHelper);
