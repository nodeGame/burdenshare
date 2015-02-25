/**
 * ## RandomOrderExecutor
 *
 * Executes callbacks in a random order
 */
function RandomOrderExecutor(options) {
    this.options = null;

    /**
     * ### RandomOrderExecutor.index
     *
     * Represents how many callbacks have been executed so far
     */
    this.index = null;

    /**
     * ### RandomOrderExecutor.rankedCallbacks
     *
     * Array of objects which contain a random rank and a callback
     *
     * Execution order is determined by the ranks.
     */
    this.rankedCallbacks = [];


    /**
     * ### RandomOrderExecutor.onDone
     *
     * Function to be called after the last callback has been executed
     */
    this.onDone = null;

    this.init(options);
}

RandomOrderExecutor.prototype.init = function(options) {
    this.options = options || {};

    if (this.options.callbacks) {
        this.setCallbacks(options.callbacks);
    }

    this.onDone = this.options.onDone || null;

    this.index = 0;

    // In very old browsers array.sort is unsupported.
    if (!Array.prototype.sort) {
        console.log('Error: Cannot randomize execution order');
        this.prototype.rankCallbacks = function() {
            this.rankedCallbacks = options.callbacks;
        };
    }
};

RandomOrderExecutor.prototype.setCallbacks = function(callbacks) {
    var i;
    if (!JSUS.isArray(callbacks)) {
        throw new TypeError('RandomOrderExecution.setCallbacks:' +
            'callbacks should be array');
    }
    for (i = 0; i < callbacks.length; ++i) {
        this.rankedCallbacks.push({
            rank: Math.random(),
            callback: callbacks[i]
        });
    }
    this.rankedCallbacks.sort(function(left,right) {
       return left.rank < right.rank ? -1 : 1;
    });
};

RandomOrderExecutor.prototype.next = function() {
    ++this.index;
    if (this.index < this.rankedCallbacks.length) {
        this.rankedCallbacks[this.index].callback(this);
    }
    else {
        this.done();
    }
};

RandomOrderExecutor.prototype.done = function() {
    if (this.onDone) {
        this.onDone();
    }
};

RandomOrderExecutor.prototype.wrapCallback = function(callback) {
    if ('function' !== typeof callback) {
        throw new TypeError('RandomOrderExecutor.wrapCallback:' +
            'callback must be function');
    }
    return function(executor) {
        callback();
        executor.next();
    };
};

RandomOrderExecutor.prototype.setOnDone = function(onDone) {
    if ('function' !== typeof onDone) {
        throw new TypeError('RandomOrderExecutor.setOnDone:' +
            'onDone must be function');
    }
    this.onDone = onDone;
};

RandomOrderExecutor.prototype.execute = function(callbacks, onDone) {
    this.index = 0;
    if (callbacks) {
        this.setCallbacks(callbacks);
    }
    if (onDone) {
        this.setOnDone(onDone);
    }
    if ('undefined' !== typeof this.rankedCallbacks[0]) {
        this.rankedCallbacks[0].callback(this);
    }
};
