/**
 * 不想引入jquery,直接写一个defer
 */
 class Defer {
    /**
     * @type {function}
     */
    _resolve = null;
    /**
     * @type {function}
     */
    _reject = null;

    /**
     * @type {Promise}
     */
    promise = null;

    constructor() {
        const me = this;
        this.promise = new Promise((resolve, reject) => {
            me._resolve = resolve;
            me._reject = reject;
        });
    }

    then(cb) {
        return this.promise.then(cb);
    }

    catch(cb) {
        return this.promise.catch(cb);
    }

    resolve(res) {
        this._resolve.apply(null, [...arguments]);
    }

    reject(e) {
        this._reject.apply(null, [...arguments]);
    }

}

module.exports = Defer;