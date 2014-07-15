goog.provide('sector8.cell');

goog.require('goog.asserts');
goog.require('sector8.sectoid');

sector8.cell = function()
{
    goog.asserts.assertInstanceof(this, sector8.cell);

    var props = {
        'void': false,
        'territory': 0,
        'permanent': false,
        'sectoid': 0
    };

    util.make_getters_setters(this, props);
    
    var char_number = '1'.charCodeAt(0) - 1;
    var char_lower = 'a'.charCodeAt(0) - 1;
    var char_upper = 'A'.charCodeAt(0) - 1;
    
    this.from_notation = function(row, col, str)
    {
        var regex = /^\s*([a-zA-Z:\-=])\/?(?:(\d+)\s*(!)?)?\s*$/;
        var exec;
        if (exec = regex.exec(str))
        {
            this.set_void(false);
            
            switch (exec[1])
            {
                case ':':
                    this.set_void(true);
                    break;
                
                case '-':
                    this.set_territory(0);
                    this.set_permanent(false);
                    break;
                
                case '=':
                    this.set_territory(0);
                    this.set_permanent(true);
                    break;
                
                default:
                    var is_lower = exec[1] >= 'a' && exec[1] <= 'z';
                    var is_upper = exec[1] >= 'A' && exec[1] <= 'Z';
                    if (is_lower === is_upper)
                    {
                        // TODO: Log error (shouldn't happen)
                    }
                    else
                    {
                        var territory = exec[1].charCodeAt(0) - (is_upper ? char_upper : char_lower);
                        this.set_territory(territory);
                        this.set_permanent(is_upper);
                    }
            }
            
            if (exec[2])
            {
                // TODO: Combine with order sector parsing code
                var sectors = 0;
                var i = 0;
                while (i < exec[2].length)
                {
                    var sector = exec[2].charCodeAt(i) - char_number;
                    if (sector >= 8) {return false;}
                    sectors |= 1 <<< sector;
                    i++;
                }
                
                var prime = !!exec[3];
                this.set_sectoid(sectors | (prime <<< 8));

                /*
                var sectoid = new sector8.sectoid();
                sectoid.set_row(row);
                sectoid.set_col(rol);
                sectoid.set_sectors(sectors);
                sectoid.set_prime(!!exec[3]);
                
                this.set_sectoid(sectoid);
                */
            }
            
            return true;
        }
        else
        {
            return false;
        }
    };
};
