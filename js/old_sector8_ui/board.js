require('../../sector8/ui');

goog.require('goog.dom');
goog.require('goog.dom.classes');
require('../../util/assert');
require('../../sector8/order');

//var randomcolor = require('randomcolor');

sector8.ui.board = function(core, match)
{
    util.assert(this instanceof sector8.ui.board);
    
    var cell_spacing = core.config.geometry.cell_size;
    var overlay_center = core.config.geometry.overlay_img_size / 2.0;
    var sector_rad = core.config.geometry.sector_rad;
    var center_rad = core.config.geometry.center_rad;
    
    var board = match.get_map().get_board();
    
    var cell_els;
    var sectoid_els;
    
    var render = function()
    {
        var el = goog.dom.createDom('div', {'class': 'board'});
        
        var rows = board.get_rows();
        var cols = board.get_cols();
        var cells = board.get_cells();
        
        cell_els = [];
        sectoid_els = [];
        
        var row = 0;
        while (row < rows)
        {
            cell_els[row] = [];
            sectoid_els[row] = [];
            
            var col = 0;
            while (col < cols)
            {
                var cell = cells[row][col];
                var cell_el = create_cell(row, col, cell);
                goog.dom.append(el, cell_el);
                cell_els[row][col] = cell_el;
                
                var sectoid = cell.get_sectoid();
                if (sectoid)
                {
                    var sectoid_el = create_sectoid(row, col, sectoid);
                    goog.dom.append(el, sectoid_el);
                    sectoid_els[row][col] = sectoid_el;
                }
                else
                {
                    sectoid_els[row][col] = null;
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
        match.load_orders('');
        
        var html = '<div style="padding-left: 600px;"><input type="text" class="order_input" /><button class="order_button">Order</button><button class="move_button">Move</button></div>';
        goog.dom.append(el, goog.dom.htmlToDocumentFragment(html));
        
        el.getElementsByClassName('order_button')[0].onclick = function()
        {
            var order_str = el.getElementsByClassName('order_input')[0].value;
            var order = new sector8.order();
            if (order.from_notation(order_str))
            {
                var order_error = order.error_msg(core.config);
                if (order_error)
                {
                    alert(order_error);
                }
                else
                {
                    var apply_error = match.apply_order(order);
                    if (apply_error)
                    {
                        alert(apply_error);
                    }
                }
            }
            else
            {
                alert('invalid order syntax');
            }
        };
        
        el.getElementsByClassName('move_button')[0].onclick = function()
        {
            match.apply_moves(function(order, sectoid, src_row, src_col, dst_row, dst_col)
            {
                var src_el = sectoid_els[src_row][src_col];
                var dst_el = sectoid_els[dst_row][dst_col];
                
                if (!dst_el)
                {
                    dst_el = create_sectoid(dst_row, dst_col, 0);
                    goog.dom.append(el, dst_el);
                    sectoid_els[dst_row][dst_col] = dst_el;
                    
                    var center = dst_el.getElementsByClassName('center')[0];
                    center.style.opacity = 0;
                    setTimeout(function()
                    {
                        center.style.opacity = 1;
                    }, 0);
                }
                
                var i = 0;
                while (i < 8)
                {
                    if ((sectoid >>> i) & 1)
                    {
                        src_el.removeChild(src_el.getElementsByClassName('sector_' + i)[0]);
                        var sector_el = create_sector(i);
                        
                        var dx = -cell_spacing * order.get_move_col();
                        var dy = -cell_spacing * order.get_move_row();
                        sector_el.style.marginLeft = dx + 'px';
                        sector_el.style.marginRight = dy + 'px';
                        
                        goog.dom.append(dst_el, sector_el);
                        
                        setTimeout((function(sector_el)
                        {
                            sector_el.style.marginLeft = '';
                            sector_el.style.marginRight = '';
                        }).bind(null, sector_el), 0);
                    }
                    i++;
                }
                order.get_move_row();
            });
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
        var prime = sectoid & (1 << 8);
        
        var style = get_positioning(row, col, 0, 0);
        var sectoid_el = goog.dom.createDom('div', {'class': 'sectoid' + (prime ? ' prime' : ''), 'style': style});
        
        var i = 0;
        while (i < 8)
        {
            if ((sectoid >>> i) & 1)
            {
                goog.dom.append(sectoid_el, create_sector(i));
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
    
    var create_sector = function(sector_i)
    {
        var sector_el = goog.dom.createDom('span', {
            'class': 'sector sector_' + sector_i
        });
        return sector_el;
    };
    
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
            area.onmousedown = function(e)
            {
                //debugger;
            };
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
    
    var get_positioning = function(row, col, row_off, col_off)
    {
        return 'left: ' + (col * cell_spacing + col_off) + 'px; top: ' + (row * cell_spacing + row_off) + 'px; ';
    };
};
