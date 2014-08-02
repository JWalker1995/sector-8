util.crc32 = (function()
{
    var table;
    var make_table = function()
    {
        table = [];
        
        var c;
        for (var n = 0; n < 256*256; n++)
        {
            c = n;
            for (var k = 0; k < 16; k++)
            {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            table[n] = c;
        }
    };

    return function(str)
    {
        if (!table) {make_table();}

        var crc = 0 ^ (-1);

        for (var i = 0; i < str.length; i++)
        {
            crc = (crc >>> 16) ^ table[(crc ^ str.charCodeAt(i)) & 0xFFFF];
        }

        return (crc ^ (-1)) >>> 0;
    };
})();