const units = require('./config/db/data/units');
const families = require('./config/db/data/families');

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
    [temp[unit.name.toUpperCase()]] = unit;
  });
  return new Enum(temp);
}

function createFamiliesEnum() {
  const temp = {};
  families.forEach(family => {
    [temp[family.name.toUpperCase]] = family.name;
  });
}

const enums = {
  families: createFamiliesEnum(),
  units: createUnitsEnum(),
};

module.exports = {
  Enum,
  enums,
};
