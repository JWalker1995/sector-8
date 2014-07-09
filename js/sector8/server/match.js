goog.provide('sector8.server.match');

goog.require('goog.asserts');

sector8.server.match = function(core, match, sessions)
{
    var _this = this;
    
    goog.asserts.assertInstanceof(this, sector8.server.match);
    
    this.order = function(str)
    {
        // Needs to validate the order string before sending it
        
        sessions.forEach(function(session)
        {
            session.send_order(str);
        });
    };
    
    this.move = function()
};