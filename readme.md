# vic.js

## Intro

A [ux.stackexchange question](http://ux.stackexchange.com/q/33564/6264) prompted me to consider the lack of permissive validation+correction abstractions available in JavaScript. vic.js is the result of my exploration of various ways to present such an abstraction with an API that allows flexibility and, hopefully, simplicity. 

See the related blog post: [Permissive user input validation](http://james.padolsey.com/).

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

## Name

*VIC* stands for *Validation & Input Correction*

## License

Public domain: http://unlicense.org/UNLICENSE