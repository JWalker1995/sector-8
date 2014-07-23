goog.provide('sector8.ui.challenge_list');

goog.require('sector8.match');

sector8.ui.challenge_list = function(core)
{
    goog.asserts.assertInstanceof(this, sector8.ui.challenge_list);

    var no_challenges;
    var challenges = [];
    var num_challenges = 0;
    
    var render = function()
    {
        var list = goog.dom.createDom('div', {'class': 'challenge_list'});
        
        no_challenges = goog.dom.createDom('div', {'class': 'no_challenges'}, 'There\'s no challenges posted right now.');
        goog.dom.append(list, no_challenges);
        
        // Request matches that haven't started yet (challenges)
        core.net.request('watch_challenges', {}, function(data, reply)
        {
            var i = 0;
            while (i < data.length)
            {
                if (data[i][1])
                {
                    var item = create_challenge();
                    goog.dom.append(list, item);
                }
                i++;
            }
            
            for (var id in data.matches)
            {
                var challenge = challenges[id];
                if (typeof challenge !== 'object')
                {
                    var item = create_challenge();
                    goog.dom.append(list, item);
                    
                    challenge = challenges[id] = {
                        'els': util.make_children_obj(item),
                        'match': new sector8.match()
                    };
                    num_challenges++;
                }
                
                challenge.match.from_obj(data.matches[id]);
                
                if (challenge.match.get_start_date().getTime())
                {
                    goog.dom.removeNode(challenge.els.challenge);
                    delete challenges[id];
                    num_challenges--;
                }
                else
                {
                    update_challenge(challenge);
                }
            }
            
            no_challenges.setAttribute('display', num_challenges ? 'none' : '');
        });
        
        return list;
    };

    this.render = goog.functions.cacheReturnValue(render);
    
    var create_challenge = function()
    {
        var html = '';
        html += '<div class="challenge">';
            html += '<div class="challenge_name"></div>';
            html += '<div class="challenge_players"></div>';
            html += '<div class="challenge_map"></div>';
            html += '<div class="challenge_turn_type"></div>';
            html += '<div class="challenge_timer_type"></div>';
            html += '<div class="challenge_spectators"></div>';
            html += '<div class="challenge_stakes"></div>';
        html += '</div>';
        
        return goog.dom.htmlToDocumentFragment(html);
    };
    
    var update_challenge = function(challenge)
    {
        challenge.els.challenge_name.innerText = challenge.match.get_name();
        challenge.els.challenge_players.innerText = challenge.match.get_players().join(', ');
        challenge.els.challenge_map.innerText = challenge.match.get_map().get_name();
        challenge.els.challenge_turn_type.innerText = challenge.match.get_turn_type();
        challenge.els.challenge_timer_type.innerText = challenge.match.get_timer_type();
        challenge.els.challenge_spectators.innerText = challenge.match.get_spectators() ? 'Yes' : 'No';
        challenge.els.challenge_stakes.innerText = challenge.match.get_stakes();
    };
};