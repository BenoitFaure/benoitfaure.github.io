//Canvas info
var c = document.getElementById("backgroundCanvas");
var ctx = c.getContext("2d");
var w = 0;
var h = 0;
//Game info
ships = [new Ship(new vect2d(0, 0)), new Ship(new vect2d(50, 50))];

//---------------------------Utility functions--------------------------
function resize(){
	w = window.innerWidth;
	h = window.innerHeight;

	ctx.canvas.width  = w;
  	ctx.canvas.height = h;

  	render();
 }

//-------------------------Main functions-------------------------------
var prevT = 0;
function update(t){
	var dt = t - prevT;
	prevT = t;
	//Update ships
	for (let ship of ships)
		ship.update(dt, w, h, ships);
}

function render(){
	//Clear canvas
	ctx.clearRect(0, 0, c.width, c.height);

	for (let ship of ships)
		ship.render(ctx);
}

resize();

;(() => {

  function main(dt) {
    stopMain = window.requestAnimationFrame(main);

    update(dt);
    render();
  }

  main(window.performance.now()/1000);
})();