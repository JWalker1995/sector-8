goog.provide('sector8.match');

goog.require('goog.asserts');
goog.require('util.make_class');

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
        'shadow': false,
        'spectators': true,
        'stakes': 1.0
    };

    util.make_class(this, props);
    
    this.get_map_id = function() {return this.get_map().get_map_id();};
    
    // move_after:
    this.MOVE_AFTER_ORDER = 1; // Move after each player orders
    this.MOVE_AFTER_CALL = 2; // Move after any player calls it
    this.MOVE_AFTER_TURN = 3; // Move after all players have ordered
    
    // move_where:
    this.MOVE_WHERE_ALL = 1; // Execute all orders
    this.MOVE_WHERE_PLAYER = 2; // Execute orders created by the current player
    this.MOVE_WHERE_TERRITORY = 3; // Execute orders on sectoids on the current players territory
    
    // timer:
    this.TIMER_TYPE_HOURGLASS = 1;
    this.TIMER_TYPE_PER_TURN = 2;
    this.TIMER_TYPE_PER_GAME = 3;
    
    var move_where_funcs = {};
    move_where_funcs[this.MOVE_WHERE_ALL] = function(order)
    {
        return true;
    };

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
        clone_board.call(this);
        
        var move_after = this.get_move_after();
        // TODO: move_where
        //var move_where = move_where_funcs[this.get_move_where()];
        
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
                apply_moves(function() {});
            }

            i++;
        }
        
        return boards;
    };
        
    var moves = {};
    
    this.apply_order = function(order)
    {
        var board = this.get_board();
        var powered_map = board.make_powered_map();

        var row = order.get_row();
        var col = order.get_col();

        if (row > board.get_rows())
        {
            return 'Order target row ' + row + ' is too high';
        }
        if (col > board.get_cols())
        {
            return 'Order target column ' + col + ' is too high';
        }
        
        row--;
        col--;

        var cell = board.get_cells()[row][col];
        var sectoid = cell.get_sectoid();

        if (!sectoid)
        {
            console.log(row, col);
            return 'There is no sectoid on that cell';
        }

        if (order.get_player() !== cell.get_territory())
        {
            return 'That cell is not on the player\'s territory';
        }

        if (!powered_map[row][col])
        {
            return 'That cell is not powered';
        }
        
        var key = row + ',' + col;
        if (typeof moves[key] === 'undefined') {moves[key] = [];}
        
        moves[key].push([
            order.get_wait(),
            order.get_duration(),
            order
        ]);
    };

    this.apply_moves = function(callback)
    {
        // TODO: Move this out of apply_moves if possible
        var board = clone_board.call(this).get_cells();
        
        var add_moves = [];
        
        for (var key in moves)
        {
            var src_row = undefined;
            var src_col = undefined;
            
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
                    
                    var order = move[2];
                    
                    if (typeof src_row === 'undefined')
                    {
                        var row_col = key.split(',');
                        src_row = parseInt(row_col[0]);
                        src_col = parseInt(row_col[1]);
                    }
                    
                    var src_cell = board[src_row][src_col];
                    
                    if (src_cell.get_sectoid() & (1 << order.get_direction()))
                    {
                        var dst_row = src_row + order.get_move_row();
                        var dst_col = src_col + order.get_move_col();
                        var dst_cell = board[dst_row][dst_col];
                        
                        var res = apply_move(src_cell, dst_cell, order.get_sectors());
                        if (!res[0] || move[1] === 0)
                        {
                            moves[key].splice(i, 1);
                        }
                        if (res[1] && move[1] !== 0)
                        {
                            add_moves.push(move.concat(dst_row + ',' + dst_col));
                        }

                        callback(order, res[1], src_row, src_col, dst_row, dst_col);
                    }
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

    util.make_class(this, props);
};
    
sector8.player = function()
{
    goog.asserts.assertInstanceof(this, sector8.player);

    var props = {
        'id': 0,
        'color': 0,
        'time': 0
    };

    util.make_class(this, props);
};
*/
