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
        'move_after': 0,
        'move_where': 0,
        'timer_type': 0,
        'spectators': true,
        'orders': Array,
        'stakes': 1.0,
        'start_date': Date,
        'end_date': Date
    };

    util.make_getters_setters(this, props);
    
    // move_after:
    this.MOVE_AFTER_ORDER = 1; // Move after each player orders
    this.MOVE_AFTER_CALL = 2; // Move after any player calls it
    this.MOVE_AFTER_TURN = 3; // Move after all players have ordered
    
    // move_where:
    this.MOVE_WHERE_ALL = 1; // Execute all orders
    this.MOVE_WHERE_PLAYER = 2; // Execute orders created by the current player
    this.MOVE_WHERE_TERRITORY = 3; // Execute orders on sectoids on the current players territory

    /*
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
    
    // 0: Initial board state
    // 1: A orders, move?
    // 2: B orders, move?
    // 3: C orders, move?
    // 4: GRAY orders, move?
    // 5: A orders, move?
    // ...

    
    var orders = [];
    var boards = [];
    var moves = [];

    this.load_orders = function(str)
    {
        var lines = str.split(/,|\r|\n/);
        
        var tmp_order = new sector8.order();
        var i = 0;
        while (i < lines.length)
        {
            if (tmp_order.from_notation(lines[i]))
            {
                orders.push(tmp_order);
                tmp_order = new sector8.order();
            }
            i++;
        }
        
        orders.sort(function(a, b)
        {
            if (a.get_turn() !== b.get_turn())
                {return a.get_turn() - b.get_turn();}
            if (a.get_player() !== b.get_player())
                {return a.get_player() - b.get_player();}
            return 0;
        });
    };
    
    this.run_orders = function()
    {
        var board = this.get_map().get_board();
        board = boards[move_i] = board.clone();
        move_i++;
        
        var move_after = this.get_move_after();
        var move_where = this.get_move_where();
        
        var prev_turn;
        var move_i = 0;
        
        var i = 0;
        while (i < orders.length)
        {
            var order = orders[i];
            
            apply_order(move_i, board, order);
            
            if (
                (move_after === this.MOVE_AFTER_ORDER) ||
                (move_after === this.MOVE_AFTER_CALL && order.get_call_move()) ||
                (move_after === this.MOVE_AFTER_TURN && prev_turn !== order.get_turn() && (prev_turn = order.get_turn()))
            )
            {
                board = boards[move_i] = board.clone();
                apply_moves(move_i, board);
                move_i++;
            }

            i++;
        }
    };

    var apply_order = function(move_i, board, order)
    {
        var powered_map = cur_board.make_powered_map();

        var order_error = order.error_msg(/*config*/);
        if (order_error)
        {
            // There's a problem with the order
            // TODO: Log order_error
            return;
        }

        var row = order.get_row();
        var col = order.get_col();

        if (row >= board.get_rows())
        {
            return;
        }
        if (col >= board.get_cols())
        {
            return;
        }

        var cell = board.get_cells()[row][col];
        var sectoid = cell.get_sectoid();

        if (!sectoid)
        {
            // Tried to order an empty cell
            // TODO: Log error
            return;
        }

        if (order.get_player() !== cell.get_territory())
        {
            // Tried to order a sectoid on another player's territory
            // TODO: Log error
            return;
        }

        if (!powered_map[row][col])
        {
            // Tried to order a sectoid on an unpowered cell
            // TODO: Log error
            return;
        }

        var min_turn = move_i + order.get_wait();
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
    };

    var apply_moves = function(move_i, board)
    {
        while (typeof moves[move_i] === 'undefined') {moves.push([]);}

        var i = 0;
        while (i < moves[move_i].length)
        {
            var move = moves[move_i][i];

            board[]



            var move_turn = move_i + order.get_wait();

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

sector8.sectoid = function()
{
    goog.asserts.assertInstanceof(this, sector8.sectoid);

    var props = {
        'sectors': 0,
        'prime': false
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