
let button;
function setup() {
  let button = document.getElementById("a");
  button.addEventListener("click", function() {
    if(prompt("droger?") == "ja") {
      createImg("https://www.sjobo.se/images/18.5c7b33c316748c2e36d381/1543419359878/Tobak_370x222.png");
    } else {
      console.log("ok");
    }
  });
}

function draw() {

}
