require('../util/make_class');
require('../util/crc32');

sector8.board = function()
{
    assert(this instanceof sector8.board);

    var props = {
        'rows': 0,
        'cols': 0,
        'cells': Array
    };

    util.make_class(this, props);
    
    this.to_notation = function()
    {
        var cells = this.get_cells();
        var rows = [];
        
        var row = 0;
        while (row < this.get_rows())
        {
            rows[row] = cells[row].join(' ');
            row++;
        }
        
        return rows.join('\n');
    };
    
    this.from_notation = function(str)
    {
        var rows = str.trim().split(/[\r\n]+/);
        
        var num_cols = 0;
        var cells = [];
        
        var row = 0;
        while (row < rows.length)
        {
            var cols = rows[row].trim().split(/[\s]+/);
            
            if (!num_cols) {num_cols = cols.length;}
            
            if (num_cols !== cols.length)
            {
                return false;
            }
            
            cells[row] = [];
            
            var col = 0;
            while (col < cols.length)
            {
                var cell = cells[row][col] = new sector8.cell();
                if (!cell.from_notation(row, col, cols[col]))
                {
                    return false;
                }
                
                col++;
            }
            
            row++;
        }

        // TODO: Add non-inline sectoids
        // #a3 01234567!
        
        this.set_rows(rows.length);
        this.set_cols(num_cols);
        this.set_cells(cells);
        
        return true;
    };
    
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
        var cells = [];
        
        this.foreach_row(function(row)
        {
            cells[row] = [];
        });
        
        this.foreach_cell(function(row, col, cell)
        {
            cells[row][col] = cell;
        });
        
        var res = new sector8.board();
        res.set_rows(this.get_rows());
        res.set_cols(this.get_cols());
        res.set_cells(cells);
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
            i |= cell.get_void() << 0;
            i |= cell.get_territory() << 1;
            i |= cell.get_permanent() << 6;
            i |= cell.get_sectoid() << 7;
            /*
            if (cell.get_sectoid())
            {
                i |= cell.get_sectoid().get_prime() << 7;
                i |= cell.get_sectoid().get_sectors() << 8;
            }
            */
            goog.asserts.assert(i <= 0xFFFF);
            str += String.fromCharCode(i);
        });

        return util.crc32(str);
    };
    
    this.make_powered_map = function()
    {
        var rows = this.get_rows();
        var cols = this.get_cols();
        var cells = this.get_cells();
        
        var edges = [];
        var res = [];

        this.foreach_row(function(row, arr)
        {
            res[row] = [];
        });
        
        this.foreach_cell(function(row, col, cell)
        {
            //if (cell.get_sectoid() && cell.get_sectoid().get_prime())
            if (cell.get_sectoid() & (1 << 8))
            {
                edges.push([row, col, cell.get_territory()]);
            }

            res[row][col] = false;
        });

        var i = 0;
        while (i < edges.length)
        {
            var row = edges[i][0];
            var col = edges[i][1];
            var terr = edges[i][2];

            if (
                row >= 0 && row < rows &&
                col >= 0 && col < cols &&
                !res[row][col] &&
                cells[row][col].get_territory() === terr
            )
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
    
    this.toString = this.to_notation;
};