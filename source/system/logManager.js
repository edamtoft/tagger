define([
    "system/text"
], (text) => {

    "use strict";

    function LogManager() {
        var rootLog = getPageData();
        var logs = {};

        this.getLogger = function (name) {
            if (logs[name]) {
                return logs[name];
            }
            logs[name] = new Log(name);
            return logs[name];
        };

        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };

        this.logLevel = this.levels.INFO;

        this.append = function (message) {
            rootLog += message + "\n";
        };

        this.get = function () {
            return rootLog;
        };

        function getPageData() {
            var log = "";
            log += text.from("Page: {0}\n", window.location.href);
            log += text.from("Browser: {0}\n", window.navigator.userAgent);
            return log;
        }
    }

    function Log(logType) {
        this.debug = function (message) {
            message = text.from("{0} : [{1}] DEBUG: {2}", utcDate(), logType, text.from.apply(this, arguments));
            logManager.append(message);
            if (logManager.logLevel <= logManager.levels.DEBUG) {
                print(message, "color: grey;");
            }
        };

        this.info = function (message) {
            message = text.from("{0} : [{1}] INFO: {2}", utcDate(), logType, text.from.apply(this, arguments));
            logManager.append(message);
            if (logManager.logLevel <= logManager.levels.INFO) {
                print(message, "color: blue;");
            }
        };

        this.warn = function (message) {
            message = text.from("{0} : [{1}] WARN {2}", utcDate(), logType, text.from.apply(this, arguments));
            logManager.append(message);
            if (logManager.logLevel <= logManager.levels.WARN) {
                print(message, "color: yellow;");
            }
        };

        this.error = function (message) {
            message = text.from("{0} : [{1}] ERROR {2}", utcDate(), logType, text.from.apply(this, arguments));
            logManager.append(message);
            if (logManager.logLevel <= logManager.levels.ERROR) {
                print(message, "color: red;");
            }
        };

        function print(message, style) {
            if (console) {
                console.log("%c" + message, style);
            }
        }

        function utcDate() {
            var d = new Date();
            return text.from("{0}:{1}:{2}.{3}", pad(d.getUTCHours(), 2), pad(d.getUTCMinutes(), 2), pad(d.getUTCSeconds(), 2), pad(d.getUTCMilliseconds(), 3));
        }

        function pad(num, length) {
            return ("00000000000" + num.toString()).slice(-length);
        }
    }

    var logManager = new LogManager();

    return logManager;

});
