var canvas = document.querySelector('canvas');
canvas.width = 600;
canvas.height = 800;
var c = canvas.getContext('2d');

let mouseX = 0;
let mouseY = 0;
let dragging = false;
let friction = 0.99;
let turn;
let points = {me: 0, peers: 0};

let hostB = document.getElementById("host");
let conB = document.getElementById("con");
let input = document.getElementById("conId");
let scores = document.getElementById("scores");

let peer = new Peer();
let id = null;

peer.on('open', function(id1) {
  id = id1;
});

hostB.addEventListener("click", () => {
  peer.on('connection', function(conn1) {
    conn = conn1
    conn.on('data', function(data) {
      console.log('Received', data);
      turn = true;
      circleArray = decode(data);
    });
    setTimeout(function() {
      conn.send(encode(circleArray));
    }, 100);
  });

  alert("Id: " + id);
});
conB.addEventListener("click", () => {
  connectToPeerId(input.value);
});

let conn = false;

function connectToPeerId(id) {
  conn = peer.connect(id);

  console.log(conn);

  conn.on('open', function() {

    console.log("OPENED!!!!!");

    // Receive messages

    conn.on('data', function(data) {
      console.log('Received', data);
      turn = true;
      circleArray = decode(data);
    });


    // Send messages

    turn = false;


    /*conn.on('data', function(data) {
      console.log('Received', data);
      circleArray = decode(data);
    });*/


  });
}

function encode(arr) {
  let encArr = []
  for(let i = 0; i < arr.length; i++) {
    encArr.push({x: arr[i].x, y: arr[i].y, dx: arr[i].velocity.x, dy: arr[i].velocity.y, color: arr[i].color, radius: arr[i].radius});
  }
  return encArr;
}

function decode(arr) {
  let decArr = [];
  for(let i = 0; i < arr.length; i++) {
    decArr.push(new Circle(arr[i].x, arr[i].y, arr[i].dx, arr[i].dy, arr[i].radius, 1, arr[i].color));
  }
  return decArr;
}

window.addEventListener("click", function(e) {
  if(!dragging && turn) {
    if(distance(mouseX, mouseY, circleArray[circleArray.length - 1].x, circleArray[circleArray.length - 1].y) < 35) {
      dragging = true;
    }
  } else if(turn) {
    let xDif = e.clientX - circleArray[circleArray.length - 1].x;
    let yDif = e.clientY - circleArray[circleArray.length - 1].y;
    circleArray[circleArray.length - 1].velocity.x = xDif * -0.05;
    circleArray[circleArray.length - 1].velocity.y = yDif * -0.05;
    dragging = false;
    if(conn) {
      conn.send(encode(circleArray));
      turn = false;
    }
  }
});

window.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
})

window.addEventListener("resize", function(){
    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;
    //init();
});

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var palette = ["#faf3f3", "#e1e5ea", "#a7bbc7", "#da7f8f"];

function colorfrompalette() {
    return palette[Math.floor(Math.random() * palette.length)];
}

function randomNumber(n1, n2) {
return Math.random() * (n2 - n1) + n1;
}

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m2 - m1) / (m1 + m2) + u1.x * 2 * m1 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}


function Circle(x, y, dx, dy, radius, mass, color = colorfrompalette()) {
    this.x = x;
    this.y = y;
    this.velocity = {
        x: dx,
        y: dy
    };
    this.radius = radius;
    this.color = color;
    this.mass = mass;

    this.draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    if(circleArray.indexOf(this) == circleArray.length - 1 && turn) {
      c.beginPath();
      c.strokeStyle = "#abb1e0";
      c.lineWidth = 2;
      c.arc(this.x, this.y, this.radius + 1, 0, Math.PI * 2, false);
      c.stroke();
    }
    }

    this.update = function() {
    if(this.x+this.radius > canvas.width || this.x-this.radius <0) {
        this.velocity.x=-this.velocity.x;
    }
    if(this.y+this.radius > canvas.height || this.y-this.radius <0) {
        this.velocity.y=-this.velocity.y;
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.x *= friction;
    this.velocity.y *= friction;

    if(distance(canvas.width, canvas.height, this.x, this.y) - this.radius < 45 || distance(0, canvas.height, this.x, this.y) - this.radius < 45 || distance(canvas.width, 0, this.x, this.y) - this.radius < 45 || distance(0, 0, this.x, this.y) - this.radius < 45) {
      if(circleArray.length > 1 && circleArray.indexOf(this) == circleArray.length - 1) {
        circleArray.splice([circleArray.indexOf(this)], 1);
        init();
        console.log(112);
      } else {
        circleArray.splice([circleArray.indexOf(this)], 1);
        dragging = false;
        if(!turn || !conn) {
          points.me++;
        } else if(turn) {
          points.peers++;
        }
      }
      //console.log(circleArray.indexOf(this));
    }

    this.draw();
    for(let i=0; i < circleArray.length; i++) {
        if(this !== circleArray[i])
        if(distance(this.x, this.y, circleArray[i].x, circleArray[i].y) - radius * 2 < 0) {
            resolveCollision(this, circleArray[i])
        }

    }
    }
}

var circleArray;

function init() {
circleArray = [];

points = {me: 0, peers: 0};

turn = true;

for(var i = 0; i<20; i++) {
    let radius = 20;
    let x = randomNumber(radius, canvas.width-radius);
    let y = randomNumber(radius, canvas.height-radius);
    //let dx = randomNumber(-10, 10);
    //let dy = randomNumber(-10, 10);
    let mass = 1;

    if(i !== 0) {
        for(let j = 0; j < circleArray.length; j++) {
            if(distance(x, y, circleArray[j].x, circleArray[j].y) - radius * 2 < 0) {
                x = randomNumber(radius, innerWidth-radius);
                y = randomNumber(radius, innerHeight-radius);

                j = -1
            }
        }
    }


    // debug: console.log(x,y,dx,dy,radius);
    circleArray.push(new Circle(x, y, 0, 0, radius, mass));
  }

  circleArray[circleArray.length - 1].color = "#000000";

}

function drawHole(x, y, r) {
  c.fillStyle = "#000000";
  c.beginPath();
  c.arc(x, y, r, Math.PI * 2, false);
  c.fill();
  c.fillStyle = "gray";
  c.beginPath();
  c.arc(x, y, r-5, Math.PI * 2, false);
  c.fill();
}

function animate() {
    requestAnimationFrame(animate);
    //c.clearRect(0, 0, innerWidth, innerHeight);
    c.fillStyle = "rgba(44, 130, 87, 0.5)"
    c.fillRect(0, 0, innerWidth, innerHeight);

    drawHole(0, canvas.height, 50);
    drawHole(canvas.width, 0, 50);
    drawHole(0, 0, 50);
    drawHole(canvas.width, canvas.height, 50);

    for(var i = circleArray.length; i > 0; i--) {
        circleArray[i-1].update();
        //console.log("looooooop");
    }

    if(dragging) {
      c.strokeStyle = "black";
      c.beginPath();
      c.moveTo(circleArray[circleArray.length - 1].x, circleArray[circleArray.length - 1].y);
      c.lineTo(mouseX, mouseY);
      c.stroke();
      c.closePath();
    }

    scores.innerHTML = `Scores ${points.me} - ${points.peers}`;
}


init();
animate();
