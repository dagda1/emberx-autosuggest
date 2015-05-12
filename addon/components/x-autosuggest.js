import Ember from 'ember';
import layout from '../templates/components/x-autosuggest';

const KEY_DOWN = 40;
const KEY_UP = 38;
const COMMA = 188;
const TAB = 9;
const ENTER = 13;
const ESCAPE = 27;

const ALLOWED_KEY_CODES = Ember.A([KEY_UP, KEY_DOWN, COMMA, TAB, ENTER, ESCAPE]);

var get = Ember.get,
    set = Ember.set;

export default Ember.Component.extend({
  layout: layout,

  actions: {
    addSelection: function(selection){
      set(this, 'query', '');
      get(this, 'destination').addObject(selection);
      set(this, 'selectionIndex', -1);
      set(this, 'query', '');
      this.$('input[type=text]').val('').focus();
    },

    removeSelection: function(item){
      get(this, 'destination').removeObject(item);
    },

    removeFocus: function() {
      setTimeout(this.hideResults, 200);
    }
  },

  classNameBindings: [':autosuggest'],
  minChars: 1,
  searchPath: 'name',
  query: null,
  selectionIndex: -1,

  _autoSuggestInitialize: Ember.on('init', function() {
    this._super.apply(this, arguments);
    set(this, 'displayResults', Ember.A());
  }),

  _autoSuggestSetup: Ember.on('didInsertElement', function() {
    this._super.apply(this, arguments);

    Ember.assert('You must supply a source for the autosuggest component', get(this, 'source'));
    Ember.assert('You must supply a destination for the autosuggest component', get(this, 'destination'));

    var suggestions = document.querySelector("ul.suggestions");

    suggestions.addEventListener("mouseover", this.mouseOver.bind(this));
    suggestions.addEventListener("mouseout", this.mouseOut.bind(this));
  }),

  _autoSuggestTeardown: Ember.on('willDestroyElement', function() {
    var suggestions = document.querySelector("ul.suggestions");

    suggestions.removeEventListener("mouseover", this.mouseOver);
    suggestions.removeEventListener("mouseout", this.mouseOver);
  }),

  _queryPromise: function(query){
    var source = get(this, 'source'),
        searchPath = get(this, 'searchPath'),
        store = this.container.lookup('store:main');

    return new Ember.RSVP.Promise(function(resolve, reject){
      if(('undefined' !== typeof DS) && (DS.Model.detect(source))){
        Ember.assert('You have specifid the source as a DS.Model but no store is in the container', store);

        var queryExpression = {};

        queryExpression[searchPath] = query;

        return store.find(source, queryExpression).then(resolve, reject);
      }
      else if(source.then){
        source.then(resolve, reject);
      }else{
        resolve(source);
      }
    });
  },

  hasQuery: Ember.computed('query', function(){
    var query = get(this, 'query');

    if(query && query.length > get(this, 'minChars')){
      this.positionResults();
      return true;
    }

    return false;
  }),

  input: function(e) {
    var query = e.target.value || '',
        displayResults = get(this, 'displayResults'),
        minChars = get(this, 'minChars'),
        self = this;

    set(this, 'query', query);

    if(!query.length || query < minChars) {
      set(this, 'selectionIndex', -1);
      displayResults.clear();
      return;
    }

    this._queryPromise(query).then(function(results){
      self.processResults(query, results);
    }).catch(function(error) {
      Ember.Logger.error(error);
    });
  },

  processResults: function(query, source){
    var self = this,
        displayResults = get(this, 'displayResults');

    var results = source.filter(function(item){
      return item.get(get(self, 'searchPath')).toLowerCase().search(query.toLowerCase()) !== -1;
    }).filter(function(item){
      return !get(self, 'destination').contains(item);
    });

    if(get(results, 'length') === 0){
      return displayResults.clear();
    }

    this.positionResults();

    var searchPath = get(this, 'searchPath');

    displayResults.clear();

    displayResults.pushObjects(Ember.A(results.sort(function(a, b){
      return Ember.compare(get(a, searchPath), get(b, searchPath));
    })));
  },

  mouseOver: function(evt){
    var el = this.$(evt.target);

    var active = get(this, 'displayResults').filter(function(item){
      return get(item, 'active');
    });

    if(active && active.length){
      active.setEach('active', false);
      set(this, 'selectionIndex', -1);
    }

    if(el.hasClass('result-name')){
      return;
    }

    this.$('ul.suggestions li').removeClass('hover');
    el.addClass('hover');
  },

  mouseOut: function(evt){
    var target = $(evt.target);

    if(target.parents('ul').hasClass('suggestions')){
      return;
    }

    this.$('ul.suggestions li').removeClass('hover');
  },

  positionResults: function(){
    var results = this.$('.results');

    var suggestions = this.$('ul.suggestions'),
        el = this.$(),
        position = el.position();

    results.removeClass('hdn');

    suggestions.css('position', 'absolute');
    suggestions.css('left', position.left);
    suggestions.css('top', position.top + this.$().height());

    var width = el.outerWidth();

    suggestions.css('width', width);
  },

  moveSelection: function(direction){
    var selectionIndex = get(this, 'selectionIndex'),
        isUp = direction === 'up',
        isDown = !isUp,
        displayResults = get(this, 'displayResults'),
        displayResultsLength = get(displayResults, 'length'),
        searchPath = get(this, 'searchPath'),
        hoverEl;

    displayResults.setEach('active', false);

    if(!displayResultsLength){
      set(this, 'selectionIndex', -1);
      return;
    }

    hoverEl = this.$('li.result.hover');

    if(hoverEl.length){
      var text = Ember.$('span', hoverEl).text(),
          selected = displayResults.find(function(item){
            return get(item, searchPath) === text;
          });

      selectionIndex = displayResults.indexOf(selected);

      this.$('ul.suggestions li').removeClass('hover');

      this.$('input.autosuggest').focus();
    }

    if(isUp && selectionIndex <= 0){
      selectionIndex =  0;
    }
    else if(isDown && selectionIndex === displayResultsLength -1){
      selectionIndex = displayResultsLength -1;
    }else if(isDown){
      selectionIndex++;
    }else{
      selectionIndex--;
    }

    var active = get(this, 'displayResults').objectAt(selectionIndex);

    set(this, 'selectionIndex', selectionIndex);

    set(active, 'active', true);
  },

  hideResults: function(){
    var displayResults = get(this, 'displayResults');

    set(this, 'selectionIndex', -1);

    if(!get(displayResults, 'length')){
      this.$('.no-results').addClass('hdn');
    }

    this.$('.results').addClass('hdn');
  },

  selectActive: function(){
    var displayResultsLength = get(this, 'displayResults.length');

    if(!displayResultsLength){
      return;
    }

    var active = get(this, 'displayResults').find(function(item){
      return get(item, 'active');
    });

    if(!active){
      this.hideResults();
      return;
    }

    this.send('addSelection', active);
  },

  keyFunctionMap: Ember.computed(function() {
    var keyFunctionMap = {};

    keyFunctionMap[KEY_UP] = this.moveSelection.bind(this, "up");
    keyFunctionMap[KEY_DOWN] = this.moveSelection.bind(this, "down");
    keyFunctionMap[ENTER] = this.selectActive;
    keyFunctionMap[ESCAPE] = this.hideResults;

    return keyFunctionMap;
  }),

  keyDown: function(e){
    var keyCode = e.keyCode;

    if(!ALLOWED_KEY_CODES.contains(keyCode)){
      return;
    }

    get(this, 'keyFunctionMap')[keyCode].call(this);

    e.preventDefault();
    e.stopPropagation();
    return false;
  },
});
