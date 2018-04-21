
/*
	- d3 display implementation of a treap based on the opendatastructes.org algorithms and Robin Ladiges dheap implementation.
*/

// global variables
var svg, textInsert, textRemove, butInsert, textInsertV, inter, time,
    textInsertP, butInsertNode, textSize, butRnd, speedSlider;

var treap, tree;
var w, h;

function init(){
	// gets the DOM elements.
	svg = d3.select("#svg");
	textInsert = d3.select("#textInsert");
	textRemove = d3.select("#textRemove");
	butInsert = d3.select("#butInsert");
	butRemove = d3.select("#butRemove");
	textInsertV = d3.select("#textInsertV");
	textInsertP = d3.select("#textInsertP");
	butInsertNode = d3.select("#butInsertNode");
	textSize = d3.select("#textSize");
	butRnd = d3.select("#butRnd");
	speedSlider = d3.select("#speedSlider");

	
	w = Number(svg.attr("width")) - 40;
	h = Number(svg.attr("height")) - 40;
	
	// Zoom function could be added 
  // svg = svg.call(d3.behavior.zoom().on("zoom", function () {svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")}));
	
	svg = svg.select("g");
	// allows for the functions to run when enter is pressed.
	doClickOnEnter(textSize, butRnd);
	doClickOnEnter(textInsert, butInsert);
	doClickOnEnter(textRemove, butRemove);
	doClickOnEnter(textInsertV, butInsertNode);
	doClickOnEnter(textInsertP, butInsertNode);


	tree = d3.layout.tree().size([w, h]);

	treap = new aTreap(); 
	time = Math.floor(Math.pow(Number(speedSlider.property("value")),2));

	// sets up time pause element
	inter = setInterval(function(){
					doStep();
	}, time);
}

// changes the paused time.
function changeVal(){
	
	time = Math.floor(Math.pow(Number(speedSlider.property("value")),2));
	clearInterval(inter);
	inter = setInterval(function(){
					doStep();
	}, time);
};

// makes a random treap of size d.
function makeTreap(d){
	if( isUndefined(d) ) d = Number(textSize.property("value"));
	
	treap = aTreap.random(d);
  update();
}

// inserts a node with a value and a priority
function insertNode(d, n){
	if( isUndefined(d) ) d = Number(textInsertV.property("value"));
	if( isUndefined(n) ) n = Number(textInsertP.property("value"));
	
	treap.insert_p(d,n);
	update();
}

// inserts a node with just a value 
function doInsert(){
	
	var value = Number(textInsert.property("value"));
	if( isNumber(value) ){
		treap.insert(value);
		update();
	}
}

// allows for a step to be done.
function doStep(){
	treap.step();
	update();
}

// removes a node based on it value.
function doRemove(){
	var value = Number(textRemove.property("value"));
	if( isNumber(value) ){
		treap.remove(value);
		update();
	}
}


function update(){
	
	redraw();

	var onready = treap.ready() ? null : "disabled";
	var onbusy = treap.ready() ? "disabled" : null;
	
	// disables the buttons when the tree is changing.
	textInsertV.attr("disabled", onready);
	textInsertP.attr("disabled", onready);
	textInsert.attr("disabled", onready);
	textSize.attr("disabled", onready);
	textRemove.attr("disabled", onready);
	butRemove.attr("disabled", onready);
	butInsertNode.attr("disabled", onready);
	butInsert.attr("disabled", onready);
	butRnd.attr("disabled", onready);
   
}

// draws the tree.
var redraw = function(){
		
	// sets up the tree one node at a time recursivily.
	var treap2Object = function(){
		var i = 0;
		var recursion = function(newEl){

			var name = ""+newEl.val+ " , " + newEl.priority; 
			if(newEl.val == "nul"){name = "";}
			
			var cs = treap.children(newEl).map(recursion); 
			if(cs.length == 0) cs = undefined; 
			
			var csI = treap.childrensInd(newEl)
		 
			var fill = undefined;
			
			if (treap.i() == newEl) fill = "red";
			else if (treap.j() == newEl) fill = "orange";
			else if (treap.k() == newEl) fill = "lightblue";
			if(newEl.val == "nul") fill = "None";
			
			return {name: name, children: cs, fill: fill, index: newEl.index};
		};
		
		return function(){ return recursion(treap.getRoot()) };
	}();

	// sets up the nodes and links to be drawn.
	return function(){
		svg.selectAll("line").remove();
		svg.selectAll("svg").remove();

		if(treap.length() == 0) return;
		//console.log(treap.length());
		//console.log(treap.preOrder());
		var treeData = treap2Object();
		var nodeData = tree.nodes(treeData);
		var linkData = tree.links(nodeData);

		var links = svg.selectAll("line")
			.data(linkData).enter().append("line").classed("primary", function(d){return true;})
			.attr("x1", function(d){return d.source.x})
			.attr("y1", function(d){return d.source.y})
			.attr("x2", function(d){return d.target.x})
			.attr("y2", function(d){return d.target.y});

		var nodes = svg.selectAll("svg")
			.data(nodeData).enter().append("svg")
			.attr("x", function(d){return d.x})
			.attr("y", function(d){return d.y})
			.each(makeSvgCircle);

	}; 
}();
