define(["system/text"],function(a){"use strict";function b(){function b(){var b="";return b+=a.from("Page: {0}\n",window.location.href),b+=a.from("Browser: {0}\n",window.navigator.userAgent)}var d=b(),e={};this.getLogger=function(a){return e[a]?e[a]:(e[a]=new c(a),e[a])},this.levels={DEBUG:0,INFO:1,WARN:2,ERROR:3},this.logLevel=this.levels.INFO,this.append=function(a){d+=a+"\n"},this.get=function(){return d}}function c(b){function c(a,b){console&&console.log("%c"+a,b)}function e(){var b=new Date;return a.from("{0}:{1}:{2}.{3}",f(b.getUTCHours(),2),f(b.getUTCMinutes(),2),f(b.getUTCSeconds(),2),f(b.getUTCMilliseconds(),3))}function f(a,b){return("00000000000"+a.toString()).slice(-b)}this.debug=function(f){f=a.from("{0} : [{1}] DEBUG: {2}",e(),b,a.from.apply(this,arguments)),d.append(f),d.logLevel<=d.logLevels.DEBUG&&c(f,"color: grey;")},this.info=function(f){f=a.from("{0} : [{1}] INFO: {2}",e(),b,a.from.apply(this,arguments)),d.append(f),d.logLevel<=d.logLevels.INFO&&c(f,"color: blue;")},this.warn=function(f){f=a.from("{0} : [{1}] WARN {2}",e(),b,a.from.apply(this,arguments)),d.append(f),d.logLevel<=d.logLevels.WARN&&c(f,"color: yellow;")},this.error=function(f){f=a.from("{0} : [{1}] ERROR {2}",e(),b,a.from.apply(this,arguments)),d.append(f),d.logLevel<=d.logLevels.ERROR&&c(f,"color: red;")}}var d=new b;return d});