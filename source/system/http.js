define([
    "system/text",
    "system/logManager",
    "system/linq"
], (text, logManager, linq) => {

    "use strict";

    let log = logManager.getLogger("Http Handler");

    function Request(method, rawUrl, routeParams) {
        let _request = this;

        let successCallback;
        let errorCallback;
        let doneCallback;
        let progressCallback;
        let data = null;
        let query = null;
        let headers = {};
        let sent = false;
        let recieved = false;
        let req = new XMLHttpRequest();
        let resData = null;

        let splitUrl = rawUrl.split("?");

        let url = text.from(splitUrl[0], routeParams);

        if (splitUrl.length > 1) {
            query = text.fromQuery(splitUrl[1]);
        }

        this.withHeader = (header, value) => {
            headers[header] = value;
            return _request;
        };

        this.query = addToQuery => {
            if (!query) {
                query = {};
            }

            for (var key in addToQuery) {
                query[key] = addToQuery[key];
            }
            return _request;
        };

        this.basicAuth = (username, password) => {
            headers.Authorization = "basic " +
            btoa(text.from("{0}:{1}", username, password));
            return _request;
        };

        this.auth = (authType, credentials) => {
            headers.Authorization = text.from("{0} {1}", authType, credentials);
            return _request;
        };

        this.send = dataToSend => {
            if (sent) {
                return _request;
            }

            if (!dataToSend) {
                send();
                return _request;
            }

            if (typeof (dataToSend) === "object") {
                headers["Content-Type"] = "Application/JSON";
                data = JSON.stringify(dataToSend);
            } else {
                headers["Content-Type"] = "Text/Plain";
                data = dataToSend.toString();
            }

            send();
            return _request;
        };

        this.progress = callback => {
            if (recieved) {
                callback(1);
            }
            progressCallback = callback;
            return _request;
        };

        this.success = callback => {
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

        this.error = callback => {
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
            let requestUrl = url;
            if (query !== null) {
                requestUrl += "?" + text.toQuery(query);
            }

            req.open(method, requestUrl);
            linq.Enumerable.from(headers).forEach(header => req.setRequestHeader(header.key, headers.value));
            req.send(JSON.stringify(data));
            req.onprogress = function (e) {
                if (progressCallback) {
                    progressCallback(e.loaded / e.total);
                }
            };
            req.onreadystatechange = function () {
                if (req.readyState !== (XMLHttpRequest.DONE || 4)) {
                    return;
                }
                recieved = true;
                let contentType = req.getResponseHeader("Content-Type") || "";

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

    var http = {
        method: {
            GET: "GET",
            POST: "POST",
            PUT: "PUT",
            DELETE: "DELETE"
        },

        makeRequest: (method, url, routeParams) => new Request(method, url, routeParams),

        get: (url, routeParams) => new Request(http.method.GET, url, routeParams),

        put: (url, routeParams) => new Request(http.method.PUT, url, routeParams),

        post: (url, routeParams) => new Request(http.method.POST, url, routeParams),

        delete: (url, routeParams) => new Request(http.method.DELETE, url, routeParams)
    };

    return http;
});