const debug_mode = false;
const SQUARE_WIDTH = 62;
const SQUARE_HEIGHT = 49;
const PYLON_Y_OFFSET = 30;
const CYBER_Y_OFFSET = 90;
const GATEWAY_Y_OFFSET = 90;
const SQUARE_Y_OFFSET = -30;

//Winning Square: (14, 11)
//These coordinates are the center of the Pylon
const PYLON_X = 14;
const PYLON_Y = 11;

//These coordinates are the top left of the image.
//This is distinct from the pylon because gateway
//and cyber are 3x3 while pylon is 2x2. 
const CYBER_X = 11;
const CYBER_Y = 4;
const GATE_X = 9;
const GATE_Y = 6;

var state;

var bad_squares;
var clicked;
var troll_x, troll_y;
var x, y;
var clicked_x, clicked_y;
var menu_screen, play_hover, launching;
var pylon, pylon_built, pylon_power, cyber_unpowered, gateway_unpowered, cyber_powered, gateway_powered, ramp;
var game_over, play_again_hover;

var opacity = 0;
var fading = false;

var play_sound, game_sound, pylon_sound, losing_screen_sound, play_again_sound;

function reset()
{
    clicked = false;
    bad_squares = new Set;
    //Left Cliff
    for(var i = 0; i < 9; i++)
    {
	for(var j = 0; j < 3; j++)
	    bad_squares.add((i + 0) + ',' + (j + 4));
    }
    for(var i = 0; i < 4; i++)
    {
	for(var j = 0; j < 1; j++)
	    bad_squares.add((i + 4) + ',' + (j + 7));
    }
    for(var i = 0; i < 2; i++)
    {
	for(var j = 0; j < 2; j++)
	    bad_squares.add((i + 5) + ',' + (j + 7));
    }
    for(var i = 0; i < 6; i++)
    {
	for(var j = 0; j < 2; j++)
	    bad_squares.add((i + 6) + ',' + (j + 2));
    }
    for(var i = 0; i < 11; i++)
    {
	for(var j = 0; j < 3; j++)
	    bad_squares.add((i + 10) + ',' + (j + 0));
    }
    for(var i = 0; i < 1; i++)
    {
	for(var j = 0; j < 2; j++)
	    bad_squares.add((i + 9) + ',' + (j + 4));
    }
    bad_squares.add('10,4');
    for(var i = 0; i < 3; i++)
    {
	for(var j = 0; j < 3; j++)
	    bad_squares.add((i + 15) + ',' + (j + 12));
    }
    for(var i = 0; i < 1; i++)
    {
	for(var j = 0; j < 2; j++)
	    bad_squares.add((i + 20) + ',' + (j + 3));
    }
    bad_squares.add('19,3');

    var troll = Math.round(Math.random() * 3) - 2;
    troll += troll == 0 ? 1 : 0;
    troll_x = troll % 2;
    troll_y = (troll + Math.sign(troll)) % 2;

    game_sound.currentTime = 2;
}

function start_game()
{
    state = 'main_menu';
    
    menu_screen = new Image;
    play_hover = new Image;
    launching = new Image;

    menu_screen.src = "main_menu.png";
    play_hover.src = "play_hover.png";
    launching.src = "launching.png";
    
    pylon = new Image;
    pylon_built = new Image;
    pylon_power = new Image;
    cyber_unpowered = new Image;
    gateway_unpowered = new Image;
    cyber_powered = new Image;
    gateway_powered = new Image;
    ramp = new Image;
    
    pylon.src = "pylon.png";
    pylon_built.src = "pylon_built.png";
    pylon_power.src = "pylon_effect.png";
    cyber_unpowered.src = "cyber_unpowered.png";
    gateway_unpowered.src = "gateway_unpowered.png";
    cyber_powered.src = "cyber_powered.png";
    gateway_powered.src = "gateway_powered.png";
    ramp.src = "ramp.png";

    game_over = new Image;
    play_again_hover = new Image;

    game_over.src = "game_over.png";
    play_again_hover.src = "play_again_hover.png";

    play_sound = new Audio("play_sound.mp3");
    game_sound = new Audio("game_sound.mp3");
    pylon_sound = new Audio("pylon_sound.mp3");
    losing_screen_sound = new Audio("losing_screen_sound.mp3");
    play_again_sound = new Audio("play_again_sound.mp3");

    losing_screen_sound.loop = true;
    game_sound.loop = true;

    reset();
    game.start();
}

function draw_game(x, y)
{
    game.context.drawImage(ramp, 0, 0);
    if(clicked)
    {
	var square_x = Math.round(clicked_x / SQUARE_WIDTH);
	var square_y = Math.round((clicked_y - SQUARE_Y_OFFSET) / SQUARE_HEIGHT);

	var correct = false;
	if(square_x == PYLON_X && square_y == PYLON_Y)
	{
	    correct = true; 
	    square_x += troll_x;
	    square_y += troll_y;
	}
	var square_x_coord = square_x * SQUARE_WIDTH;
	var square_y_coord = square_y * SQUARE_HEIGHT + SQUARE_Y_OFFSET;
	
	game.context.drawImage(cyber_powered, CYBER_X * SQUARE_WIDTH, CYBER_Y * SQUARE_HEIGHT + SQUARE_Y_OFFSET - CYBER_Y_OFFSET);
	game.context.drawImage(gateway_powered, GATE_X * SQUARE_WIDTH, GATE_Y * SQUARE_HEIGHT + SQUARE_Y_OFFSET - GATEWAY_Y_OFFSET);
	game.context.drawImage(pylon, PYLON_X * SQUARE_WIDTH - pylon.width / 2, PYLON_Y * SQUARE_HEIGHT - pylon.height / 2 - PYLON_Y_OFFSET + SQUARE_Y_OFFSET);
	game.context.drawImage(pylon_built, square_x_coord - pylon_built.width / 2, square_y_coord - pylon_built.height / 2 + SQUARE_Y_OFFSET);
	for(var i = -1; i < 1; i++)
	{
	    for(var j = -1; j < 1; j++)
	    {
		var sq_x = square_x + i;
		var sq_y = square_y + j;
		if(bad_squares.has(sq_x + ',' + sq_y))
		{
		    game.context.strokeStyle = "rgba(128, 128, 128, 0.5)";
		    game.context.beginPath();
		    game.context.rect(x * SQUARE_WIDTH, y * SQUARE_HEIGHT + SQUARE_Y_OFFSET, SQUARE_WIDTH, SQUARE_HEIGHT);
		    game.context.rect((sq_x) * SQUARE_WIDTH, (sq_y) * SQUARE_HEIGHT + SQUARE_Y_OFFSET, SQUARE_WIDTH, SQUARE_HEIGHT);
		    game.context.stroke();
		    
		    game.context.fillStyle = "rgba(255, 0, 0, 0.3)";		    
		    game.context.beginPath();
		    game.context.rect((sq_x) * SQUARE_WIDTH, (sq_y) * SQUARE_HEIGHT + SQUARE_Y_OFFSET, SQUARE_WIDTH, SQUARE_HEIGHT);
		    game.context.fill();
		}
	    }
	}
    }
    else
    {
	var square_x = Math.round(x / SQUARE_WIDTH);
	var square_y = Math.round((y - SQUARE_Y_OFFSET) / SQUARE_HEIGHT);
	var square_x_coord = square_x * SQUARE_WIDTH;
	var square_y_coord = square_y * SQUARE_HEIGHT + SQUARE_Y_OFFSET;

	game.context.drawImage(pylon_power, square_x_coord - pylon_power.width / 2, square_y_coord - pylon_power.height / 2);
	for(var i = -4; i < 4; i++)
	{
	    var end = i < 1 ? Math.min(i, -2) + 6 : 5 - i;
	    var start = -end;
	    for(var j = start; j < end; j++)
	    {
		var x = square_x + i;
		var y = square_y + j;
		game.context.strokeStyle = "rgba(128, 128, 128, 0.5)";
		game.context.beginPath();
		game.context.rect(x * SQUARE_WIDTH, y * SQUARE_HEIGHT + SQUARE_Y_OFFSET, SQUARE_WIDTH, SQUARE_HEIGHT);
		game.context.stroke();
		if(bad_squares.has(x + ',' + y))
		{
		    game.context.beginPath();
		    game.context.rect(x * SQUARE_WIDTH, y * SQUARE_HEIGHT + SQUARE_Y_OFFSET, SQUARE_WIDTH, SQUARE_HEIGHT);
		    game.context.fillStyle = "rgba(201, 170, 0, 0.2)";
		    game.context.fill();
		}
	    }
	}
	for(var i = -1; i < 1; i++)
	{
	    for(var j = -1; j < 1; j++)
	    {
		game.context.beginPath();
		if(bad_squares.has((square_x + i) + ',' + (square_y + j)))
		    game.context.fillStyle = "rgba(255, 0, 0, 0.3)";
		else
		    game.context.fillStyle = "rgba(0, 255, 0, 0.3)";
		
		game.context.rect((square_x + i) * SQUARE_WIDTH, (square_y + j) * SQUARE_HEIGHT + SQUARE_Y_OFFSET, SQUARE_WIDTH, SQUARE_HEIGHT);
		game.context.fill();
	    }
	}
	game.context.drawImage(pylon, square_x_coord - pylon.width / 2, square_y_coord - pylon.height / 2 - PYLON_Y_OFFSET);
    }
    
    draw_debug();

}

function draw_debug()
{
    if(!debug_mode)
	return;

    game.context.strokeStyle = "rgba(0, 0, 0, 1)";
    for(var i = 0; i <= game.canvas.width; i += SQUARE_WIDTH)
    {
	game.context.beginPath();
	game.context.moveTo(i, 0);
	game.context.lineTo(i, game.canvas.height + SQUARE_Y_OFFSET);
	game.context.stroke();
    }
    for(var i = 0; i <= game.canvas.height; i += SQUARE_HEIGHT)
    {
	game.context.beginPath();
	game.context.moveTo(0, i + SQUARE_Y_OFFSET);
	game.context.lineTo(game.canvas.width, i + SQUARE_Y_OFFSET);
	game.context.stroke();
    }
    game.context.drawImage(pylon, PYLON_X * SQUARE_WIDTH - pylon.width / 2, PYLON_Y * SQUARE_HEIGHT - pylon.height / 2 - PYLON_Y_OFFSET + SQUARE_Y_OFFSET);
}

const PLAY_X1 = 74;
const PLAY_Y1 = 628;
const PLAY_X2 = 227;
const PLAY_Y2 = 674;

function draw_menu(x, y)
{
    game.context.drawImage(menu_screen, 0, 0);
    if(clicked)
	game.context.drawImage(launching, PLAY_X1, PLAY_Y1);
    else if((PLAY_X1 <= x && x <= PLAY_X2) &&
	    (PLAY_Y1 <= y && y <= PLAY_Y2))
	game.context.drawImage(play_hover, PLAY_X1, PLAY_Y1);
}

const PLAY_AGAIN_X1 = 533;
const PLAY_AGAIN_Y1 = 378;
const PLAY_AGAIN_X2 = 730;
const PLAY_AGAIN_Y2 = 408;

function draw_game_over(x, y)
{
    game.context.drawImage(game_over, 0, 0);    
    if(clicked)
    {
	state = 'game';
	reset();
	losing_screen_sound.pause();
	losing_screen_sound.currentTime = 0;
	play_again_sound.play();
	game_sound.play();
	redraw(x, y);
    }
    else if((PLAY_AGAIN_X1 <= x && x <= PLAY_AGAIN_X2) &&
	    (PLAY_AGAIN_Y1 <= y && y <= PLAY_AGAIN_Y2))
	game.context.drawImage(play_again_hover, PLAY_AGAIN_X1, PLAY_AGAIN_Y1);
}

function redraw(x, y)
{
    if(fading)
	return;
    
    game.clear()

    if(state == 'main_menu')
    {
	draw_menu(x, y);
    }
    else if(state == 'game')
    {
	draw_game(x, y);
    }
    else if(state == 'game_over')
    {
	draw_game_over(x, y);
    }
}

function handle_click(x, y)
{
    if(fading)
	return;
    
    if(state == 'main_menu')
    {
	if((PLAY_X1 <= x && x <= PLAY_X2) &&
	   (PLAY_Y1 <= y && y <= PLAY_Y2))
	{
	    clicked = true;
	    play_sound.play();
	}
	setTimeout(function()
		   {
		       clicked = false;
		       state = 'game';
		       game_sound.currentTime = 2;
		       game_sound.play();
		       redraw(x, y);
		   }, 2000);
    }
    else if(state == 'game')
    {
	if(!clicked)
	{
	    clicked = true;
	    game_sound.pause();
	    pylon_sound.play();
	    losing_screen_sound.play();
	    clicked_x = x;
	    clicked_y = y;
	    setTimeout(function()
		       {
			   fading = true;
			   (function fade_to_game_over()
			    {
				game.context.globalAlpha = opacity;
				game.context.drawImage(game_over, 0, 0);
				opacity += 0.01;
				if(opacity < 1)
				{
				    requestAnimationFrame(fade_to_game_over);
				}
				else
				{
				    fading = false;
				    state = 'game_over';
				    opacity = 0.0;
				    clicked = false;
				}
			    })();
		       }, 2000);
	}
	for(var i = 0; i < 3; i++)
	{
	    for(var j = 0; j < 3; j++)
		bad_squares.add((CYBER_X + i) + ',' + (CYBER_Y + j));
	}
	for(var i = 0; i < 3; i++)
	{
	    for(var j = 0; j < 3; j++)
		bad_squares.add((GATE_X + i) + ',' + (GATE_Y + j));
	}
    }
    else if(state == 'game_over')
    {
	if((PLAY_AGAIN_X1 <= x && x <= PLAY_AGAIN_X2) &&
	   (PLAY_AGAIN_Y1 <= y && y <= PLAY_AGAIN_Y2))
	    clicked = true;
    }    
    redraw(x, y);
}

var game =
    {
	canvas : document.createElement("canvas"),	
	start : function()
	{
	    function get_mouse_pos(canvas, evt)
	    {
		var rect = game.canvas.getBoundingClientRect();
		return { x : evt.clientX - rect.left, y : evt.clientY - rect.top };
	    }	    

	    this.canvas.addEventListener("mousemove", function(evt)
					 {
					     var mouse_pos = get_mouse_pos(this.canvas, evt);
					     redraw(mouse_pos.x, mouse_pos.y);
					 }, false);
	    this.canvas.addEventListener("mousedown", function(evt)
					 {
					     var mouse_pos = get_mouse_pos(this.canvas, evt);
					     handle_click(mouse_pos.x, mouse_pos.y);
					 }, false);
	    this.canvas.width = ramp.width;
	    this.canvas.height = ramp.height;
	    this.context = this.canvas.getContext("2d");
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        },
	clear : function()
	{
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
    }
