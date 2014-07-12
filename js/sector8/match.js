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

    /*
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
    */

    
    var orders = [];
    var boards = [];
    var sectoids = [];
    var moves = [];

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
    
    this.load_boards = function()
    {
        goog.asserts.assert(orders[0].length === 0);

        var board = this.get_map().get_board();
        
        var turn = 0;
        while (turn < orders.length)
        {
            board = boards[turn] = board.clone();
            apply_orders(turn, board);
            apply_moves(turn, board);

            turn++;
        }
    };

    var apply_orders = function(turn, board)
    {
        var powered_map = cur_board.make_powered_map();

        var i = 0;
        while (i < orders[turn].length)
        {
            var order = orders[turn][i];
            i++;

            var order_error = order.error_msg(/*config*/);
            if (order_error)
            {
                // There's a problem with the order
                // Log order_error
                continue;
            }

            var row = order.get_row();
            var col = order.get_col();
            var cell = board[row][col];
            var sectoid = cell.get_sectoid();

            if (!sectoid)
            {
                // Tried to order an empty cell
                // Log error
                continue;
            }

            if (order.get_player() !== cell.get_territory())
            {
                // Tried to order a sectoid on another player's territory
                // Log error
                continue;
            }

            if (!powered_map[row][col])
            {
                // Tried to order a sectoid on an unpowered cell
                // Log error
                continue;
            }

            var min_turn = turn + order.get_wait();
            var max_turn = min_turn + order.get_duration();
            while (moves.length < max_turn) {moves.push([]);}

            var move = {
                'sectoids': [sectoid],
                'sectors': order.get_sectors(),
                'direction': order.get_direction()
            };

            while (min_turn < max_turn)
            {
                moves[min_turn].push(move);
                min_turn++;
            }
        }
    };

    var apply_moves = function(turn, board)
    {
        while (typeof moves[turn] === 'undefined') {moves.push([]);}

        var i = 0;
        while (i < moves[turn].length)
        {
            var move = moves[turn][i];

            sectors[]



            var move_turn = turn + order.get_wait();

            /*
            'player': 0,
            'turn': 0,
            'wait': 0,
            'duration': 0,
            'col': 0,
            'row': 0,
            'sectors': 0,
            'direction': 0
            */
            
            var source = cur_board[order.get_col()][order.get_row()];

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