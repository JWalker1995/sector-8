goog.provide('sector8.ui.board');

//var randomcolor = require('randomcolor');

sector8.ui.board = function(core, match)
{
    goog.asserts.assertInstanceof(this, sector8.ui.board);
    
    var cell_els = [];
    
    var render = function()
    {
        var el = goog.dom.createDom('div', {'class': 'board'});
        
        var sx = match.get_map().get_size_x();
        var sy = match.get_map().get_size_y();
        var cells = match.get_map().get_cells();
        var get_index = match.get_map().get_index;
        
        var y = 0;
        while (y < sy)
        {
            var x = 0;
            while (x < sx)
            {
                var i = get_index(x, y);
                var cell = create_cell(x, y, cells[i]);
                // make sectoid
                goog.dom.append(el, cell);
                cell_els[i] = cell;
                x++;
            }
            y++;
        }
        
        /*
        var props = {
            'map_id': 0,
            'name': '',
            'num_players': 0,
            'size_x': 0,
            'size_y': 0,
            'cells': Uint16Array,
            //'primes': [],
            'symmetry_flip_x': false,
            'symmetry_flip_y': false,
            'symmetry_rot_90': false,
            'symmetry_rot_180': false,
            'creator_id': 0,
            'creation_date': Date
        };

        // Each cell: territory/unclaimed/void, permanent, prime, sectors, sector chance, sectoid chance
        */
        
        var html = '<div class="move_input">Move: <input type="text" /><button>Move</button></div>';
        goog.dom.append(el, goog.dom.htmlToDocumentFragment(html));

        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
    
    var create_cell = function(x, y, cell)
    {
        // TODO: Common source with css
        var cell_spacing = 75;
        
        var classes = 'cell';
        if (cell.get_void())
        {
            classes += ' void';
        }
        else
        {
            classes += ' player_' + cell.get_territory();
            if (cell.get_permanent())
            {
                classes += ' permanent';
            }
        }
        
        var style = 'left: ' + (x * cell_spacing) + 'px; top: ' + (y * cell_spacing) + 'px;';
        return goog.dom.createDom('div', {'class': classes, 'style': style});
    };
};