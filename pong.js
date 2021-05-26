
// Globals:
var WIDTH = 600;
var HEIGHT = 500;
var PADDLEWIDTH = 90;
var UPARROW = 38;
var LEFTARROW = 37;
var RIGHTARROW = 39;
var DOWNARROW = 40;
var OFFWHITE = "#f9fafc";
var BLUE = "#3b79b4";
var RED = "#b4583b"
var BLACK = "#000000"

function randomOffset(min, max) {
    return (Math.random() * (max - min)) + min;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke, color) {
    ctx.fillStyle = color;
    if (typeof stroke === "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
}

// Paddle functions
function Paddle(x, y, color) {
    this.width = 90;
    this.height = 20;

    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = 0;
    this.color = color;
}

Paddle.prototype.render = function (ctx) {
    roundRect(ctx, this.x, this.y, this.height, this.width, 5, true, null, this.color);
};


Paddle.prototype.move = function (x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if (this.y < 0) {
        this.y = 0;
        this.y_speed = 0;
    }
    else if (this.y + this.height > HEIGHT) {
        this.y = HEIGHT - this.height;
        this.y_speed = 0;
    }
};

// Ball functions
function Ball(x, y, speedX, speedY, rad, color) {
    this.radius = rad || 5;
    this.default_x_position = function () {
        return typeof x === 'undefined' ? WIDTH / 2 : x;
    }
    this.default_y_position = function () {
        return typeof y === 'undefined' ? HEIGHT / 2 : y;
    }

    this.default_x_speed = function () { return typeof speedX === 'undefined' ? 3 : speedX; };
    this.default_y_speed = function () { return typeof speedY === 'undefined' ? 0 : speedY; };

    this.resetSpeed = function () {
        this.x_speed = this.default_x_speed();
        this.y_speed = this.default_y_speed();
    };
    this.resetPosition = function () {
        this.x = this.default_x_position();
        this.y = this.default_y_position();
    };

    this.reset = function () {
        this.resetSpeed();
        this.resetPosition();
    };

    this.reset();
}

Ball.prototype.render = function (ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    ctx.fill();
};

Ball.prototype.update = function (playerRight, playerLeft) {
    // The speed is applied to the x and y positions of the ball, which moves the ball.
    this.x += this.x_speed;
    this.y += this.y_speed;


    var left_x = this.x - this.radius;
    var left_y = this.y;
    var right_x = this.x + this.radius;
    var right_y = this.y;
    var top_x = this.x - this.radius;
    var top_y = this.y - this.radius;
    var bottom_x = this.x + this.radius;
    var bottom_y = this.y + this.radius;
    var paddleLeft = playerLeft.paddle;
    var paddleRight = playerRight.paddle;

    // Figures out if the ball direction should change.
    var ballHitLeftWall = this.y - this.radius < 0;
    var ballHitRightWall = this.y + this.radius > HEIGHT;
    if (ballHitLeftWall) {
        this.y = this.radius;
        this.y_speed = -this.y_speed;
    }
    else if (ballHitRightWall) {
        this.y = HEIGHT - this.radius;
        this.y_speed = -this.y_speed;
    }

    // When somebody scores, reset the ball to the center.
    var leftScored = this.x < 0;
    var rightScored = this.x > WIDTH;
    if (leftScored || rightScored) {

        if (leftScored) {
            playerRight.score++;
        }
        if (rightScored) {
            playerLeft.score++;
        }

        this.reset();
    }

    // Determines how much to change the ball speed.
    // When the ball hits a paddle:
    // the ball vertical trajectory reverses and gets set to a randomly but loosely based on the paddle speed,
    // and the horizontal speed increases by half the speed of the paddle.

    var ballInRightOfScreen = right_x > (WIDTH * 0.75);
    if (ballInRightOfScreen) {

        var rightPaddleYArea = paddleRight.y + paddleRight.width;
        var ballLeftIsUnderRightPaddle = left_y < rightPaddleYArea;
        var ballRightIsAboveRightPaddle = right_y > paddleRight.y;
        var ballYOverlapsRightPaddle = ballLeftIsUnderRightPaddle && ballRightIsAboveRightPaddle;

        var rightPaddleXArea = paddleRight.x + paddleRight.height;
        var ballXOverlapsRightPaddle = left_x < rightPaddleXArea && right_x > paddleRight.x;

        var ballHitRightPaddle = ballYOverlapsRightPaddle && ballXOverlapsRightPaddle;

        if (ballHitRightPaddle) {
            this.x_speed = randomOffset(-(Math.abs(paddleRight.y_speed || 4)), -0.9 * Math.abs(paddleRight.y_speed || 4));
            this.y_speed += (paddleRight.y_speed / 2);
            this.x += this.x_speed;
        }
    }
    else {
        var leftPaddleTop = paddleLeft.y + paddleLeft.width;
        var ballLeftIsOverLeftPaddle = right_y < leftPaddleTop;
        var ballRightIsUnderLeftPaddle = right_y > paddleLeft.y;
        
        var ballXOverlapsLeftPaddle = right_x < (paddleLeft.x + paddleLeft.height) && right_x > paddleLeft.x;

        var ballHitLeftPaddle = ballLeftIsOverLeftPaddle && ballRightIsUnderLeftPaddle && ballXOverlapsLeftPaddle;
        
        if (ballHitLeftPaddle) {
            this.x_speed = randomOffset(0.9 * Math.abs(paddleLeft.y_speed || 4), Math.abs(paddleLeft.y_speed || 4));
            this.y_speed += (paddleLeft.y_speed / 2);
            this.x += this.x_speed;
        }
    }

};
// Player functions
function Player() {
    this.score = 0;
    var paddleX = WIDTH - 30;
    var paddleY = (HEIGHT / 2) - (PADDLEWIDTH / 2);
    this.paddle = new Paddle(paddleX, paddleY, BLUE);
}

Player.prototype.render = function (ctx) {
    this.paddle.render(ctx);
    ctx.fillText(this.score.toString(), WIDTH-15, 30);
};

Player.prototype.update = function (keysDown) {
    var value;
    for (var key in keysDown) {
        value = Number(key);
        if (value === DOWNARROW) {
            this.paddle.move(0, 4);
        }
        else if (value === UPARROW) {
            this.paddle.move(0, -4);
        }
        else {
            this.paddle.move(0, 0);
        }
    }
};

Computer.prototype.update = function (keysDown) {
    var value;
    for (var key in keysDown) {
        value = Number(key);
        if (value === LEFTARROW) {
            this.paddle.move(0, 4);
        }
        else if (value === RIGHTARROW) {
            this.paddle.move(0, -4);
        }
        else {
            this.paddle.move(0, 0);
        }
    }
};

// Computer functions
function Computer() {
    this.score = 0;
    var paddleX = 10;
    var paddleY = (HEIGHT / 2) - (PADDLEWIDTH / 2);
    this.paddle = new Paddle(paddleX, paddleY, RED);
}
Computer.prototype.render = function (ctx) {
    this.paddle.render(ctx);
    ctx.fillText(this.score.toString(), 5, 30);
};


function pong(appendToElementId, window, document) {
    var el = document.getElementById(appendToElementId);
    var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };


    var canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.borderRadius = '5px';
    canvas.style.border = '2px solid ' + OFFWHITE;
    var context = canvas.getContext('2d');
    context.font = "12px sans-serif";
    
    var computer = new Computer();
    var player = new Player();
    var ball = new Ball()
    var keysDown = {}

    function render() {
        context.fillStyle = OFFWHITE;
        context.fillRect(0, 0, canvas.width, canvas.height);

        player.render(context);
        computer.render(context);
        ball.render(context);
    }

    function update() {
        player.update(keysDown);
        computer.update(keysDown);
        ball.update(player, computer);
    }

    function step() {
        update();
        render(context);
        animate(step);
    }

    el.appendChild(canvas);
    animate(step);

    var keydownEvent = function (event) {
        keysDown[event.keyCode] = true;
    };
    var keyupEvent = function (event) {
        delete keysDown[event.keyCode];
    };  

    var elementDestroyed = function (event) {
        window.removeEventListener('keydown', keydownEvent, false);
        window.removeEventListener('keyup', keyupEvent, false);
        window.removeEventListener('DOMNodeRemoved', elementDestroyed, false);
    };

    window.addEventListener("keydown", keydownEvent);
    window.addEventListener("keyup", keyupEvent);
    window.addEventListener("DOMNodeRemoved", elementDestroyed);

    return el;

}