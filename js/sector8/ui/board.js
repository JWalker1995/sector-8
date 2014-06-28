goog.provide('sector8.ui.board');

//var randomcolor = require('randomcolor');

sector8.ui.board = function(core, match)
{
    goog.asserts.assertInstanceof(this, sector8.ui.board);
    
    var cell_els = [];
    
    var render = function()
    {
        var el = goog.dom.createDom('div', {'class': 'board'});
        
        var map = match.get_map();
        var rows = map.get_rows();
        var cols = map.get_cols();
        var cells = map.get_cells();
        
        var row = 0;
        while (row < rows)
        {
            var col = 0;
            while (col < cols)
            {
                var i = map.get_cell_index(row, col);
                var cell = create_cell(row, col, cells[i]);
                // make sectoid
                goog.dom.append(el, cell);
                cell_els[i] = cell;
                col++;
            }
            row++;
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
        
        var html = '<div style="padding-left: 600px;">Move: <input type="text" class="move_input" /><button class="move_button">Move</button></div>';
        goog.dom.append(el, goog.dom.htmlToDocumentFragment(html));
        el.getElementsByClassName('move_button')[0].onclick = function()
        {
            var move = el.getElementsByClassName('move_input')[0].value;
        };

        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
    
    var create_cell = function(row, col, cell)
    {
        var cell_spacing = core.config.spacing.cell_size;
        
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
        
        var style = 'top: ' + (row * cell_spacing) + 'px; left: ' + (col * cell_spacing) + 'px;';
        return goog.dom.createDom('div', {'class': classes, 'style': style});
    };
};