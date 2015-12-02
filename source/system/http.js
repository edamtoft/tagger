define([
  "system/text",
  "system/logManager",
  "system/enumerable"
], function (text, logManager, enumerable) {

  "use strict";

  var Http = function () {
    var _http = this;
    var log = logManager.getLogger("Http Handler");

    this.method = {
      GET: "GET",
      POST: "POST",
      PUT: "PUT",
      DELETE: "DELETE"
    };

    this.makeRequest = function (method, url, routeParams) {
      return new Request(method, url, routeParams);
    };

    this.get = function (url, routeParams) {
      return new Request(_http.method.GET, url, routeParams);
    };

    this.put = function (url, routeParams) {
      return new Request(_http.method.PUT, url, routeParams);
    };

    this.post = function (url, routeParams) {
      return new Request(_http.method.POST, url, routeParams);
    };

    this.delete = function (url, routeParams) {
      return new Request(_http.method.DELETE, url, routeParams);
    };

    function Request(method, url, routeParams) {
      var _request = this;
      
      var successCallback;
      var errorCallback;
      var doneCallback;
      var progressCallback;
      var data = null;
      var queryString = "";
      var headers = {};
      var sent = false;
      var recieved = false;
      var req = new XMLHttpRequest();
      var resData = null;

      url = text.from(url, routeParams);

      this.withHeader = function (header, value) {
        headers[header] = value;
        return _request;
      };

      this.withQuery = function (query) {
        if (queryString.indexOf("?") === -1) {
          queryString += "?";
        } else {
          queryString += "&";
        }
        if (typeof query === "object") {
          queryString += text.toQuery(query);
        } else {
          queryString += query.toString();
        }
        return _request;
      };

      this.withBasicAuth = function (username, password) {
        headers.Authorization = "basic " +
        btoa(text.from("{0}:{1}", username, password));
        return _request;
      };
      
      this.withAuth = function (type, value) {
        headers.Authorization = text.from("{0}:{1}", type, value);
        return _request;
      };

      this.send = function (d) {
        if (!d) {
          send();
          return _request;
        }

        if (typeof (d) === "object") {
          headers["Content-Type"] = "Application/JSON";
          data = JSON.stringify(d);
        } else {
          headers["Content-Type"] = "Text/Plain";
          data = d.toString();
        }

        send();
        return _request;
      };

      this.progress = function (callback) {
        if (recieved) {
          callback(1);
        }
        progressCallback = callback;
        return _request;
      };

      this.success = function (callback) {
        if (!sent) {
          send();
        }
        if (recieved) {
          callback(resData, req.status, req.statusText, req.getAllResponseHeaders());
          return _request;
        }
        successCallback = callback;
        return _request;
      };

      this.error = function (callback) {
        if (!sent) {
          send();
        }
        if (recieved) {
          callback(resData, req.status, req.statusText, req.getAllResponseHeaders());
          return _request;
        }
        errorCallback = callback;
        return _request;
      };

      this.done = function (callback) {
        if (!sent) {
          send();
        }
        if (recieved) {
          callback(resData, req.status, req.statusText, req.getAllResponseHeaders());
          return _request;
        }
        doneCallback = callback;
        return _request;
      };

      function send() {
        sent = true;
        log.info("Making {0} request to {1}", method, url);
        req.open(method, url + queryString);
        enumerable.of(headers).each(function (header) {
          req.setRequestHeader(header.key, header.value);
        });
        req.send(data);
        req.onprogress = function (e) {
          if (progressCallback) {
            progressCallback(e.loaded / e.total);
          }
        };
        req.onreadystatechange = function () {
          if (req.readyState !== XMLHttpRequest.DONE) {
            return;
          }
          recieved = true;
          var contentType = req.getResponseHeader("Content-Type") || "";

          switch (contentType.split(/;\s*/)[0].toLowerCase()) {
            case "application/json":
              resData = JSON.parse(req.responseText);
              break;
            default:
              resData = req.responseText;
          }
          switch (req.status) {
            case 200:
            case 201:
            case 202:
            case 203:
            case 204:
            case 205:
            case 206:
              log.info("Recieved response from {0} with status {1} {2}", url, req.status, req.statusText);
              if (typeof successCallback === "function") {
                successCallback(resData, req.status, req.statusText, req.getAllResponseHeaders());
              }
              break;
            default:
              log.error("Recieved error code {0} {1} from {1}", req.status, req.statusText, url);
              if (typeof errorCallback === "function") {
                errorCallback(resData, req.status, req.statusText, req.getAllResponseHeaders());
              }
              break;
          }
          if (typeof doneCallback === "function") {
            doneCallback(resData, req.status, req.statusText, req.getAllResponseHeaders());
          }
        };
      }
    }
  };

  return new Http();

});