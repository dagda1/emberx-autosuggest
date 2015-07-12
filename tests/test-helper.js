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

function fillInWithInputEvent(app, selector, contextOrText, textOrEvents, event) {
  var $el, context, text;

  if (typeof event === 'undefined') {
    context = null;
    text = contextOrText;
    event = textOrEvents;
  } else {
    context = contextOrText;
    text = textOrEvents;
  }

  $el = app.testHelpers.findWithAssert(selector, context);

  $el.val('');

  focus($el);

  function fillInWithEvent(character) {
    var val = $el.val();
    var charCode = character.charCodeAt(0);

    val += character;

    run(function() {
      $el.val(val).change();
    });

    run($el, "trigger", event, { keyCode: charCode, which: charCode });
  }

  for (var i = 0, l = text.length; i < l; i++) {
    fillInWithEvent(text[i]);
  }

  return app.testHelpers.wait();
}

Ember.Test.registerAsyncHelper('fillInWithInputEvent', fillInWithInputEvent);

setResolver(resolver);
