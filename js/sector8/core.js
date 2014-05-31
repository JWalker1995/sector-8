goog.provide('sector8.core');

goog.require('util.logger');
goog.require('sector8.net');

sector8.core = function()
{
    this.logger = new util.logger();

    /*
    this.logger.log_trace('trace');
    this.logger.log_event('event');
    this.logger.log_alert('alert');
    this.logger.log_notice('notice');
    this.logger.log_warning('warning');
    this.logger.log_fatal('fatal');
    */
    
    this.net = new sector8.net(this);
};
