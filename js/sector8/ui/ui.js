require('../../sector8/ui');

require('../../util/assert');
//require('../../sector8/ui/login');

var ractive = require('ractive');

// Test
/*
require('../../sector8/board');
require('../../sector8/cell');   
require('../../sector8/map');
require('../../sector8/match');
require('../../sector8/ui/match');
*/

sector8.ui.ui = function(core)
{
    util.assert(this instanceof sector8.ui.ui);

    var el;

    //var login = new sector8.ui.login(core);

    this.render = function()
    {
        var dom = new ractive({
            el: document.getElementById('client'),
            template: '#template',
            data: {
                'login': {
                    'username_msg': 'Test username msg',
                    'password_msg': 'Test password msg',
                    'button_msg': 'Test button msg',
                    
                    'user_status': 0,
                    'login_status': 0,
                    
                    'STATUS_INVALID': 0, // Empty username/password, invalid username characters
                    'STATUS_USER': 1, // Waiting on user
                    'STATUS_WAITING': 2, // Waiting for a response from the server
                    'STATUS_GOOD': 3, // Username exists or login correct
                    'STATUS_BAD': 4 // Username doesn't exist or login incorrect
                },
                'match': {
                },
                'cell_spacing': 100,
                'overlay_center': 50,
                'center_rad': 40,
                'range': function(start, end, inc)
                {
                    var res = [];
                    while (start < end)
                    {
                        res.push(start);
                        start += inc;
                    }
                    return res;
                }
            }
        });
        
        dom.data.something = my_inst.get_obj();
        my_inst.watch(function(changed)
        {
            dom.update('something', changed.keys());
        });
        dom.observe('username', function(new_val, old_val)
        {
        });
        dom.observe('password', function(new_val, old_val)
        {
        });
        
        /*
        el = goog.dom.createDom('div', {'class': 'game'});
        goog.dom.append(el, login.render());

        // Start test
        var board = new sector8.board();
        board.set_rows(3);
        board.set_cols(5);
        
        var cells = [];
        var row = 0;
        while (row < board.get_rows())
        {
            cells[row] = [];
            
            var col = 0;
            while (col < board.get_cols())
            {
                var c = cells[row][col] = new sector8.cell();
                
                var sectoid = 0;
                if ((row === 0 || row === 2) && (col === 0 || col === 4))
                {
                    sectoid = Math.floor(Math.random() * 256);
                    sectoid |= (row === 0) << 8;
                }

                var t_map = [1, 1, 0, 2, 2];
                c.set_void(row === 1 && (col === 1 || col == 3));
                c.set_territory(t_map[col]);
                c.set_permanent((row === 0 || row === 2) && (col === 0 || col === 4));
                c.set_sectoid(sectoid);

                col++;
            }
            row++;
        }
        board.set_cells(cells);
        
        var map = new sector8.map();
        map.set_name('Awesome map!!!');
        map.set_num_players(2);
        map.set_board(board);
        map.set_creator_id(1);
        map.set_creation_date(new Date());

        var match = new sector8.match();
        
        match.set_name('Awesome Match!!!');
        match.set_start_date(new Date());
        match.set_players([]);
        match.set_map(map);
        match.set_orders('');
        match.set_board(map.get_board());
        match.set_move_after(match.MOVE_AFTER_ORDER);
        match.set_move_where(match.MOVE_WHERE_PLAYER);
        match.set_timer_type(match.TIMER_TYPE_HOURGLASS);
        match.set_shadow(true);
        match.set_spectators(false);
        match.set_stakes(7.0);
        
        window.test_match = match;

        var ui_match = new sector8.ui.match(core, match);
        goog.dom.append(el, ui_match.render());
        // End test

        return el;
        */

        /*
        Right column:
            Timeline navigation
            Resign / Offer draw
            Moves
            Orders
            Stats
                Territory
                Sectors
            Stats graph
            Chat

            players connect, then agree on game

        */
    };
};
