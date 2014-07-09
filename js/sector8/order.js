goog.provide('sector8.order');
debugger;
goog.require('goog.asserts');
goog.require('util.make_getters_setters');

sector8.order = function()
{
    debugger;
    goog.asserts.assertInstanceof(this, sector8.order);

    var props = {
        'player': 0,
        'turn': 0,
        'wait': 0,
        'duration': 0,
        'col': 0,
        'row': 0,
        'sectors': 0,
        'direction': 0
    };
    // A :20+2-4 #b5 .01245 @4

    util.make_getters_setters(this, props);
    
    var char_number = '1'.charCodeAt(0) - 1;
    var char_lower = 'a'.charCodeAt(0) - 1;
    var char_upper = 'A'.charCodeAt(0) - 1;
    
    this.to_notation = function(pretty)
    {
        var player = String.fromCharCode(char_upper + this.get_player());
        var turns = ':' + this.get_turn() + '+' + this.get_wait() + '-' + this.get_duration();
        var sectoid = '#' + String.fromCharCode(char_lower + this.get_col() + 1) + (this.get_row() + 1);
        var trans = '@' + this.get_direction();
        
        var sectors = '.';
        var i = 0;
        while (i < 8)
        {
            if ((this.get_sectors() >> i) & 1)
            {
                sectors += i;
            }
            i++;
        }
        
        return [player, turns, sectoid, sectors, trans].join(pretty ? ' ' : '');
    };
    
    this.from_notation = function(str)
    {
        var regex = /^\s*([A-Z])?\s*(?:\:(\d+))?(?:\+(\d+))?(?:-(\d+))?\s*#([a-z])(\d+)\s*(?:\.(\d+))?\s*@(?:x|(\d+))\s*$/;
        var exec;
        if (exec = regex.exec(str))
        {
            if (!exec[1]) {exec[1] = '';}
            if (!exec[2]) {exec[2] = '';}
            if (!exec[3]) {exec[3] = '0';}
            if (!exec[4]) {exec[4] = '1';}
            if (!exec[7]) {exec[7] = '01234567';}
            
            var sectors = 0;
            var i = 0;
            while (i < exec[7].length)
            {
                var sector = exec[7].charCodeAt(i) - char_number;
                if (sector >= 8) {return false;}
                sectors += 1 << sector;
                i++;
            }
            
            this.set_player(exec[1].charCodeAt(0) - char_upper);
            this.set_turn(parseInt(exec[2], 10));
            this.set_wait(parseInt(exec[3], 10));
            this.set_duration(parseInt(exec[4], 10));
            this.set_col(exec[5].charCodeAt(0) - char_lower);
            this.set_row(parseInt(exec[6], 10));
            this.set_sectors(sectors);
            this.set_direction(parseInt(exec[8], 10));
            
            return true;
        }
        else
        {
            return false;
        }
    };
};
