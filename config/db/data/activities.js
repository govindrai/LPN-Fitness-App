// App Modules
const utils = require('../../../utils/utils');

const { units } = utils.enums;

// Note: unitName property needs to be replaced with the required unit property with the unit's _id.
// Logic is handled in the seed job.
module.exports = [
  {
    name: 'Jump roping',
    points: 1,
    scale: 150,
    unitName: units.JUMP.name,
  },
  {
    name: 'Biking(<5 min pace)',
    points: 2,
    scale: 1,
    unitName: units.MILE.name,
  },
  {
    name: 'Biking(>5 min pace)',
    points: 1,
    scale: 1,
    unitName: units.MILE.name,
  },
  {
    name: 'Biking(elevation)',
    points: 2,
    scale: 100,
    unitName: units.FOOT.name,
  },
  {
    name: 'Elliptical',
    points: 2,
    scale: 1,
    unitName: units.MILE.name,
  },
  {
    name: 'Bowling',
    points: 2,
    scale: 1,
    unitName: units.GAME.name,
  },
  {
    name: 'Hiking',
    description: 'outdoors on trail',
    points: 4,
    scale: 1,
    unitName: units.MILE.name,
  },
  {
    name: 'Run/walk(10-15 min pace)',
    points: 3,
    scale: 1,
    unitName: units.MILE.name,
  },
  {
    name: 'Hiking(elevation)',
    description: 'after initial 1000ft.',
    points: 1.5,
    scale: '100',
    unitName: units.FOOT.name,
  },
  {
    name: 'Rowing',
    points: 4,
    scale: 1500,
    unitName: units.METER.name,
  },
  {
    name: 'Weightlifting',
    description: 'bodyweight exercises like pushups, pullups etc. included',
    points: 4,
    scale: 15,
    unitName: units.MINUTE.name,
  },
  {
    name: 'Swimming',
    points: 4,
    scale: 15,
    unitName: units.MINUTE.name,
  },
  {
    name: 'Abs',
    description: 'not in class',
    points: 4,
    scale: 15,
    unitName: units.MINUTE.name,
  },
  {
    name: 'Running(<10 min pace)',
    points: 4,
    scale: 1,
    unitName: units.MILE.name,
  },
  {
    name: 'Sports game',
    description: 'basketball, volleyball, badminton, etc. (actual game, not just warming up)',
    points: 6,
    scale: 30,
    unitName: units.MINUTE.name,
  },
  {
    name: 'Fitness class',
    description: 'pilates, yoga, zumba, rock climbing, martial arts etc.',
    points: 8,
    scale: 1,
    unitName: units.HOUR.name,
  },
  {
    name: 'Golf',
    points: 12,
    scale: 9,
    unitName: units.HOLE.name,
  },
  {
    name: 'Intense workout',
    description: 'p90x, parkour, cycling class, crossfit',
    points: 12,
    scale: 30,
    unitName: units.MINUTE.name,
  },
  {
    name: 'Surfing',
    points: 12,
    scale: 1,
    unitName: units.HOUR.name,
  },
  {
    name: 'Snowboarding',
    points: 15,
    scale: 0.5,
    unitName: units.DAY.name,
  },
];
