define([], function () {
  
  "use strict";
  
  function Enumerable(data, invert) {   
    var _enumerable = this;
    var dataset = [];
    
    if (Array.isArray(data)) {
      dataset = data.slice(0);
    } else if (typeof data.length !== "undefined") {
      for (var i = 0; i < data.length; i++) {
        dataset.push(data[i]);
      }
    } else {
      throw new Error("Dataset is not enumerable");
    }
     
    this.toArray = function() {
      return dataset;
    };
    
    this.not = function() {
      return new Enumerable(dataset, true);
    };
    
    this.null = function() { 
      return new Enumerable(dataset.filter(function(a){
        return invert ? 
          typeof a !== "undefined" && a !== null :
          a === null;
      }), false);
    };
        
    this.distinct = function() {
      var distinctValues = [];

      for (var i = 0; i < dataset.length; i++) {
        var value = dataset[i];
        if (distinctValues.indexOf(value) === -1) {
          distinctValues.push(value);
        }
      }
      
      return new Enumerable(distinctValues, false);
    };
    
    this.where = function(lambda) {
      if (invert && lambda) {
        lambda = function(a) {
          return !lambda(a);
        };
      }
      
      return new Enumerable(dataset.filter(lambda), false);
    };
    
    this.select = function(lambda) {
      return new Enumerable(dataset.map(lambda), false);
    };
    
    this.sort = function() {
      return new Enumerable(dataset.sort(), false);
    };
    
    this.orderBy = function(lambda) {
      return new Enumerable(dataset.sort(function(a, b){
        return lambda(a) > lambda(b);
      }), false);
    };
    
    this.skip = function(count) {
      return new Enumerable(dataset.slice(count), false);
    };
    
    this.take = function(count) {
      return new Enumerable(dataset.slice(0, count), false);
    };
    
    this.orderByDescending = function(lambda) {
      return new Enumerable(dataset.sort(function(a, b){
        return lambda(a) < lambda(b);
      }), false);
    };
    
    this.each = function(action) {
      // No change is made to the dataset, therefore it's safe to keep the same object
      for (var i = 0; i < dataset.length; i++) {
        var actionResult = action(dataset[i]);
        if (actionResult === true) {
          return _enumerable;
        }
      }
      return _enumerable;
    };
    
    this.forEach = this.each;
    
    this.firstOrDefault = function(lambda) {
      if (!lambda) {
        return dataset[0] || null;
      }
      
      if (invert && lambda) {
        lambda = function(a) {
          return !lambda(a);
        };
        invert = false;
      }
      
      for (var i = 0; i < dataset.length; i++) {
        var item = dataset[i];
        if (lambda(item)) {
          return dataset[i];
        }
      }
      return null;
    };
    
    this.sum = function(lambda) {
      if (invert && lambda) {
        lambda = function(a) {
          return !lambda(a);
        };
        invert = false;
      }
      
      var total = 0;
      for (var i = 0; i < dataset.length; i++) {
        var value;
        if (!lambda) {
          value = dataset[i];
        } else {
          value = lambda(dataset[i]);
        }
        total += value;
      }
      return total;
    };
    
    this.average = function(lambda) {
      if (invert && lambda) {
        lambda = function(a) {
          return !lambda(a);
        };
        invert = false;
      }
      
      return _enumerable.sum(lambda)/dataset.length;
    };
    
    
    this.count = function(lambda) {
      if (!lambda) {
        return dataset.length;
      }
      
      if (invert) {
        lambda = function(a) {
          return !lambda(a);
        };
        invert = false;
      }
      
      return dataset.filter(lambda).length;
    };
    

    this.any = function(lambda) {
      if (!lambda) {
        return dataset.length > 0;
      }
      
      if (invert) {
        lambda = function(a) {
          return !lambda(a);
        };
        invert = false;
      }
      
      for (var i = 0; i < dataset.length; i++) {
        if (lambda(dataset[i])) {
          return true;
        }
      }
      return false;
    };
    
    this.all = function(lambda) {
      if (invert && lambda) {
        lambda = function(a) {
          return !lambda(a);
        };
        invert = false;
      }
      
      return dataset.filter(lambda).length === dataset.length;
    };
    
    this.min = function(lambda) {
      if (invert && lambda) {
        lambda = function(a) {
          return !lambda(a);
        };
        invert = false;
      }
      
      var match = false;
      var min = Number.MAX_VALUE;
      for (var i = 0; i < dataset.length; i++) {
        var value;
        if (!lambda) {
          value = dataset[i];
        } else {
          value = lambda(dataset[i]);
        }
        if (value < min) {
          min = value;
          match = true;
        }
      }
      return match ? min : null;
    };
    
    this.max = function(lambda) {
      if (invert && lambda) {
        lambda = function(a) {
          return !lambda(a);
        };
        invert = false;
      }
      
      var match = false;
      var max = Number.MIN_VALUE;
      for (var i = 0; i < dataset.length; i++) {
        var value;
        if (!lambda) {
          value = dataset[i];
        } else {
          value = lambda(dataset[i]);
        }
        if (value > max) {
          max = value;
          match = true;
        }
      }
      return match ? max : null;
    };
  }
  
  return {
    of: function(enumerable) {
      if (typeof enumerable === "object" && !(Array.isArray(enumerable) || typeof enumerable.length !== "undefined")) {
        if (enumerable instanceof Enumerable) {
          return enumerable;
        }
        var keyValueCollection = [];
        for (var key in enumerable) {
          keyValueCollection.push({key: key, value: enumerable[key]});
        }
        return new Enumerable(keyValueCollection, false);
      }
      return new Enumerable(enumerable, false);
    },
    empty: new Enumerable([], false)
  };
});