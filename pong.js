
// Globals:
var WIDTH = 800;
var HEIGHT = 500;
var PADDLEWIDTH = 90;
var UPARROW = 38;
var DOWNARROW = 40;
var OFFWHITE = "#f9fafc";
var BLUE = "#3b79b4";
var RED = "#b4583b"


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

    var keysDown = {}

    function render() {
        context.fillStyle = OFFWHITE;
        context.fillRect(0, 0, canvas.width, canvas.height);

        player.render(context);
        computer.render(context);
    }

    function update() {
        player.update(keysDown);
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