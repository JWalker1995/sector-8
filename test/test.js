require('../js/closure-library/closure/goog/bootstrap/nodejs.js');
require('../public/deps.js');

var assert = require('assert');
/*
  fail: [Function: fail],
  ok: [Circular],
  equal: [Function: equal],
  notEqual: [Function: notEqual],
  deepEqual: [Function: deepEqual],
  notDeepEqual: [Function: notDeepEqual],
  strictEqual: [Function: strictEqual],
  notStrictEqual: [Function: notStrictEqual],
  throws: [Function],
  doesNotThrow: [Function],
  ifError: [Function]
*/

var rand_unbounded = function(decay)
{
    var i = 0;
    while (Math.random() < decay) {i++;}
    return i;
};

goog.require('util.gate');
suite('util.gate', function()
{
    setup(function()
    {
    });

    var opens = 2 + rand_unbounded(.5);
    var inst;
    test('instantiation', function()
    {
        inst = new util.gate(opens);
    });
    
    test('pass a callback and call open ' + opens + ' times', function(callback)
    {
        var opens_called = 0;
        inst.pass(function()
        {
            if (opens_called === opens)
            {
                callback();
            }
            else
            {
                callback('callback passed after incorrect opens: called ' + opens_called + ' times, expected ' + opens);
            }
        })();
        
        var call = function()
        {
            opens_called++;
            inst.open();
            
            if (opens_called < opens + 4)
            {
                setTimeout(call, 10);
            }
        };
        call();
    });
    
    test('bind scope and argument of callback', function(callback)
    {
        var bound = function(){};
        
        var func = function(arg)
        {
            if (arguments.length !== 1)
            {
                callback('callback passed with incorrect number of arguments: ' + arguments.length);
            }
            else if (arg !== 42)
            {
                callback('callback passed with incorrect argument: ' + arg.toString());
            }
            else if (this !== bound)
            {
                callback('callback passed with incorrect this: ' + this.toString());
            }
            else
            {
                callback();
            }
        };
        
        var inst = new util.gate(1);
        inst.pass(func.bind(bound, 42))();
        inst.open();
    });
});

goog.require('sector8.order');
suite('sector8.order', function()
{
    setup(function()
    {
    });

    var inst;
    test('instantiation', function()
    {
        inst = new sector8.order();
    });
    
    var parse_tests = {
        'D :20+2-4 #f5 .012457 @4': [4, 20, 2, 4, 6, 5, parseInt('10110111', 2), 4],
        'Z:15+7-2#a2.6@6': [26, 15, 7, 2, 1, 2, parseInt('01000000', 2), 6]
    };

    for (var str in parse_tests)
    {
        test('parse "' + str + '"', (function(str)
        {
            inst.from_notation(str);

            assert.equal(inst.get_player(), parse_tests[str][0]);
            assert.equal(inst.get_turn(), parse_tests[str][1]);
            assert.equal(inst.get_wait(), parse_tests[str][2]);
            assert.equal(inst.get_duration(), parse_tests[str][3]);
            assert.equal(inst.get_col(), parse_tests[str][4]);
            assert.equal(inst.get_row(), parse_tests[str][5]);
            assert.equal(inst.get_sectors(), parse_tests[str][6]);
            assert.equal(inst.get_direction(), parse_tests[str][7]);
        }).bind(null, str));
    }
    
    var stringify_tests = {
        'D :20+2-4 #f5 .012457 @4': [4, 20, 2, 4, 5, 4, parseInt('10110111', 2), 4, true],
        'D:20+2-4#f5.012457@4': [4, 20, 2, 4, 5, 4, parseInt('10110111', 2), 4, false]
    };
    
    for (var str in stringify_tests)
    {
        test('stringify "' + str + '"', (function(str)
        {
            inst.set_player(stringify_tests[str][0]);
            inst.set_turn(stringify_tests[str][1]);
            inst.set_wait(stringify_tests[str][2]);
            inst.set_duration(stringify_tests[str][3]);
            inst.set_col(stringify_tests[str][4]);
            inst.set_row(stringify_tests[str][5]);
            inst.set_sectors(stringify_tests[str][6]);
            inst.set_direction(stringify_tests[str][7]);
            
            var pretty = stringify_tests[str][8];
            assert.equal(inst.to_notation(pretty), str);
        }).bind(null, str));
    }
});
