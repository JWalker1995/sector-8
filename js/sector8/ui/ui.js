goog.provide('sector8.ui.ui');

goog.require('goog.functions');
goog.require('sector8.ui.login');

// Test
goog.require('sector8.map');
goog.require('sector8.match');
goog.require('sector8.ui.match');

sector8.ui.ui = function(core)
{
    goog.asserts.assertInstanceof(this, sector8.ui.ui);
    
    var el;

    var login = new sector8.ui.login(core);

    var render = function()
    {
        el = goog.dom.createDom('div', {'class': 'game'});
        goog.dom.append(el, login.render());
        
        // Start test
        var map = new sector8.map();
        map.set_name('Awesome map!!!');
        map.set_num_players(2);
        map.set_size_x(3);
        map.set_size_y(5);
        
        var cells = [];
        var x = 0;
        while (x < map.get_size_x())
        {
            var y = 0;
            while (y < map.get_size_y())
            {
                var i = map.get_cell_index(x, y);
                var c = cells[i] = new sector8.cell();
                
                var t_map = [1, 1, 0, 2, 2];
                c.set_void(y === 1 && (x === 1 || x == 3));
                c.set_territory(t_map[x]);
                c.set_permanent((y === 0 || y === 1) && (x === 0 || x === 4));
                c.set_sectoid(null);
                
                y++;
            }
            x++;
        }
        map.set_cells(cells);
        
        map.set_creator_id(1);
        map.set_creation_date(new Date());
        
        var match = new sector8.match();
        match.set_players([]);
        match.set_map(map);
        match.set_orders([]);
        match.set_start_date(new Date());
        
        var ui_match = new sector8.ui.match(core, match);
        goog.dom.append(el, ui_match.render());
        // End test

        return el;

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

    this.render = goog.functions.cacheReturnValue(render);
};
