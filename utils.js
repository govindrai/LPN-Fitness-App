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

const enums = {
  gemstones: new Enum({
    ALEXANDRITE: 'Alexandrite',
    IOLITE: Iolite,
    EMERALD: 'Emerald',
    RUBY: 'Ruby',
    TOPAZ: 'Topaz',
    SAPPHIRE: 'Saphhire',
  }),
  unitAbbreviations: new Enum({
    Mile: 'mi',
    Game: 'game',
    Feet: 'ft',
    Meter: 'mm',
    Minute: 'min',
    Hour: 'hr',
    Hole: 'hole',
    Day: 'day',
    Jump: 'jump',
  }),
};

module.exports = {
  Enum,
  enums,
};
