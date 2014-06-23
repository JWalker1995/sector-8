goog.provide('sector8.config');

var fs = require('fs');

sector8.config = function(core)
{
    var _this = this;
    
    this.load = function(path)
    {
        core.logger.log(core.logger.trace, 'Loading config at path "' + path + '"...');
        var json = fs.readFileSync(path);

        core.logger.log(core.logger.trace, 'Parsing config...');
        var config = JSON.parse(json);

        core.logger.log(core.logger.trace, 'Finished parsing config.');

        copy(_this, config);
    };
    
    var copy = function(to, from)
    {
        for (var i in from)
        {
            if (typeof to[i] !== 'object')
            {
                to[i] = from[i];
            }
            else
            {
                copy(to[i], from[i]);
            }
        }
    };
};