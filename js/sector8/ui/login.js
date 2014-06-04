goog.provide('sector8.ui.login');

goog.require('goog.dom');
goog.require('goog.functions');
goog.require('goog.async.Throttle');
goog.require('util.make_children_obj');
goog.require('sector8.user');

sector8.ui.login = function(core)
{
    goog.asserts.assertInstanceof(this, sector8.ui.login);

    var els;

    var render = function()
    {
        var html = '';
        html += '<div class="login">';
            html += '<div class="username">';
                html += '<label for="username_input">Username:</label><br />';
                html += '<input id="username_input" class="username_input" type="text" />';
                html += '<span class="username_msg"></span>';
            html += '</div>';
        
            html += '<div class="password">';
                html += '<label for="password_input">Password:</label><br />';
                html += '<input id="password_input" class="password_input" type="password" />';
                html += '<span class="password_msg"></span>';
            html += '</div>';

            html += '<button class="button" disabled="disabled">Login</button>';
            html += '<span class="button_msg"></span>';
        html += '</div>';

        var el = goog.dom.htmlToDocumentFragment(html);
        els = util.make_children_obj(el);

        els.username_input.oninput = els.username_input.onkeyup = els.username_input.onchange = username_changed;

        els.password.setAttribute('display', 'none');

        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
    
    var update = function()
    {
        els.button.setAttribute('disabled', 'disabled');

        core.net.request('login', {
            'username': els.username.value,
            'password': els.password.value
        }, function(reply)
        {
            switch (reply.msg)
            {
            case 'user logged in':
                login_successful();
                break;

            case 'email not validated':
                set_msg(els.button_msg, 'Email not validated');
                break;

            case 'login incorrect':
                set_msg(els.button_msg, 'Login incorrect');
                break;

            case 'username invalid':
                set_msg(els.username_msg, 'Username invalid');
                break;

            case 'username unavailable':
                set_msg(els.username_msg, 'Username unavailable');
                break;

            case 'guest logged in':
                login_successful();
                break;

            case 'username available':
                set_msg(els.username_msg, 'Username available');
                break;

            }
        });
    };
    var update_throttle = new goog.async.Throttle(update, 1000);

    var login_successful = function()
    {
        el.setAttribute('display', 'none');
    };
    
    var set_msg = function(msg_el, msg)
    {
        msg_el.innerText = msg;
        msg_el.setAttribute('display', msg ? '' : 'none');
    };

    var username_changed = function()
    {
        console.log('abc');
        set_msg(els.username_msg, '');
        if (sector8.user.validate_username(els.username_input.value))
        {
            update_throttle.fire();
        }
    };
};
