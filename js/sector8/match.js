goog.provide('sector8.match');

goog.require('goog.asserts');
goog.require('util.make_getters_setters');

sector8.match = function()
{
    goog.asserts.assertInstanceof(this, sector8.match);

    var props = {
        'match_id': 0,
        'name': '',
        'start_date': Date,
        'end_date': Date,
        'players': Array,
        'map': sector8.map,
        'orders': Array,
        'board': sector8.board,
        'move_after': 0,
        'move_where': 0,
        'timer_type': 0,
        'spectators': true,
        'stakes': 1.0
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
    
    var boards = [];
    var clone_board = function()
    {
        var board = this.get_board().clone();
        boards[boards.length] = board;
        this.set_board(board);
        return board;
    };
    
    this.load_orders = function(str)
    {
        var orders = [];
        
        // Split str into lines
        var lines = str.split(/,|\r|\n/);
        
        // Parse each line into a sector8.order
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
        
        // Sort orders, by turn then player
        orders.sort(function(a, b)
        {
            if (a.get_turn() !== b.get_turn())
                {return a.get_turn() - b.get_turn();}
            if (a.get_player() !== b.get_player())
                {return a.get_player() - b.get_player();}
            return 0;
        });
        
        this.set_board(this.get_map().get_board());
        clone_board();
        
        var move_after = this.get_move_after();
        var move_where = this.get_move_where();
        
        var prev_turn;
        
        var i = 0;
        while (i < orders.length)
        {
            var order = orders[i];
            
            apply_order(order);
            
            if (
                (move_after === this.MOVE_AFTER_ORDER) ||
                (move_after === this.MOVE_AFTER_CALL && order.get_call_move()) ||
                (move_after === this.MOVE_AFTER_TURN && prev_turn !== order.get_turn() && (prev_turn = order.get_turn()))
            )
            {
                // TODO: move_where
                apply_moves(function() {});
            }

            i++;
        }
        
        return boards;
    };
        
    var moves = {};
    
    var apply_order = function(order)
    {
        var board = this.get_board();
        var powered_map = board.make_powered_map();

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
        
        var key = row + ',' + col;
        if (typeof moves[key] === 'undefined') {moves[key] = [];}
        
        moves[key].push([
            order.get_wait(),
            order.get_duration(),
            order
        ]);
    };

    var apply_moves = function(callback)
    {
        // TODO: Move this out of apply_moves if possible
        var board = clone_board();
        
        var add_moves = [];
        
        for (var key in moves)
        {
            var row_col;
            
            var i = moves[key].length;
            while (i > 0)
            {
                i--;
                var move = moves[key][i];

                if (move[0])
                {
                    // Decrease wait counter
                    move[0]--;
                }
                else
                {
                    // Decrease duration counter
                    move[1]--;
                    
                    if (typeof row_col === 'undefined') {row_col = key.split(',');}
                    
                    var src_row = parseInt(row_col[0]);
                    var src_col = parseInt(row_col[1]);
                    var dst_row = src_row + move[2].get_move_row();
                    var dst_col = src_col + move[2].get_move_col();
                    
                    var src_cell = board[src_row][src_col];
                    var dst_cell = board[dst_row][dst_col];
                    
                    var res = apply_move(src_cell, dst_cell, move[2].get_sectors());
                    
                    if (!res[0] || move[1] === 0)
                    {
                        moves[key].splice(i, 1);
                    }
                    if (res[1] && move[1] !== 0)
                    {
                        add_moves.push(move.concat(dst_row + ',' + dst_col));
                    }
                    
                    callback(order, res[1]);
                }
            }
        }
        
        var i = 0;
        while (i < add_moves.length)
        {
            var key = add_moves[i].pop();
            if (typeof moves[key] === 'undefined') {moves[key] = [];}
            
            moves[key].push(add_moves[i]);
            
            i++;
        }
    };

    var apply_move = function(src_cell, dst_cell, sectors)
    {
        var src = src_cell.get_sectoid();
        var dst = dst_cell.get_sectoid();
        
        sectors &= src;
        dst |= sectors;
        src &= ~sectors;
        
        if (sectors)
        {
            src_cell.set_sectoid(src);
            dst_cell.set_sectoid(dst);
            dst_cell.set_territory(src_cell.get_territory());
        }
        
        return [src, sectors, dst];
    };
};

/*
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
*/

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
