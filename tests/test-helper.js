import Ember from 'ember';
import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';

var run = Ember.run;

function focus(el) {
  if (el && el.is(':input, [contenteditable=true]')) {
    var type = el.prop('type');
    if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
      run(el, function() {
        // Firefox does not trigger the `focusin` event if the window
        // does not have focus. If the document doesn't have focus just
        // use trigger('focusin') instead.
        if (!document.hasFocus || document.hasFocus()) {
          this.focus();
        } else {
          this.trigger('focusin');
        }
      });
    }
  }
}

function fillInWithTriggerEvents(app, selector, contextOrText, textOrEvents, events) {
  var $el, context, text;

  if (typeof events === 'undefined') {
    context = null;
    text = contextOrText;
    events = textOrEvents;
  } else {
    context = contextOrText;
    text = textOrEvents;
  }

  if (typeof events === 'string') {
    events = [events];
  }

  $el = app.testHelpers.findWithAssert(selector, context);

  focus($el);

  function fillInWithTriggerEvent(character) {
    var val = $el.val() || '',
        charCode = character.charCodeAt(0);

    val += character;

    run(function() {
      for(var event in events) {
        $el.trigger(events[event], {keyCode: charCode, which: charCode});
      }

      $el.val(val).change();
    });
  }

  var i = 0, l = text.length;

  for(; i < l; i++) {
    fillInWithTriggerEvent(text[i]);
  }

  return app.testHelpers.wait();
}

Ember.Test.registerAsyncHelper('fillInWithTriggerEvents', fillInWithTriggerEvents);

setResolver(resolver);
