var mongoose = require('./mongoose'),
  Activity = require('./../models/activity'),
  User = require('./../models/user'),
  Family = require('./../models/family'),
  Challenge = require('./../models/challenge'),
  Point = require('./../models/point'),
  // Participation = require('./../models/participation'),
  Unit = require('./../models/unit');

var iolite,
  sunstone,
  ruby,
  emerald,
  sapphire,
  topaz,
  alexandrite,
  users,
  mile,
  game, 
  feet,
  meter,
  minute,
  hour,
  hole,
  day,
  jump,
  jumpRoping,
  bikingLess5,
  bikingMore5,
  bikingElevation,
  elliptical,
  bowling,
  hiking,
  runAndWalk,
  hikingElevation,
  rowing,
  weightlifting,
  swimming,
  abs,
  runningLess10,
  sportsGame,
  fitnessClass,
  golf,
  intenseWorkout,
  surfing,
  snowboarding;

var units = [
  new Unit({
    name: 'Mile',
    abbreviation: 'mi' 
  }),
  new Unit({
    name: 'Game',
    abbreviation: 'game' 
  }),
  new Unit({
    name: 'Feet',
    abbreviation: 'ft' 
  }),
  new Unit({
    name: 'Meter',
    abbreviation: 'mm' 
  }),
  new Unit({
    name: 'Minute',
    abbreviation: 'min' 
  }),
  new Unit({
    name: 'Hour',
    abbreviation: 'hr' 
  }),
  new Unit({
    name: 'Hole',
    abbreviation: 'hole' 
  }),
  new Unit({
    name: 'Day',
    abbreviation: 'day' 
  }),
  new Unit({
    name: 'Jump',
    abbreviation: 'jump' 
  })
];

var families = [
  new Family({
    name: 'Iolite',
    motto: 'The best family',
    challengesWon: 3,
    playoffsReached: 4
  }),
  new Family({
    name: 'Alexandrite',
    motto: 'The 2nd best family',
    challengesWon: 4,
    playoffsReached: 3
  }),
  new Family({
    name: 'Sunstone',
    motto: 'A family in LPN',
    challengesWon: 5,
    playoffsReached: 2
  }),
  new Family({
    name: 'Ruby',
    motto: 'Another family in LPN',
    challengesWon: 3,
    playoffsReached: 1
  }),
  new Family({
    name: 'Sapphire',
    motto: 'Yet another family in LPN',
    challengesWon: 2,
    playoffsReached: 1
  }),
  new Family({
    name: 'Topaz',
    motto: 'A chill family in LPN',
    challengesWon: 2,
    playoffsReached: 2
  }),
  new Family({
    name: 'Emerald',
    motto: 'Almost forgot this family',
    challengesWon: 1,
    playoffsReached: 2
  })
];

var challenges = [
  new Challenge({
    name: 'Summer 2017',
    date: {
      start: new Date(),
      end:
       var nextMonth = new Date();
       nextMonth.setDate(nextMonth.getDate() + 30)
    }
  }),
  new Challenge({
    name: 'Winter 2017',
    date: {
      start: 
        var sixMonths = new Date();
        sixMonths.setDate(sixMonths.getDate() + 180),
      end:
       var sevenMonth = new Date();
       sevenMonth.setDate(sevenMonth.getDate() + 240)
    }
  }),
  new Challenge({
    name: 'Summer 2018',
    date: {
      start: 
        var nextYear = new Date();
        nextYear.setDate(nextYear.getDate() + 365),
      end:
       var nextYearMonth = new Date();
       nextYearMonth.setDate(nextYearMonth.getDate() + 415)
    }
  }),
  new Challenge({
    name: 'Summer 2016',
    date: {
      start: 
        var lastYear = new Date();
        lastYear.setDate(lastYear.getDate() - 365),
      end:
       var lastYearMonth = new Date();
       lastYearMonth.setDate(lastYearMonth.getDate() - 300)
    }
  }),
  new Challenge({
    name: 'Winter 2016',
    date: {
      start: 
        var lastYear = new Date();
        lastYear.setDate(lastYear.getDate() - 500),
      end:
       var lastYearMonth = new Date();
       lastYearMonth.setDate(lastYearMonth.getDate() - 400)
    }
  })
];

function removeModelObjs(model) {
  var promise = new Promise((resolve, reject) => {
    model.remove({}, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  })
  return promise;
}

function createObjs(arr) {
  var promise = new Promise((resolve, reject) => {
    arr.forEach(obj => {
      obj.save()
      .then(() => {
        resolve();
      })
      .catch(e => reject(e))
    })
  })
  return promise;
}

function assignFamilies() {
  var promise = new Promise((resolve, reject) => {
    Family.find()
    .then(families => {
      families.forEach(family => {
        switch (family.name) {
          case 'Iolite':
            iolite = family;
            break;
          case 'Alexandrite':
            alexandrite = family;
            break;
          case 'Sunstone':
            sunstone = family;
            break;
          case 'Ruby':
            ruby = family;
            break;
          case 'Sapphire':
            sapphire = family;
            break;
          case 'Topaz':
            topaz = family;
            break;
          case 'Emerald':
            emerald = family;
            break;
          default:
            console.log("i don't know that family");
        }
      })
      resolve();
    })
    .catch(e => reject(e));
  })
  return promise;
}

function assignUnits() {
  var promise = new Promise((resolve, reject) => {
    Unit.find()
    .then(units => {
      units.forEach(unit => {
        switch (unit.name) {
          case 'Mile':
            mile = unit;
            break;
          case 'Game':
            game = unit;
            break;
          case 'Feet':
            feet = unit;
            break;
          case 'Meter':
            meter = unit;
            break;
          case 'Minute':
            minute = unit;
            break;
          case 'Hour':
            hour = unit;
            break;
          case 'Hole':
            hole = unit;
            break;
          case 'Day':
            day = unit;
            break;
          case 'Jump':
            jump = unit;
            break;
          default:
            console.log("i don't know that unit");
        }
      })
      resolve();
    })
    .catch(e => reject(e));
  })
  return promise;
}

function assignActivities() {
  var promise = new Promise((resolve, reject) => {
    Activity.find()
    .then(activities => {
      activities.forEach(activity => {
        switch (activity.name) {
          case 'jump roping':
            jumpRoping = activity;
            break;
          case 'biking(<5 min pace)':
            bikingLess5 = activity;
            break;
          case 'biking(>5 min pace)':
            bikingMore5 = activity;
            break;
          case 'biking(elevation)':
            bikingElevation = activity;
            break;
          case 'elliptical':
            elliptical = activity;
            break;
          case 'bowling':
            bowling = activity;
            break;
          case 'hiking':
            hiking = activity;
            break;
          case 'run/walk(10-15 min pace)':
            runAndWalk = activity;
            break;
          case 'hiking(elevation)':
            hikingElevation = activity;
            break;
          case 'rowing':
            rowing = activity;
            break;
          case 'weightlifting':
            weightlifting = activity;
            break;
          case 'swimming':
            swimming = activity;
            break;
          case 'abs':
            abs = activity;
            break;
          case 'running(<10 min pace)':
            runningLess10 = activity;
            break;
          case 'sports game':
            sportsGame = activity;
            break;
          case 'fitness class':
            fitnessClass = activity;
            break;
          case 'golf':
            golf = activity;
            break;
          case 'intense workout':
            intenseWorkout = activity;
            break;
          case 'surfing':
            surfing = activity;
            break;
          case 'snowboarding':
            snowboarding = activity;
            break;
          default:
            console.log("i don't know that unit");
        }
      })
      resolve();
    })
    .catch(e => reject(e));
  })
  return promise;
}

removeModelObjs(Family)
.then(() => {
  return removeModelObjs(User);
})
.then(() => {
 return removeModelObjs(Unit);
})
.then(() => {
  return removeModelObjs(Activity);
})
.then(() => {
  return createObjs(families);
})
.then(() => {
  return assignFamilies();
})
.then(() => {
  users = [
    new User({
      email: 'edwardchow@gmail.com',
      name: {
        first: 'Edward',
        last: 'Chow',
        nickname: 'EdwardChow'
      },
      password: '123456',
      family: iolite,
      allTimePoints: 100
    }),
    new User({
      email: 'michaelwen@gmail.com',
      name: {
        first: 'Michael',
        last: 'Wen',
        nickname: 'MichaelWen'
      },
      password: '123456',
      family: topaz,
      allTimePoints: 50
    }),
    new User({
      email: 'adamwhitescarver@gmail.com',
      name: {
        first: 'Adam',
        last: 'White',
        nickname: 'AdamWhitescarver'
      },
      password: '123456',
      family: sunstone,
      allTimePoints: 3000
    }),
    new User({
      email: 'steventrinh@gmail.com',
      name: {
        first: 'Steven',
        last: 'Trinh',
        nickname: 'StevenTrinh'
      },
      password: '123456',
      family: emerald,
      allTimePoints: 2500
    }),
    new User({
      email: 'callydai@gmail.com',
      name: {
        first: 'Cally',
        last: 'Dai',
        nickname: 'CallyDai'
      },
      password: '123456',
      family: topaz,
      allTimePoints: 800
    }),
    new User({
      email: 'brittanyyoung@gmail.com',
      name: {
        first: 'Brittany',
        last: 'Young',
        nickname: 'BrittanyYoung'
      },
      password: '123456',
      family: ruby,
      allTimePoints: 20
    }),
    new User({
      email: 'patricklai@gmail.com',
      name: {
        first: 'Patrick',
        last: 'Lai',
        nickname: 'PatrickLai'
      },
      password: '123456',
      family: ruby,
      allTimePoints: 45
    }),
    new User({
      email: 'amandagieg@gmail.com',
      name: {
        first: 'Amanda',
        last: 'Gieg',
        nickname: 'AmandaGieg'
      },
      password: '123456',
      family: sapphire,
      allTimePoints: 395
    }),
    new User({
      email: 'shannonlee@gmail.com',
      name: {
        first: 'Shannon',
        last: 'Lee',
        nickname: 'ShannonLee'
      },
      password: '123456',
      family: iolite,
      allTimePoints: 298
    }),
    new User({
      email: 'stephenlee@gmail.com',
      name: {
        first: 'Stephen',
        last: 'Lee',
        nickname: 'StephenLee'
      },
      password: '123456',
      family: sunstone,
      allTimePoints: 400
    }),
    new User({
      email: 'kevinau@gmail.com',
      name: {
        first: 'Kevin',
        last: 'Au',
        nickname: 'KevinAu'
      },
      password: '123456',
      family: sapphire,
      allTimePoints: 50
    }),
    new User({
      email: 'raigovind93@gmail.com',
      name: {
        first: 'Govind',
        last: 'Rai',
        nickname: 'TBE Govind'
      },
      password: '123456',
      family: iolite,
      allTimePoints: 100,
      admin: true
    }),
    new User({
      email: 'vilde@vevatne.no',
      name: {
        first: 'Vilde',
        last: 'Vevatne',
        nickname: 'Jinese'
      },
      password: '123456',
      family: emerald,
      allTimePoints: 200,
      admin: true
    })];
  return createObjs(users);
})
.then(() => {
  return createObjs(units);
})
.then(() => {
  return assignUnits();
})
.then(() => { 
  var activities = [
    new Activity({
      name: 'jump roping',
      numberOfPoints: 1,
      scale: 150,
      unit: jump 
    }),
    new Activity({
      name: 'biking(<5 min pace)',
      numberOfPoints: 2,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: 'biking(>5 min pace)',
      numberOfPoints: 1,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: 'biking(elevation)',
      numberOfPoints: 2,
      scale: 100,
      unit: feet
    }),
    new Activity({
      name: 'elliptical',
      numberOfPoints: 2,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: 'bowling',
      numberOfPoints: 2,
      scale: 1,
      unit: game
    }),
    new Activity({
      name: 'hiking',
      description: 'outdoors on trail',
      numberOfPoints: 4,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: 'run/walk(10-15 min pace)',
      numberOfPoints: 3,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: 'hiking(elevation)',
      description: 'after initial 1000ft.',
      numberOfPoints: 1.5,
      scale: 100,
      unit: feet
    }),
    new Activity({
      name: 'rowing',
      numberOfPoints: 4,
      scale: 1500,
      unit: meter
    }),
    new Activity({
      name: 'weightlifting',
      description: 'body weight exercises like pushups, pullups etc. included',
      numberOfPoints: 4,
      scale: 15,
      unit: minute
    }),
    new Activity({
      name: 'swimming',
      numberOfPoints: 4,
      scale: 15,
      unit: minute
    }),
    new Activity({
      name: 'abs',
      description: 'not in class',
      numberOfPoints: 4,
      scale: 15,
      unit: minute
    }),
    new Activity({
      name: 'running(<10 min pace)',
      numberOfPoints: 4,
      scale: 1,
      unit: mile
    }),
    new Activity({
      name: 'sports game',
      description: 'basketball, volleyball, badminton, etc. (actual game, not just warming up)',
      numberOfPoints: 6,
      scale: 30,
      unit: minute
    }),
    new Activity({
      name: 'fitness class',
      description: 'pilates, yoga, zumba, rock climbing, martial arts etc.',
      numberOfPoints: 8,
      scale: 1,
      unit: hour
    }),
    new Activity({
      name: 'golf',
      numberOfPoints: 12,
      scale: 9,
      unit: hole
    }),
    new Activity({
      name: 'intense workout',
      description: 'p90x, parkour, cycling class, crossfit',
      numberOfPoints: 12,
      scale: 30,
      unit: minute
    }),
    new Activity({
      name: 'surfing',
      numberOfPoints: 12,
      scale: 1,
      unit: hour
    }),
    new Activity({
      name: 'snowboarding',
      numberOfPoints: 15,
      scale: 0.5,
      unit: day
    })
  ];
  return createObjs(activities);
})
.then(() => {
  return assignActivities();
})
.catch(e => console.log(e))


    //,
    // {
    //   email: 'aileenju@gmail.com',
    //   name: {
    //     first: 'Aileen',
    //     last: 'Ju',
    //     nickname: 'AileenJu'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'ivanwoo@gmail.com',
    //   name: {
    //     first: 'Ivan',
    //     last: 'Woo',
    //     nickname: 'IvanWoo'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'sophiaduong@gmail.com',
    //   name: {
    //     first: 'Sophia',
    //     last: 'Duong',
    //     nickname: 'SophiaDuong'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'harrisonhuang@gmail.com',
    //   name: {
    //     first: 'Harrison',
    //     last: 'Huang',
    //     nickname: 'HarrisonHuang'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'emilyrong@gmail.com',
    //   name: {
    //     first: 'Emily',
    //     last: 'Rong',
    //     nickname: 'EmilyRong'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'irischan@gmail.com',
    //   name: {
    //     first: 'Iris',
    //     last: 'Chan',
    //     nickname: 'IrisChan'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'michellele@gmail.com',
    //   name: {
    //     first: 'Michelle',
    //     last: 'Le',
    //     nickname: 'MichelleLe'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'jackiesiu@gmail.com',
    //   name: {
    //     first: 'Jackie',
    //     last: 'Siu',
    //     nickname: 'JackieSiu'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'scotthenry@gmail.com',
    //   name: {
    //     first: 'Scott',
    //     last: 'Henry',
    //     nickname: 'ScottHenry'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'artreyes@gmail.com',
    //   name: {
    //     first: 'Art',
    //     last: 'Reye,
    //     nickname: 'Art'sRey'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'eliselin@gmail.com',
    //   name: {
    //     first: 'Elise',
    //     last: 'Lin',
    //     nickname: 'EliseLin'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'calvinchan@gmail.com',
    //   name: {
    //     first: 'Calvin',
    //     last: 'Chan',
    //     nickname: 'CalvinChan'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'kurtkline@gmail.com',
    //   name: {
    //     first: 'Kurt',
    //     last: 'Kline,
    //     nickname: 'Kurt'Klin'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'shoumyodewan@gmail.com',
    //   name: {
    //     first: 'Shoumyo',
    //     last: 'Dewan',
    //     nickname: 'ShoumyoDewan'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'andypark@gmail.com',
    //   name: {
    //     first: 'Andy',
    //     last: 'Park',
    //     nickname: 'AndyPark'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'parthdhingreja@gmail.com',
    //   name: {
    //     first: 'Parth',
    //     last: 'Dhingr,
    //     nickname: 'Parth'ejaDhing'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'trinhtruong@gmail.com',
    //   name: {
    //     first: 'Trinh',
    //     last: 'Truong,
    //     nickname: 'Trinh'Truon'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'christinatruong@gmail.com',
    //   name: {
    //     first: 'Christina',
    //     last: 'Truong',
    //     nickname: 'ChristinaTruong'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'richardperez@gmail.com',
    //   name: {
    //     first: 'Richard',
    //     last: 'Perez',
    //     nickname: 'RichardPerez'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'vivianmai@gmail.com',
    //   name: {
    //     first: 'Vivian',
    //     last: 'Mai',
    //     nickname: 'VivianMai'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'henryhe@gmail.com',
    //   name: {
    //     first: 'Henry',
    //     last: 'He',
    //     nickname: 'HenryHe'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'annatran@gmail.com',
    //   name: {
    //     first: 'Anna',
    //     last: 'Tran',
    //     nickname: 'AnnaTran'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'ryanteo@gmail.com',
    //   name: {
    //     first: 'Ryan',
    //     last: 'Teo',
    //     nickname: 'RyanTeo'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'vinayakdhingreja@gmail.com',
    //   name: {
    //     first: 'Vinayak',
    //     last: 'Dhingrej,
    //     nickname: 'Vinayak'aDhingre'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'tracylam@gmail.com',
    //   name: {
    //     first: 'Tracy',
    //     last: 'Lam',
    //     nickname: 'TracyLam'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'michaelho@gmail.com',
    //   name: {
    //     first: 'Michael',
    //     last: 'Ho',
    //     nickname: 'MichaelHo'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'staceyli@gmail.com',
    //   name: {
    //     first: 'Stacey',
    //     last: 'Li',
    //     nickname: 'StaceyLi'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'andrewkuo@gmail.com',
    //   name: {
    //     first: 'Andrew',
    //     last: 'Kuo',
    //     nickname: 'AndrewKuo'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'jaytsui@gmail.com',
    //   name: {
    //     first: 'Jay',
    //     last: 'Tsui,
    //     nickname: 'Jay'Tsu'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'nicoperez@gmail.com',
    //   name: {
    //     first: 'Nico',
    //     last: 'Perez,
    //     nickname: 'Nico'Pere'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },
    // {
    //   email: 'ireneear@gmail.com',
    //   name: {
    //     first: 'Irene',
    //     last: 'Ear',
    //     nickname: 'IreneEar'
    //   },
    //   password: '123456',
    //   family: '',
    //   allTimePoints:

    // },