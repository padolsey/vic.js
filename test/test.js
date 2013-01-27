

test('vic', function() {

	test('Signatures', function() {
		var m;
		test('Basic', function() {
			test('No grouping', function() {
				expect(vic(/\w/)('a')).toEqual([]);
			});
			test('With grouping', function() {
				expect(vic(/(\w)/)('a')).toEqual(['a']);
			});
		});
		test('With a single group handler', function() {
			m = vic(/(\d)(\w)(\d)/, function(v) {
				return v !== 'a' && v !== '4' && v;
			}, vic.join(''));
			expect(m('1b2')).toBe('1b2');
			expect(m('1a2')).toBe(false);
			expect(m(' 9f5 ::')).toBe('9f5');
			expect(m('4p6')).toBe(false);
			expect(m('3p6')).toBe('3p6');
		});
		test('With a per-group handler', function() {
			m = vic(/(\d):(\w):(\d)/, {
				1: function(v) {
					return v > 5 && v;
				},
				3: 1
			}, vic.join(''));
			expect(m('1:b:2')).toBe(false);
			expect(m('7:b:6')).toBe('7b6');
			expect(m('5:b:6')).toBe(false);
			expect(m('6:b:5')).toBe(false);
			expect(m('9:b:7')).toBe('9b7');
			expect(m('9:z:7')).toBe('9z7');
		});
		test('Per-group handlers with supported functions', function() {
			m = vic(/^\s*(-?[\d.]+)(\s+\w+)/, {
				1: vic.numerical(),
				2: vic.lower()
			}, vic.join(''));
			expect(m('....')).toBe(false);
			expect(m('9.3.2 a')).toBe(false);
			expect(m('9-2 a')).toBe(false);
			expect(m('--2 a')).toBe(false);

			expect(m('.2 aNoTher')).toBe('.2 another');
			expect(m('-.2 Bb')).toBe('-.2 bb');
			expect(m('0.2 c')).toBe('0.2 c');
		});
	});

	test('Date example', function() {

		var dateMatcher = vic(/^\s*(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{1,4})\s*$/, {
		    1: vic.pad('00'),
		    2: vic.pad('00'),
		    3: vic.pad('2000')
		}, function(v) {
		  return v.join('.');
		});

		expect(dateMatcher('a')).toBe(false);
		expect(dateMatcher(123)).toBe(false);
		expect(dateMatcher(false)).toBe(false);
		expect(dateMatcher(null)).toBe(false);
		expect(dateMatcher('a-b-c')).toBe(false);
		expect(dateMatcher('1-2-39281')).toBe(false);
		expect(dateMatcher('-2-39281')).toBe(false);
		expect(dateMatcher('4-2-3-1')).toBe(false);
		expect(dateMatcher('114-222-3012')).toBe(false);
		expect(dateMatcher('1:2:3')).toBe(false);
		expect(dateMatcher('1_2-3')).toBe(false);

		expect(dateMatcher('3-2-1')).toBe('03.02.2001');
		expect(dateMatcher('11-22-33')).toBe('11.22.2033');
		expect(dateMatcher('1-2-222')).toBe('01.02.2222');
		expect(dateMatcher('9-99-9')).toBe('09.99.2009');
		expect(dateMatcher('1/2/3')).toBe('01.02.2003');
		expect(dateMatcher('1/2-3424')).toBe('01.02.3424');
		expect(dateMatcher('1-2-1')).toBe('01.02.2001');
		expect(dateMatcher('0/0/0')).toBe('00.00.2000');

	});

	test('Date YYYY-MM-DD Exact validation', function() {

		var dateMatcher = vic(/^\s*(\d{1,4})[.\/,: -](\d{1,2})[.\/,: -](\d{1,2})\s*$/, {
		    1: function(year) {
		    	return vic.pad(year >= 50 && year <= 99 ? '1900' : '2000' )(year);
		    },
		    2: function(month) {
		    	return month >= 1 && month <= 12 && vic.pad('00')(month);
		    },
		    3: function(day, i, all) {
		    	return day > 0 && day <= new Date(all[1], all[2], 0).getDate() && vic.pad('00')(day);
		    }
		}, function(v) {
		  return v.join('-');
		});

		expect(dateMatcher('111')).toBe(false);
		expect(dateMatcher('2/3/4/5')).toBe(false);
		expect(dateMatcher('16.332.2')).toBe(false);
		expect(dateMatcher('20  1  20')).toBe(false);
		expect(dateMatcher('  1999.7.0')).toBe(false);
		expect(dateMatcher('1999.0.1')).toBe(false);

		expect(dateMatcher('1999.9.32')).toBe(false);
		expect(dateMatcher('1999.2.28')).toBe('1999-02-28');
		expect(dateMatcher('1999.2.31')).toBe(false); // no 31 in feb!

		expect(dateMatcher('1.1.1')).toBe('2001-01-01');
		expect(dateMatcher('1956.3.2')).toBe('1956-03-02');
		expect(dateMatcher('16.03-2')).toBe('2016-03-02');
		expect(dateMatcher(' 20 1 20 ')).toBe('2020-01-20');
		expect(dateMatcher('1999.7.31')).toBe('1999-07-31');

	});

	test('IP example', function() {

		var ipMatcher = vic(/^\s*(\d{1,3})(?:\.)(\d{1,3})(?:\.)(\d{1,3})(?:\.)(\d{1,3})\s*$/, function(n) {
			return +n >= 0 && +n < 256 && vic.pad('000')(n);
		}, function(v) {
		  return v.join('#'); // custom separator
		});

		expect(ipMatcher('a')).toBe(false);
		expect(ipMatcher(123)).toBe(false);
		expect(ipMatcher(false)).toBe(false);
		expect(ipMatcher(null)).toBe(false);
		expect(ipMatcher('a-b-c')).toBe(false);
		expect(ipMatcher('1-2-39281')).toBe(false);
		expect(ipMatcher('111-222-222-111')).toBe(false);
		expect(ipMatcher('000.222.1123.321')).toBe(false);
		expect(ipMatcher('000.222.113.321')).toBe(false);
		expect(ipMatcher('1333.2.333.444')).toBe(false);
		expect(ipMatcher('1.2.3.256')).toBe(false);

		expect(ipMatcher('1.2.3.255')).toBe('001#002#003#255');
		expect(ipMatcher('001.222.123.255')).toBe('001#222#123#255');
		expect(ipMatcher('1.2.3.4')).toBe('001#002#003#004');
		expect(ipMatcher('192.168.4.2')).toBe('192#168#004#002');
		expect(ipMatcher('  192.168.4.2    ')).toBe('192#168#004#002');
		expect(ipMatcher('192.168.4.2    ')).toBe('192#168#004#002');
		expect(ipMatcher(' 192.168.4.2')).toBe('192#168#004#002');

	});

	test('Simple Name example', function() {

		var nameMatcher = vic(/^\s*([A-Za-z]+)\s*$/, null, vic.join(''));

		expect(nameMatcher('123')).toBe(false);
		expect(nameMatcher('a b c')).toBe(false);
		expect(nameMatcher('Not Simple')).toBe(false);

		expect(nameMatcher('Adam')).toBe('Adam');
		expect(nameMatcher(' Adam')).toBe('Adam');
		expect(nameMatcher('  Adam ')).toBe('Adam');
		expect(nameMatcher(' Adam   	     ')).toBe('Adam');

		expect(nameMatcher('jojojojJojojo')).toBe('jojojojJojojo');

	});

	test('Year - simple', function() {
		var yearVic = vic(/^\s*(\d{1,4})/, function(year) {
		  return vic.pad(year > 13 && year <= 99 ? '1900' : '2000' )(year);
		}, Number);
		expect(yearVic('2012')).toBe(2012);
		expect(yearVic('99')).toBe(1999);
		expect(yearVic('56')).toBe(1956);
		expect(yearVic('14')).toBe(1914);
		expect(yearVic('13')).toBe(2013);
		expect(yearVic('1')).toBe(2001);
		expect(yearVic('foo2012')).toBe(false);
		expect(yearVic('  209 ..')).toBe(2209);
	});

	test('Name + lower', function() {
		var nameToLower = vic(/^([a-zA-Z]+)$/, vic.lower(), vic.join(''));

		expect(nameToLower('534534')).toBe(false);
		expect(nameToLower('an409')).toBe(false);

		// Values are cast to strings:
		expect(nameToLower(null)).toBe('null');

		expect(nameToLower('Adam')).toBe('adam');
		expect(nameToLower('JoHn')).toBe('john');
		expect(nameToLower('aAzZZ')).toBe('aazzz');

	});

	test('Global flag -- extracting and padding numbers', function() {

		var getAndPadNumbers = vic(/\d+/g, vic.pad('000'));

		expect(getAndPadNumbers('test')).toBe(false);

		expect(getAndPadNumbers('test 123 for this 5 thi7ng 83')).toEqual(['123', '005', '007', '083']);
		expect(getAndPadNumbers(' 1 2 __ 3 lk')).toEqual(['001', '002', '003']);

	});

});
