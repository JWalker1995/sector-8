goog.provide('sector8.board');

goog.require('goog.asserts');
goog.require('util.make_getters_setters');
goog.require('util.crc32');

sector8.board = function()
{
    goog.asserts.assertInstanceof(this, sector8.board);

    var props = {
        'rows': 0,
        'cols': 0,
        'cells': Array
    };

    util.make_getters_setters(this, props);
    
    this.foreach_row = function(callback)
    {
        var cells = this.get_cells();
        var row = 0;
        var rows = this.get_rows();
        while (row < rows)
        {
            callback(row, cells[row]);
            row++;
        }
    };

    this.foreach_cell = function(callback)
    {
        var cols = this.get_cols();
        this.foreach_row(function(row, arr)
        {
            var col = 0;
            while (col < cols)
            {
                callback(row, col, arr[col]);
                col++;
            }
        });
    };
    
    this.clone = function()
    {
        var res = [];
        
        this.foreach_row(function(row)
        {
            res[row] = [];
        });
        
        this.foreach_cell(function(row, col, cell)
        {
            res[row][col] = cell;
        });
        
        return res;
    };

    this.checksum = function()
    {
        var str = '';

        str += String.fromCharCode(this.get_rows());
        str += String.fromCharCode(this.get_cols());

        this.foreach_cell(function(row, col, cell)
        {
            var i = 0;
            i |= cell.get_void() <<< 0;
            i |= cell.get_territory() <<< 1;
            i |= cell.get_permanent() <<< 6;
            if (cell.get_sectoid())
            {
                i |= cell.get_sectoid().get_prime() <<< 7;
                i |= cell.get_sectoid().get_sectors() <<< 8;
            }
            str += String.fromCharCode(i);
        });

        return util.crc32(str);
    };
    
    this.make_powered_map = function()
    {
        var edges = [];
        var res = [];

        this.foreach_row(function(row, arr)
        {
            res[row] = [];
        });
        
        this.foreach_cell(function(row, col, cell)
        {
            if (cell.get_sectoid() && cell.get_sectoid().get_prime())
            {
                edges.push([row, col, cell.get_territory()]);
            }

            res[row][col] = false;
        }

        var i = 0;
        while (i < edges.length)
        {
            var row = edges[i][0];
            var col = edges[i][1];
            var terr = edges[i][2];

            if (board[row][col].get_territory() === terr)
            {
                edges.push([row-1, col, terr]);
                edges.push([row+1, col, terr]);
                edges.push([row, col-1, terr]);
                edges.push([row, col+1, terr]);

                res[row][col] = true;
            }

            i++;
        }

        return res;
    };
};