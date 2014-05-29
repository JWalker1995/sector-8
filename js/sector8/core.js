goog.require('sector8.net');

goog.provide('sector8.core');

sector8.core = function()
{
    this.net = new sector8.net();
    this.net.connect('localhost', 7854);
    
    this.net.set_rouge_callback(function(query, data)
    {
        console.log('Rouge data: ', query, data);
    });
};
