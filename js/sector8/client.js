goog.provide('sector8.client');

goog.require('goog.functions');
goog.require('sector8.ui.ui');

sector8.client = function(core)
{
    var ui = new sector8.ui.ui(core);
    
    var run = function()
    {
        setup_net();
        
        return ui.render();
    };
    this.run = goog.functions.cacheReturnValue(run);
    
    var setup_net = function()
    {
        core.net.connect('localhost', 7854);
    };
};