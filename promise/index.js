const PENDING = 0;
const FUFILLED = 1;
const REJECTED = 2;

const isFunction = fn => typeof fn === 'function';
const isObject = obj => obj !== null && typeof obj === 'object';
const noop = () => { };

const nextTick = fn => setTimeout(fn, 0);


const reject = () => {
    if (promise._status !== PENDING) return;
    promise._status = REJECTED;
    promise._value = reason;

    invokeCallbcak(promise);
}


const fulfill = (promise, value) => {
    if(promise._status !== PENDING) return;

    promise._status = FUFILLED;
    promise._value = value;

    invokeCallbcak(promise);
}

const resolve = (promise, x) => {
    if (promise === x) {
        reject(promise, new TypeError('You cannot resolve a promise with itself'));
    } else if (x && x.constructor === Promise) {
        if (x._status === PENDING) {
            // 分步执行
            const handler = statusHandler => value => statusHandler(promise, value);
            // 传入函数
            x.then(handler(resolve), handler(reject))
        } else if (x._status === FUFILLED) {
            fulfill(promise, x._value);
        } else if (x._status === REJECTED) {
            reject(promise, x._value);
        }
    } else if (isFunction(x) || isObject(x)) {
        let isCalled = false

        try {
            const then = x.then;
            if (isFunction(then)) {
                const handler = statusHandler => value => {
                    if (!isCalled) {
                        statusHandler(promise, value);
                    }
                    isCalled = true
                }
                then.call(x, handler(resolve), handler(reject))
            } else {
                fulfill(promise, x);
            }
        }catch(e){
            if(!isCalled){
                reject(promise, e)
            }
        }
    } else {
        fulfill(promise, x);
    }
}

const invokeCallbcak = ()=>{
    
}