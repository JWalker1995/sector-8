goog.provide('sector8.match');

goog.require('goog.asserts');
goog.require('util.make_getters_setters');

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
    
    var orders = [];
    this.load_orders = function(str)
    {
        var tmp_order = new sector8.order();
        
        var lines = str.split(/,|\r|\n/);
        var i = 0;
        while (i < lines)
        {
            if (tmp_order.from_notation(lines[i]))
            {
                var turn = tmp_order.get_turn();
                while (typeof orders[turn] === 'undefined') {orders.push([]);}
                orders[turn].push(tmp_order);
                tmp_order = new sector8.order();
            }
            i++;
        }
    };
    
    var board_states = [];
    this.load_board_states = function()
    {
        board_states[0] = this.get_map().get_cells();
        
        var i = 0;
        while (i < orders.length)
        {
            var j = 0;
            var d = orders[i].length;
            while (j < d)
            {
                orders[i][j];
                j++;
            }
            i++;
        }
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
        'prime': false,
        'sectors': 0
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