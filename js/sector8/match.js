goog.provide('sector8.match');

sector8.match = function()
{
    goog.asserts.assertInstanceof(this, sector8.match);

    var props = {
        'match_id': 0,
        'name': '',
        'players': Array,
        'map': sector8.map,
        'turn_type': 0,
        'timer_type': 0,
        'spectators': true,
        'orders': Array,
        'stakes': 1.0,
        'start_date': Date,
        'end_date': Date
    };

    util.make_getters_setters(this, props);

    this.get_id = this.get_match_id;
    
    this.generate_colors = function()
    {
        var randomcolor = require('randomcolor');
        
        var c = this.get_players().length;
        var colors = randomcolor({
            'count': c
        });
        
        var i = 0;
        while (i < c)
        {
            var color = parseInt(colors[i].substr(1), 16);
            this.get_players()[i].set_color(color)
            i++;
        }
    };
    
    this.from_notation = function(str)
    {
        var move = 0;
        var num_players = this.get_players().length;
        
        var regex = /^\s*([A-Z])?\s*(?:\+(\d+)(?:-(\d+))?\s*)?:([a-z])(\d+)(?:\.(\d+))?\s*@(?:x|(\d+)(?:\*(\d+))?)\s*$/;
        var exec;
        while (exec = regex.exec(str))
        {
            if (exec[1])
            {
                var player = exec[1].charCodeAt(0) - 'A'.charCodeAt(0);
                if (player !== move % num_players) {return false;}
            }
            
            var order = new sector8.order();
            order.set_min_turn(move + parseInt(exec[1]));
        }
        
        if (match)
        {
            this.set_min_turn(turn + parseInt(match[1]));
            this.set_max_turn(turn + parseInt(match[2]));
            this.set_
        }
        {
            match[1]
            '2',
  '4',
  'b',
  '5',
  '01245',
  '4',
  '3',
        }
        // A +2-4 :b5.01245 @4*3
        
    };
};

sector8.cell = function()
{
    goog.asserts.assertInstanceof(this, sector8.cell);

    var props = {
        'void': false,
        'territory': 0,
        'permanent': false,
        'sectoid': sector8.sectoid
    };

    util.make_getters_setters(this, props);
};

sector8.sectoid = function()
{
    goog.asserts.assertInstanceof(this, sector8.sectoid);

    var props = {
        'x': 0,
        'y': 0,
        'prime': false,
        'sectors': 0
    };

    util.make_getters_setters(this, props);
};

sector8.order = function()
{
    goog.asserts.assertInstanceof(this, sector8.order);

    var props = {
        'player': 0,
        'sectoid': sector8.sectoid,
        'min_turn': 0,
        'max_turn': 0,
        'sectoids': 0,
        'direction': 0,
        'distance': 0
    };

    util.make_getters_setters(this, props);
};
    
sector8.player = function()
{
    goog.asserts.assertInstanceof(this, sector8.player);

    var props = {
        'id': 0,
        'color': 0,
        'time': 0
    };

    util.make_getters_setters(this, props);
};

/*

// Move the N, NE, E, S, and SW sectors of the piece currently on b5 south in 2, 3, and 4 turns
+2-4:b5.01245:4

// Cancel the orders of all sectors of the piece on b5
:b5:

Turns: 11
Cell X: 25
Cell Y: 25
Sectors: 256
Dir: 9


Match creation options:
    Map
    Turn type (parallel, serial)
    Timer type (hourglass, per-turn, per-game)
    Shadow match (if yes, then a player can only see cells consecutive to his territory)
    Spectators
*/