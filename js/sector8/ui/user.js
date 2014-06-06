goog.provide('sector8.ui.user');

goog.require('goog.dom');
goog.require('goog.functions');
goog.require('util.make_children_obj');

sector8.ui.user = function(core)
{
    var els;

    var render = function()
    {
        var html = '';
        html += '<div class="user">';
            html += '<span class="username"></span>';
            html += '<span class=""></span>';
        html += '</div>';

        var el = goog.dom.htmlToDocumentFragment(html);
        els = util.make_children_obj(el);

        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
};
