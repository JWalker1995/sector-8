goog.provide('sector8.config.client');

goog.require('util.deepcopy');
goog.require('sector8.config.common');

sector8.config.client = function()
{
    util.deepcopy(this, new sector8.config.common());

    util.deepcopy(this, {
    	'includes': {
    		'image_path': 'images/'
    	},
        'geometry': {
            'cell_size': 100,
            'sector_img_size': 100,
            'sectoid_size': 80,
            'center_img_size': 40,
            'center_size': 40,
            'overlay_img_size': 100,
            //'float_offset': 20
        }
    });
};