goog.provide('sector8.ui.board');

//var randomcolor = require('randomcolor');

sector8.ui.board = function(core, match)
{
    goog.asserts.assertInstanceof(this, sector8.ui.board);
    
    var map = match.get_map();
    
    var cell_els = [];
    
    var render = function()
    {
        var el = goog.dom.createDom('div', {'class': 'board'});
        
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
                goog.dom.append(el, cell);
                cell_els[i] = cell;
                
                var sectoid = cells[i].get_sectoid();
                if (sectoid)
                {
                    goog.dom.append(el, create_sectoid(row, col, sectoid));
                }
                
                col++;
            }
            row++;
        }
        
        goog.dom.append(el, create_areas());
        
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
        
        // Start test
        var html = '<div style="padding-left: 600px;">Move: <input type="text" class="move_input" /><button class="move_button">Move</button></div>';
        goog.dom.append(el, goog.dom.htmlToDocumentFragment(html));
        el.getElementsByClassName('move_button')[0].onclick = function()
        {
            var move = el.getElementsByClassName('move_input')[0].value;
        };
        // End test

        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
    
    
    var create_cell = function(row, col, cell)
    {
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
        
        var style = get_positioning(row, col, 0, 0);
        return goog.dom.createDom('div', {'class': classes, 'style': style});
    };
    
    var hover_sectoid;
    var hover_sectoid_el;
    
    var create_sectoid = function(row, col, sectoid)
    {
        // sectoid.get_prime();
        
        var style = get_positioning(row, col, 0, 0);
        var sectoid_el = goog.dom.createDom('div', {'class': 'sectoid', 'style': style});
                
        var sec_bits = sectoid.get_sectors();
        var i = 0;
        while (i < 8)
        {
            if ((sec_bits >> i) & 1)
            {
                var sector_el = goog.dom.createDom('span', {'class': 'sector sector_' + i});
                goog.dom.append(sectoid_el, sector_el);
            }
            i++;
        }
        
        var center = goog.dom.createDom('span', {'class': 'center'});
        goog.dom.append(sectoid_el, center);
        
        var overlay = goog.dom.createDom('img', {
            'class': 'overlay',
            'usemap': '#sectoid',
            'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAD/SURBVHic7dFBDQAgEMAwwL/n440C9mgVLNmemUXH+R3Ay5AYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2IMiTEkxpAYQ2Iu+80DxR66mxIAAAAASUVORK5CYII='
        });
        overlay.onmouseover = function(e)
        {
            hover_sectoid = sectoid;
            hover_sectoid_el = this.parentNode;
        };
        overlay.onmouseout = function(e)
        {
            var t = e.toElement || e.relatedTarget;
            if (t.tagName === 'MAP' || t.tagName === 'AREA') {return;}
            
            hover_sectoid_el = undefined;
        };
        goog.dom.append(sectoid_el, overlay);
        
        return sectoid_el;
    };
    
    var overlay_center = core.config.geometry.overlay_img_size / 2.0;
    var sector_rad = core.config.geometry.sector_rad;
    var center_rad = core.config.geometry.center_rad;
    var create_areas = function()
    {
        var map = goog.dom.createDom('map', {'name': 'sectoid'});
        
        var center = goog.dom.createDom('area', {
            'shape': 'circle',
            'coords': overlay_center + ',' + overlay_center + ',' + center_rad
        });
        center.onclick = function(e)
        {
            if (typeof hover_sectoid_el === 'undefined') {return;}

            var sectors = hover_sectoid_el.getElementsByClassName('sector');
            
            var light = true;
            var i = 0;
            while (i < sectors.length)
            {
                if (sectors[i].className.indexOf(' lit') !== -1)
                {
                    light = false;
                    break;
                }
                i++;
            }
            
            i = 0;
            while (i < sectors.length)
            {
                var is_lit = sectors[i].className.indexOf(' lit') !== -1;
                if (light && !is_lit)
                {
                    sectors[i].className += ' lit';
                }
                else if (!light && is_lit)
                {
                    sectors[i].className = sectors[i].className.replace(' lit', '');
                }
                i++;
            }
        };
        goog.dom.append(map, center);
        
        var i = 0;
        var ang = 0.0;
        var step = Math.PI / 8.0;
        while (i < 8)
        {
            var coords = [
                0,
                0,
                +Math.sin(ang - step),
                -Math.cos(ang - step),
                +Math.sin(ang       ),
                -Math.cos(ang       ),
                +Math.sin(ang + step),
                -Math.cos(ang + step)
            ];
            
            coords = coords.map(function(c) {return c * sector_rad + overlay_center;});
            
            var area = goog.dom.createDom('area', {
                'shape': 'poly',
                'coords': coords.join(',')
            });
            area.onclick = (function(i, e)
            {
                if (typeof hover_sectoid_el === 'undefined') {return;}

                var sector = hover_sectoid_el.getElementsByClassName('sector_' + i)[0];
                if (typeof sector === 'undefined') {return;}
                
                if (sector.className.indexOf(' lit') === -1)
                {
                    sector.className += ' lit';
                }
                else
                {
                    sector.className = sector.className.replace(' lit', '');
                }
            }).bind(area, i);
            goog.dom.append(map, area);
            
            ang += step * 2.0;
            i++;
        }

        return map;
    };
    
    var send_order = function(order)
    {
        core.net.request('order', order.to_notation(), function()
        {
            // Order received
        });
    };
    
    var on_order = function(order)
    {
        
    };
    
    
    var cell_spacing = core.config.geometry.cell_size;
    var get_positioning = function(row, col, row_off, col_off)
    {
        return 'top: ' + (row * cell_spacing + row_off) + 'px; left: ' + (col * cell_spacing + col_off) + 'px; ';
    };
};