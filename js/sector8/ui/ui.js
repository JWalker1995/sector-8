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
        map.set_rows(3);
        map.set_cols(5);
        
        var cells = [];
        var row = 0;
        while (row < map.get_rows())
        {
            cells[row] = [];
            
            var col = 0;
            while (col < map.get_cols())
            {
                var c = cells[row][col] = new sector8.cell();
                
                var sectoid = null;
                if (row === 1 && (col === 0 || col === 4))
                {
                    sectoid = new sector8.sectoid();
                    sectoid.set_prime(false);
                    sectoid.set_sectors(Math.floor(Math.random() * 256));
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
