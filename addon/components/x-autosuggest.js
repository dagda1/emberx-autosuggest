import Ember from 'ember';
import layout from '../templates/components/x-autosuggest';
import displayHelper from '../helpers/display-helper';

const KEY_DOWN = 40;
const KEY_UP = 38;
const COMMA = 188;
const TAB = 9;
const ENTER = 13;
const ESCAPE = 27;

const ALLOWED_KEY_CODES = Ember.A([KEY_UP, KEY_DOWN, COMMA, TAB, ENTER, ESCAPE]);

var get = Ember.get,
    set = Ember.set,
    addObserver = Ember.addObserver;

export default Ember.Component.extend({
  layout: layout,

  actions: {
    addSelection: function(selection){
      set(this, 'query', '');
      get(this, 'destination').addObject(selection);
      set(this, 'selectionIndex', -1);
      this.$('input[type=text]').focus();
    },

    removeSelection: function(item){
      get(this, 'destination').removeObject(item);
    },

    removeFocus: function() {
      console.log('removeFocus');
      setTimeout(this.hideResults, 200);
    }
  },

  classNameBindings: [':autosuggest'],
  minChars: 1,
  searchPath: 'name',
  query: null,
  selectionIndex: -1,

  _autoSuggestInitialize: Ember.on('init', function() {
    // FIXME: when we worked out what is going on
    console.log(displayHelper);
    this._super.apply(this, arguments);
    addObserver(this, 'query', this.queryDidChange);
    set(this, 'displayResults', Ember.A());
  }),

  _autoSuggestSetup: Ember.on('didInsertElement', function() {
    this._super.apply(this, arguments);

    Ember.assert('You must supply a source for the autosuggest component', get(this, 'source'));
    Ember.assert('You must supply a destination for the autosuggest component', get(this, 'destination'));

    this.$('ul.suggestions').on('mouseover', 'li', this.mouseOver.bind(this));
    this.$('ul.suggestions').on('mouseout', 'li', this.mouseOut.bind(this));
  }),

  _autoSuggestTeardown: Ember.on('willDestroyElement', function() {
    this.removeObserver('query', this, this.queryDidChange);

    this.$('ul.suggestions').off('mouseover');
    this.$('ul.suggestions').off('mouseout');
  }),

  _queryPromise: function(query){
    var source = get(this, 'source'),
        searchPath = get(this, 'searchPath'),
        store = get(this, 'store');

    return new Ember.RSVP.Promise(function(resolve, reject){
      if(('undefined' !== typeof DS) && (DS.Model.detect(source))){
        var queryExpression = {};

        queryExpression[searchPath] = query;

        var type = source.toString().humanize();

        store.find(type, queryExpression).then(resolve, reject);
      }
      else if(source.then){
        source.then(resolve, reject);
      }else{
        resolve(source);
      }
    });
  },

  queryDidChange: function(){
    var query = get(this, 'query'),
        displayResults = get(this, 'displayResults'),
        hasQuery = get(this, 'hasQuery'),
        self = this;

    if(!hasQuery){
      set(this, 'selectionIndex', -1);
      displayResults.clear();
      return;
    }

    this._queryPromise(query).then(function(results){
      self.processResults(query, results);
    }, function(e){
      console.log(e.message);
      console.log(e.stack);
      throw e;
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

  hasQuery: Ember.computed('query', function(){
    var query = get(this, 'query');

    if(query && query.length > get(this, 'minChars')){
      this.positionResults();
      return true;
    }

    return false;
  }),

  mouseOver: function(evt){
    var el = this.$(evt.target);

    var active = get(this, 'displayResults').filter(function(item){
      return get(item, 'active');
    });

    if(active || active.length){
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

  keyDown: function(e){
    var keyCode = e.keyCode;

    if(!ALLOWED_KEY_CODES.contains(keyCode)){
      return;
    }

    switch(keyCode){
    case KEY_UP:
      this.moveSelection('up');
      break;
    case KEY_DOWN:
      this.moveSelection('down');
      break;
    case ENTER:
      this.selectActive();
      break;
    case ESCAPE:
      this.hideResults();
      break;
    }

    e.preventDefault();
    e.stopPropagation();
    return false;
  },
});
