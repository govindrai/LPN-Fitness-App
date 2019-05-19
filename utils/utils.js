const units = require('../config/db/data/units');
const families = require('../config/db/data/families');

// Wraps an express request handler to enable async/await syntax inside request handlers
// without the need to add a try/catch block for every request handler
function wrap(fn) {
  return function wrappedFunction(...args) {
    return fn(...args).catch(args[2]);
  };
}

class Enum {
  constructor(enumObj) {
    const handler = {
      get(target, name) {
        if (target[name]) {
          return target[name];
        }
        throw new Error(`No such enumerator: ${name}`);
      },
      set() {
        throw new Error('Cannot add/update properties on an Enum instance after it is defined');
      },
    };

    return new Proxy(enumObj, handler);
  }
}

function createUnitsEnum() {
  const temp = {};
  units.forEach(unit => {
    temp[unit.name.toUpperCase()] = unit;
  });
  return new Enum(temp);
}

function createFamiliesEnum() {
  const temp = {};
  families.forEach(family => {
    temp[family.name.toUpperCase()] = family.name;
  });
  return new Enum(temp);
}

const enums = {
  families: createFamiliesEnum(),
  units: createUnitsEnum(),
};

module.exports = {
  Enum,
  enums,
  wrap,
};
