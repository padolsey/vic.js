# vic.js

## Intro

A [ux.stackexchange question](http://ux.stackexchange.com/q/33564/6264) prompted me to consider the lack of permissive validation+correction abstractions available in JavaScript. vic.js is the result of my exploration of various ways to present such an abstraction with an API that allows flexibility and, hopefully, simplicity. 

See the related blog post: [Permissive user input validation](http://james.padolsey.com/javascript/permissive-user-input-validation/).

It's small, simple and tested.

## Usage

```js
vic(
  REGEXP_PATTERN_WITH_GROUPS, // RegExp
  PER_GROUP_PROCESSOR,        // Optional Object|Function
  POST_PROCESSOR              // Optional Function
);
```

Vic returns false for invalid input. Valid input will make it return a string OR whatever your POST_PROCESSOR produces.

An example: Validating and correcting a year in the form Y, YY, YYY, or YYYY:

```js
var yearVic = vic(
  /^\s*(\d{1,4})\s*$/,
  function(year) {
    // Let's assume anything between 14 and 99 is from the 1900s:
    // (what you do here DEPENDS on the meaning of the data for YOU!) -- don't just copy/paste
    return vic.pad(year > 13 && year <= 99 ? '1900' : '2000' )(year);
  },
  Number // cast full output to a Number
);

yearVic('2012');   // => 2012
yearVic('01');     // => 2001
yearVic('hd2kd9'); // => false
yearVic('20021');  // => false
yearVic('96');     // => 1996
yearVic('  4');    // => 2004
yearVic('113');    // => 2113
```

Vic has some helpers, each of these is a helper function factory -- so you must call each to get the actual function helper:

 * `vic.lower()` => Outputs input.toLowerCase()
 * `vic.upper()` => Outputs input.toUpperCase()
 * `vic.numerical()` => Validates and outputs numeric input as String(Number)
 * `vic.pad(padding)` => Outputs padded string
 * `vic.join(sep)` => Joins an array with the specified separator

e.g.

```js
var nameToLower = vic(/^([a-zA-Z]+)$/, vic.lower(), vic.join(''));
nameToLower('123');  // => false
nameToLower('b1a3'); // => false
nameToLower('aZZz'); // => 'azzz'
nameToLower('Adam'); // => 'adam'

var integerPadder = vic(/^(\d+)$/, vic.pad('000000'), vic.join(''));
integerPadder('a91');    // => false
integerPadder('1');      // => '000001'
integerPadder(209);      // => '000209'
integerPadder(12345678); // => '12345678'
integerPadder(1189);     // => '001189'
```

Vic can also be used for for extracting and validating individual matches from large strings. You do this using a global flag on your regular expression. For example:

```js
var getAndPadNumbers = vic(/\d+/g, vic.pad('000'));

getAndPadNumbers('test'); // => false
getAndPadNumbers(' invalid ... no numbers'); // => false

getAndPadNumbers('test 123 for this 5 thi7ng 83'); // => ['123', '005', '007', '083']
getAndPadNumbers(' 1 2 __ 3 lk'); // => ['001', '002', '003']
```

A more advanced example using all of Vic's features validates dates in the form YYYY-MM-DD:

```js
var vicDate = vic(/^\s*(\d{1,4})[.\/,: -](\d{1,2})[.\/,: -](\d{1,2})\s*$/, {
    1: function(year) {
      // Year between 50 and 99 assumed to be '19YY', otherwise presumed after 2000
      return vic.pad(year >= 50 && year <= 99 ? '1900' : '2000' )(year);
    },
    2: function(month) {
      return month >= 1 && month <= 12 && vic.pad('00')(month);
    },
    3: function(day, i, all) {
      // Check that there are {day} amount of days in the entered month:
      return day > 0 &&
        day <= new Date(all[1], all[2], 0).getDate() &&
        vic.pad('00')(day);
    }
}, function(v) {
  return v.join('-');
});

vicDate('111');       // => false
vicDate('2/3/4/5');   // => false
vicDate('16.332.2');  // => false
vicDate('20  1  20'); // => false
vicDate(' 1999.7.0'); // => false
vicDate('1999.0.1');  // => false

vicDate('1999.9.32'); // => false (no 32 in Sept)
vicDate('1999.2.28'); // => '1999-02-28'
vicDate('1999.2.31'); // => false (no 31 in Feb)

vicDate('1.1.1');     // => '2001-01-01'
vicDate('1956.3.2');  // => '1956-03-02'
vicDate('16.03-2');   // => '2016-03-02'
vicDate(' 20 1 20 '); // => '2020-01-20'
vicDate('1999.7.31'); // => '1999-07-31'
```

## Name

*VIC* stands for *Validation & Input Correction*

## License

Public domain: http://unlicense.org/UNLICENSE