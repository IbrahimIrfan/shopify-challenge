const fetch = require('node-fetch');
const Graph = require('./graph.js');

var menusByID = {};
var result = {
 "valid_menus": [],
 "invalid_menus": []
};

// get the correct url based on cla (default 1)
var url = "https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=1&page=";
if (process.argv.length == 3 && process.argv[2] == "2") {
  url = "https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=2&page=";
}

// create a graph object with menusByID
// then find cyclic cycles 
function createGraph(numNodes){
  // create the graph and add all the links from menusByID
  var graph = new Graph(numNodes);
  for (parent in menusByID) {
    var children = menusByID[parent]['child_ids'];

    for (child in children){
      graph.addLink(parent, children[child]);
    }
  }

  // variables to store invalid and valid menus
  var cycles = [];
  var notCycles = [];

  // find the cycles and store in the arrays
  graph.isCyclic(cycles, notCycles);

  // store the valid menus
  result["valid_menus"] = notCycles;

  // for each cycle
  var numCycles = cycles.length;
  for (var i = 0; i < numCycles; i++){
    var cycle = cycles[i];
    var cycleLinks = [];

    var root = null;
    // for each node
    for (var j = 0; j < numNodes; j++){
      // if it's a part of the cycle, then
      if (cycle[j]) {
        // store the root (lowest index in cycle)
        if (root === null){
          root = j + 1;
        }
        // push to separate array in desired format
        cycleLinks.push(j + 1);
      }
    }

    var menu = {
      "root_id": root,
      "children": cycleLinks
    };

    result["invalid_menus"].push(menu);
  }

  console.log(JSON.stringify(result));
}

// create a key value map by ID for constant time lookup
function storeMenus(menus) {
  for (i in menus) {
    var menu = menus[i];
    menusByID[menu["id"]] = menu;
  }
}

// make a request to a given page using fetch and store the recieved menu
async function makeReq(page) {
  var body = await fetch(url + page);
  body = await body.json();
  var menus = body["menus"];
  storeMenus(menus);
}

// make all the requests to get menus asynchronously
async function getNewPages(numPages) {
  var pageRequests = [];
  for (var currentPage = 2; currentPage <= numPages; currentPage++) {
    pageRequests.push(currentPage);
  }

  // make all requests to pages and create the graph
  const promises = pageRequests.map(makeReq);
  await Promise.all(promises);
  createGraph(Object.keys(menusByID).length);
}

// make the initial request to determine how many more pages there are
async function initialReq() {
  var body = await fetch(url + 1);
  body = await body.json();
  var menus = body["menus"];

  var pagination = body["pagination"];
  var totalNodes = parseInt(pagination["total"]);
  var perPage = parseInt(pagination["per_page"]);
  var numPages = Math.ceil(totalNodes / perPage);

  storeMenus(menus);
  getNewPages(numPages);
}

initialReq();
