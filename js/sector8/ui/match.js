goog.provide('sector8.ui.match');

goog.require('goog.dom');
goog.require('goog.functions');
goog.require('sector8.map');
goog.require('sector8.sectoid');

sector8.ui.match = function(map)
{
    if (!(this instanceof sector8.ui.match))
    {
        throw new Error('sector8.ui.match must be created with the new keyword');
    }

    var BOARD_SIZE_X = 8;
    var BOARD_SIZE_Y = 8;

    var CELL_SPACING = 80;

    var render_board = function()
    {
        var board = goog.dom.createDom('div', {'class': 'board'});

        var x = 0;
        while (x < BOARD_SIZE_X)
        {
            var y = 0;
            while (y < BOARD_SIZE_Y)
            {
                goog.dom.append(board, render_cell(x, y));
                y++;
            }
            x++;
        }

        return board;
    };

    var render_cell = function(x, y)
    {
        var style = 'left: ' + (x * CELL_SPACING) + 'px; top: ' + (y * CELL_SPACING) + 'px;';
        return goog.dom.createDom('div', {'class': 'cell', 'style': style});
    };

    var render_sectoid = function(sectoid)
    {
        if (!(sectoid instanceof sector8.sectoid))
        {
            throw new Error('sector8.match.render_sectoid(): First argument is not an instance of sector8.sectoid');
        }

        var style = 'left: ' + (sectoid.get_x() * CELL_SPACING) + 'px; top: ' + (sectoid.get_y() * CELL_SPACING) + 'px;';
        return goog.dom.createDom('div', {'class': 'sectoid', 'style': style});
    };
};
