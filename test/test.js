require('../js/closure-library/closure/goog/bootstrap/nodejs.js');
require('../js/deps.js');

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

goog.require('util.gate');


var rand_unbounded = function(decay)
{
    var i = 0;
    while (Math.random() < decay) {i++;}
    return i;
};

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
