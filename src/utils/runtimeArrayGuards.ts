/**
 * Emergency safety guard:
 * Some restored legacy UI code expects arrays but sometimes receives objects
 * from cached localStorage/API state. Instead of crashing the whole React app
 * with "x.some is not a function", this makes object.some(...) safely return
 * a boolean using Object.values(...).
 *
 * This does not change the design. It only prevents a white-screen crash.
 */

declare global {
  interface Object {
    some?: any;
  }
}

const proto: any = Object.prototype;

if (!proto.__jamiaatiSomeGuardInstalled) {
  Object.defineProperty(proto, '__jamiaatiSomeGuardInstalled', {
    value: true,
    enumerable: false,
    configurable: true,
  });

  if (typeof proto.some !== 'function') {
    Object.defineProperty(proto, 'some', {
      value: function(callback: any, thisArg?: any) {
        try {
          if (Array.isArray(this)) {
            return Array.prototype.some.call(this, callback, thisArg);
          }

          if (this && typeof callback === 'function') {
            return Object.values(this).some(callback, thisArg);
          }

          return false;
        } catch {
          return false;
        }
      },
      enumerable: false,
      configurable: true,
      writable: true,
    });
  }
}

export {};
