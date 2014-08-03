require('../../sector8/ui');

goog.require('goog.dom');
goog.require('goog.functions');
require('../../util/assert');
require('../../util/make_children_obj');

sector8.ui.user_list = function(core)
{
    util.assert(this instanceof sector8.ui.user_list);
    
    var els;

    var render = function()
    {
        var html = '';
        html += '<div class="user_list">';
        html += '</div>';

        var el = goog.dom.htmlToDocumentFragment(html);
        els = util.make_children_obj(el);

        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
};
