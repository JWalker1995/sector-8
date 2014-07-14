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

    var trans_row = [-1,-1, 0, 1, 1, 1, 0,-1];
    var trans_col = [ 0, 1, 1, 1, 0,-1,-1,-1];
    
    var orders = [];
    var boards = [];

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
        board = boards[0] = board.clone();
        
        var move_after = this.get_move_after();
        var move_where = this.get_move_where();
        
        var prev_turn;
        
        var i = 0;
        while (i < orders.length)
        {
            var order = orders[i];
            
            apply_order(board, order);
            
            if (
                (move_after === this.MOVE_AFTER_ORDER) ||
                (move_after === this.MOVE_AFTER_CALL && order.get_call_move()) ||
                (move_after === this.MOVE_AFTER_TURN && prev_turn !== order.get_turn() && (prev_turn = order.get_turn()))
            )
            {
                board = boards[boards.length] = board.clone();
                apply_moves(board);
            }

            i++;
        }
    };

    
    var waiting = [];

    var apply_order = function(board, order)
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

        waiting.push([
            order.get_wait(),
            order.get_duration(),
            sectoid,
            order
        ]);
    };

    var apply_moves = function(board)
    {
        var new_waiting = [];

        var i = 0;
        while (i < waiting.length)
        {
            var arr = waiting[i];
            if (arr[0])
            {
                // Decrease wait counter
                arr[0]--;
            }
            else
            {
                // Decrease duration counter
                arr[1]--;

                var src_dst = apply_move(board, arr[2], arr[3]);
                if (!src_dst[0] || arr[1] === 0)
                {
                    // Remove from waiting list
                    waiting[i] = waiting.pop();
                    continue;
                }
                if (src_dst[1] && arr[1] !== 0)
                {
                    new_waiting.push([
                        arr[0],
                        arr[1],
                        src_dst[1],
                        arr[3]
                    ]);
                }
            }
            i++;
        }

        waiting = waiting.concat(new_waiting);
    };

    var apply_move = function(board, sectoid, order)
    {
        var src_row = sectoid.get_row();
        var src_col = sectoid.get_col();
        var dst_row = src_row + trans_row[order.get_direction()];
        var dst_col = src_col + trans_col[order.get_direction()];

        var src_cell = board[src_row][src_col];
        var dst_cell = board[dst_row][dst_col];

        var src = src_cell.get_sectoid();
        var dst = dst_cell.get_sectoid();

        goog.asserts.assert(sectoid === src);

        var src_sectors = src.get_sectors() & ~order.get_sectors();
        var dst_sectors = src.get_sectors() & order.get_sectors();

        if (src_sectors)
        {
            src.set_sectors(src_sectors);
        }
        else
        {
            src_cell.set_sectoid(null);
            src = null;
        }

        if (dst_sectors)
        {
            if (dst)
            {
                dst_sectors |= dst.get_sectors();
            }
            else
            {
                dst = new sector8.sectoid();
                dst_cell.set_sectoid(dst);

                dst.set_row(dst_row);
                dst.set_col(dst_col);
            }

            dst_cell.set_territory(src_cell.get_territory());
            dst.set_sectors(dst_sectors);
        }
        else
        {
            dst = null;
        }

        return [src, dst];
    };
};

sector8.sectoid = function()
{
    goog.asserts.assertInstanceof(this, sector8.sectoid);

    var props = {
        'row': 0,
        'col': 0,
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
