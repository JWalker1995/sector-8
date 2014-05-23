goog.require('goog.dom');
goog.require('goog.async.Throttle');

goog.provide('sector8.login');

sector8.login = function(s8)
{
    var el;

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

        el = goog.dom.htmlToDocumentFragment(html);
    };

    this.render = goog.functions.cacheReturnValue(render);
    
    var update = function()
    {
        button.setAttribute('disabled', 'disabled');

        s8.net.request({
            'query': 'login',
            'username': username.value,
            'password': password.value
        }, function(reply)
        {
            switch (reply.msg)
            {
            case 'user logged in':
                login_successful();
                break;

            case 'email not validated':
                set_msg('button_msg', 'Email not validated');
                break;

            case 'login incorrect':
                set_msg('button_msg', 'Login incorrect');
                break;

            case 'username invalid':
                set_msg('username_msg', 'Username invalid');
                break;

            case 'username unavailable':
                set_msg('username_msg', 'Username unavailable');
                break;

            case 'guest logged in':
                login_successful();
                break;

            case 'username available':
                set_msg('username_msg', 'Username available');
                break;

            }
        });
    };
    var update_throttle = new goog.async.Throttle(update, throttle_ms);

    var login_successful = function()
    {
        el.setAttribute('display', 'none');
    };
    var set_msg = function(el_class, msg)
    {
        var msg = goog.dom.getElementByClass(el_class, el);
        msg.innerText = msg;
        msg.setAttribute('display', msg ? '' : 'none');
    };

    var username_changed = function()
    {
        username_msg.setAttribute('display', 'none');
        if (sector8.user.valiate_username(username.value))
        {
            update_throttle.fire();
        }
        else
        {
            username_invalid();
        }
    };

    var username_input = goog.dom.getElementByClass('username_input', el);
    username_input.oninput = username_input.onkeyup = username_input.onchange = username_changed;

    goog.dom.getElementByClass('password', el).setAttribute('display', 'none');
};
