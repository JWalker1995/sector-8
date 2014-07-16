goog.provide('sector8.order');

goog.require('goog.asserts');
goog.require('util.make_getters_setters');

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
        'call_move': false
    };
    // A :20+2-4 #b5 .01245 @4 !

    util.make_getters_setters(this, props);
    
    var moves_row = [ 0,-1,-1, 0, 1, 1, 1, 0,-1];
    var moves_col = [ 0, 0, 1, 1, 1, 0,-1,-1,-1];
    this.get_move_row = function()
    {
        return moves_row[this.get_direction() + 1];
    };
    this.get_move_col = function()
    {
        return moves_col[this.get_direction() + 1];
    };
    
    var char_number = '1'.charCodeAt(0) - 1;
    var char_lower = 'a'.charCodeAt(0) - 1;
    var char_upper = 'A'.charCodeAt(0) - 1;
    
    this.to_notation = function(pretty)
    {
        var player = String.fromCharCode(char_upper + this.get_player());
        var turns = ':' + this.get_turn() + '+' + this.get_wait() + '-' + this.get_duration();
        var sectoid = '#' + String.fromCharCode(char_lower + this.get_col() + 1) + (this.get_row() + 1);
        var trans = '@' + (this.get_direction() !== -1 ? this.get_direction() : 'x');
        var call_move = this.get_call_move() ? '!' : '';
        
        var sectors = '.';
        var i = 0;
        while (i < 8)
        {
            if ((this.get_sectors() >>> i) & 1)
            {
                sectors += i;
            }
            i++;
        }
        
        return [player, turns, sectoid, sectors, trans, call_move].join(pretty ? ' ' : '');
    };
    
    this.from_notation = function(str)
    {
        var regex = /^\s*([A-Z])?\s*(?:\:(\d+))?(?:\+(\d+))?(?:-(\d+))?\s*#([a-z])(\d+)\s*(?:\.(\d+))?\s*@(\d+|x)\s*(!?)\s*$/;
        var exec;
        if (exec = regex.exec(str))
        {
            if (!exec[1]) {exec[1] = '';}
            if (!exec[2]) {exec[2] = '';}
            if (!exec[3]) {exec[3] = '0';}
            if (!exec[4]) {exec[4] = '1';}
            if (!exec[7]) {exec[7] = '01234567';}
            if (exec[8] === 'x') {exec[8] = -1;}
            
            var sectors = 0;
            var i = 0;
            while (i < exec[7].length)
            {
                var sector = exec[7].charCodeAt(i) - char_number;
                if (sector >= 8) {return false;}
                sectors |= 1 << sector;
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
            this.set_call_move(!!exec[9]);
            
            return true;
        }
        else
        {
            return false;
        }
    };

    this.error_msg = function(config)
    {
        if (this.get_player() < 0) {return 'Player cannot be negative';}
        if (this.get_player() > config.sector8.max_players) {return 'Player cannot be greater than ' + config.sector8.max_players;}
        if (this.get_turn() < 1) {return 'Turn must be at least 1';}
        if (this.get_wait() < 0) {return 'Wait cannot be negative';}
        if (this.get_wait() > config.sector8.max_wait) {return 'Wait cannot be greater than ' + config.sector8.max_wait;}
        if (this.get_duration() < 1) {return 'Duration must be at least 1';}
        if (this.get_duration() > config.sector8.max_duration) {return 'Duration cannot be greater than ' + config.sector8.max_duration;}
        if (this.get_row() < 0) {return 'Row must be at least 1';}
        if (this.get_row() >= config.sector8.max_rows) {return 'Row cannot be greater than ' + config.sector8.max_rows;}
        if (this.get_col() < 0) {return 'Col must be at least 1';}
        if (this.get_col() >= config.sector8.max_cols) {return 'Col cannot be greater than ' + config.sector8.max_cols;}
        if (this.get_sectors() === 0) {return 'Sectors cannot be zero';}
        if (this.get_sectors() & (~0xFF)) {return 'Sectors must be a 8-bit unsigned int';}
        if (this.get_direction() < 0) {return 'Direction cannot be negative';}
        if (this.get_direction() >= 8) {return 'Direction must be less than 8';}
        return false;
    };
};
