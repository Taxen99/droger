let canvas = document.getElementById("c");
let c = canvas.getContext("2d");
let grid = canvas.width / 20

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyA1mXP64FgZzKsqf0z1AOfyt8WElQrjrqU",
  authDomain: "leaderboards-351f8.firebaseapp.com",
  projectId: "leaderboards-351f8",
  storageBucket: "leaderboards-351f8.appspot.com",
  messagingSenderId: "303733636376",
  appId: "1:303733636376:web:5157b99fb63216fda0326d",
  measurementId: "G-KQ1R94DZH0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let database = firebase.database();
let ref = database.ref("snake/scores");

ref.on("value", getData, errData);

let ents;

function getData(allData) {
  let data = allData.val();
  let keys = Object.keys(data);
  ents = [];
  console.log(data, keys);
  for (var i = 0; i < keys.length; i++) {
    ents.push(data[keys[i]]);
  }
  ents.sort(function(a, b) {
    return b.score - a.score;
  });
  console.log("ents: ", ents);
  if(ents[0]) s1.innerHTML = ents[0].name +  " " + ents[0].score;
  if(ents[1]) s2.innerHTML = ents[1].name +  " " + ents[1].score;
  if(ents[2]) s3.innerHTML = ents[2].name +  " " + ents[2].score;
  if(ents[3]) s4.innerHTML = ents[3].name +  " " + ents[3].score;
  if(ents[4]) s5.innerHTML = ents[4].name +  " " + ents[4].score;
}

function errData(err) {
  console.error(err);
}

let s1 = document.getElementById("1");
let s2 = document.getElementById("2");
let s3 = document.getElementById("3");
let s4 = document.getElementById("4");
let s5 = document.getElementById("5");

let submitB = document.getElementById("Submit");
let uName = document.getElementById("name");

submitB.addEventListener("click", () => {
  let data = {
    name: uName.value,
    score: hScore
  }
  if(!ents.some(e => e.name == data.name)) {
    ref.push(data);
  }
});

let difficulty = 400;

let eB = document.getElementById("e");
let mB = document.getElementById("m");
let hB = document.getElementById("h");

mB.style.border = "3px solid #85cc85";

function resetBorders() {
  eB.style.border = "2px solid #85cc85";
  mB.style.border = "2px solid #85cc85";
  hB.style.border = "2px solid #85cc85";
}

eB.addEventListener("click", () => {
  resetBorders();
  eB.style.border = "3px solid #85cc85";
  difficulty = 400;
  reset();
});

mB.addEventListener("click", () => {
  resetBorders();
  mB.style.border = "3px solid #85cc85";
  difficulty = 200;
  reset()
});

hB.addEventListener("click", () => {
  resetBorders();
  hB.style.border = "3px solid #85cc85";
  difficulty = 100;
  reset();
});

let play = document.getElementById("play");

let gameOn = false

play.addEventListener("click", () => {
  if(!gameOn) {
    play.style.display = "none";
    gameOn = true;
  }
});

class Snake {
  constructor(x = random(0, canvas.width / grid - 1) * grid, y = random(0, canvas.width / grid - 1) * grid, s = grid) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.dir = {x: 0, y: 0};
    this.body = [{x: this.x, y: this.y}];
  }

  draw() {
    c.fillStyle = "#00ff00";
    for(let i = 0; i < this.body.length; i++) {
      c.fillRect(this.body[i].x, this.body[i].y, this.s, this.s);
    }
  }
  setDir() {
    let bDir = this.dir;
    switch (moves[0]) {
      case 87:
        if(this.dir.y != 1) {
          this.dir = {x: 0, y: -1};
        }
        break;
      case 83:
        if(this.dir.y != -1) {
          this.dir = {x: 0, y: 1};
        }
        break;
      case 65:
        if(this.dir.x != 1) {
          this.dir = {x: -1, y: 0};
        }
        break;
      case 68:
        if(this.dir.x != -1) {
          this.dir = {x: 1, y: 0};
        }
        break;
    }
    moves.shift()
    if(bDir == this.dir && moves.length > 0) {
      this.setDir();
    }
  }
  grow(g) {
    let lastItem = this.body[this.body.length - 1];
    for (var i = 0; i < g; i++) {
      this.body.push(lastItem);
      score++;
    }
  }
  move() {
    if(moves.length > 0) {
      this.setDir();
    }
    this.x += this.dir.x * grid;
    this.y += this.dir.y * grid;
    this.body.unshift({x: this.x, y: this.y});
    if(this.x == food.x && this.y == food.y) {
      food.newPos();
      score++;
    } else {
      this.body.pop();
    }
    if(this.x / grid < 0 || this.x / grid > canvas.width / grid - 1 || this.y / grid < 0 || this.y / grid > canvas.width / grid - 1) {
      reset();
    } else {
      for (var i = 1; i < this.body.length; i++) {
        if(this.x == this.body[i].x && this.y == this.body[i].y) {
          reset();
        }
      }
    }
  }
  update() {
    this.move();
    this.draw();
  }
}

class Food {
  constructor(x = 0, y = 0, s = grid) {
    this.x = x;
    this.y = y;
    this.s = s;
  }

  draw() {
    c.fillStyle = "red";
    c.fillRect(this.x, this.y, this.s, this.s);
  }

  newPos() {
    this.x = random(0, canvas.width / grid - 1) * grid;
    this.y = random(0, canvas.width / grid - 1) * grid;
    for(let i = 0; i < snake.body.length; i++) {
      if(this.x == snake.body[i].x || this.y == snake.body[i].y) {
        this.newPos();
      }
    }
  }
}

function random(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

let score = 0;
let hScore = 0;

let scoreDisplay = document.getElementById("score");
let hScoreDisplay = document.getElementById("hScore");

function reset() {
  stopInterval();
  gameOn = false;
  play.style.display = "block";
  snake = new Snake();
  food.newPos();
  score = 0;
  update();
  startInterval(difficulty);
}

let snake;
let food = new Food();

let moves = [];

document.addEventListener("keydown", e => {
  if(!moves.includes(e.keyCode) && gameOn) {
    moves.push(e.keyCode);
  }
});

let interval;

function startInterval(speed) {
  interval = setInterval(update, speed);
}

function stopInterval() {
  clearInterval(interval);
}

function update() {
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  snake.update();
  food.draw();
  scoreDisplay.innerHTML = "Score: " + score;
  hScore = Math.max(score, hScore);
  hScoreDisplay.innerHTML = "Highscore: " + hScore;
}

reset()
