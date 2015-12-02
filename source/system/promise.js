define([
  "system/enumerable"
], function(enumerable){
  
  "use strict";
  
  function Promise(action) {
    var _promise = this;
    
    var pending = true;
    var result = null;
    var err = null;
    
    var whenDone = [];
    
    this.then = function(thenAction) {
      if (!pending) {
        void thenAction(err, result);
        return _promise;
      }
      whenDone.push(thenAction);
      return _promise;
    };
    
    try {
      void action(fulfills, rejects);
    } catch (exception) {
      rejects(exception);
    }
    
    
    function fulfills(data){
      if (!pending) {
        return;
      }
      pending = false;
      result = data;
      void resolve();
    }
    
    function rejects(exception){
      if (!pending) {
        return;
      }
      pending = false;
      err = exception;
      void resolve();
    }
    
    function resolve() {
      if (pending) {
        return;
      }
      enumerable.of(whenDone).each(function(thenAction){
        void thenAction(err, result);
      });
    }
  }
  
  return {
    that: function(action) {
      return new Promise(action);
    }
  };
});