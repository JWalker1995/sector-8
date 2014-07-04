goog.provide('sector8.order');

sector8.order = function()
{
    goog.asserts.assertInstanceof(this, sector8.order);

    var props = {
        'player': 0,
        'turn': 0,
        'wait': 0,
        'duration': 0,
        'row': 0,
        'col': 0,
        'sectors': 0,
        'direction': 0,
        'distance': 0
    };
    // A :20+2-4 #b5 .01245 @4*3

    util.make_getters_setters(this, props);
    
    this.to_notation = function(pretty)
    {
        var player = String.fromCharCode(64 + this.get_player());
        var turns = ':' + this.get_turn() + '+' + this.get_min_turn() + '-' + this.get_max_turn();
        var sectoid = '#' + String.fromCharCode(97 + this.get_col()) + this.get_row();
        var trans = '@' + this.get_direction() + '*' + this.get_distance();
        
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
        var regex = /^\s*([A-Z])?\s*(?:\:(\d+))?(?:\+(\d+))?(?:-(\d+))?\s*#([a-z])(\d+)\s*(?:\.(\d+))?\s*@(?:x|(\d+)(?:\*(\d+))?)\s*$/;
        var exec;
        while (exec = regex.exec(str))
        {
            console.log(exec);
            /*
            if (exec[1])
            {
                var player = exec[1].charCodeAt(0) - 'A'.charCodeAt(0);
                if (player !== move % num_players) {return false;}
            }
            
            var order = new sector8.order();
            order.set_min_turn(move + parseInt(exec[1]));
            */
        }
        
        /*
        if (match)
        {
            this.set_min_turn(turn + parseInt(match[1]));
            this.set_max_turn(turn + parseInt(match[2]));
            this.set_
        }
        */
    };
};
