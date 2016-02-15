define([
    "system/linq"
], (linq) => {

    "use strict";

    const states = {
        DEFERED: 0,
        PENDING: 1,
        DONE: 2
    };

    class Promise {

        constructor(action) {
            this._action = action;
            this._result = null;
            this._error = null;
            this._state = states.DEFERED;
            this._pendingActions = [];
        }

        then(thenAction) {

            if (this._state === states.DONE) {
                callAsync(() => thenAction(this._error, this._result));
                return this;
            }

            this.whenDone.push(thenAction);

            if (this._state == states.DEFERED) {
                this.execute();
            }

            return this;
        }

        execute() {
            if (this._state === states.DEFERED) {
                this._state = states.PENDING;
                callAsync(() => this.action(this._fulfull, this._reject));
            }
        }

        _fulfill(data) {
            if (this._state !== states.PENDING) {
                return;
            }
            this._state = states.DONE;
            this._result = data;
            void this._resolve();
        }

        _reject(exception) {
            if (this._state !== states.PENDING) {
                return;
            }
            this._state = states.DONE;
            this._err = exception;
            void this._resolve();
        }

        _resolve() {
            while (this._pendingActions.length > 0) {
                let action = this._pendingActions.pop();
                void action(this._error, this._result);
            }
        }
    }

    function callAsync(functionToCall) {
        if (window.setImmediate) {
            window.setImmediate(functionToCall);
            return;
        }
        window.setTimeout(functionToCall, 0);
    }

    return {
        await: (action, timeout) => new Promise(action),
        callAsync: callAsync
    };
});