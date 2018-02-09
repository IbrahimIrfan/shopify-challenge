// graph class to organize links and find cycles
class Graph {

  // set up the graph object
  constructor(numNodes) {
    this.numNodes = numNodes;
    this.graph = {};
    for (i = 1; i < numNodes + 1; i++) {
      this.graph[i] = [];
    }
  }

  // add a link to a node
  addLink(from, to) {
    this.graph[from].push(to);
  }

  // return if a node is a part of a cycle
  // node: node index to check if part of cycle
  // visited: array to keep track of visited nodes
  // links: array to keep track of nodes in current cycle
  // isChild: array to keep track of if a node is a child
  //          (has at least one incoming link)
  hasCycle(node, visited, links, isChild){
    // set node as visited and add it to links
    visited[node] = true;
    links[node] = true;

    var cycleFound = false;
    var numChildren = this.graph[node + 1].length; // + 1 for 0 indexing
    
    // for every child of node
    for (var i = 0; i < numChildren; i++){
      var child = this.graph[node + 1][i] - 1; // -1 for 0 indexing
      
      // is not a root, so it is a child
      isChild[child] = true; 

      if (!visited[child]) { 
        // if we haven't seen this child before,
        // check if it is a part of a cycle
        if (this.hasCycle(child, visited, links, isChild)) {
          cycleFound = true;
        }
      } else if (links[child]) {  
       // if this node is in the current link, found a cycle!
       cycleFound = true;
      }
    }

    // take the node out of the link if no cycle is found
    links[node] = cycleFound;
    return cycleFound;
  }

  // recursively get all children of children of children ... of a node
  // store it in children array
  getChildren(node, children){
    var numChildren = this.graph[node + 1].length;
    for (var child = 0; child < numChildren; child++){
      var currentChild = this.graph[node + 1][child];
      children.push(currentChild);
      // repeat with grandchildren
      this.getChildren(currentChild - 1, children);
    }
  }

  isCyclic(cycles, notCycles){
    // intialize arrays to keep track of values
    var visited = fillArray(false); // nodes previously seen
    var links = fillArray(false); // nodes in current link
    var isChild = fillArray(false); // nodes which have incoming links

    // for every node
    for (var node = 0; node < this.numNodes; node++){
      if (!visited[node] && 
        this.hasCycle(node, visited, links, isChild)){
        // if have not seen this node and it has a cycle,
        // push the log of links
        cycles.push(links);
        // reset the links
        links = fillArray(false);
      }
    }

    // for every node
    for (var node = 0; node < this.numNodes; node++){
      if (!isChild[node]) { 
        // if the node is a root, get and store all the childen
        var children = [];
        this.getChildren(node, children);

        // format and push to notCycles
        var menu = {
          "root_id": (node + 1),
          "children": children
        }
        notCycles.push(menu);
      }
    }

    return cycles.length > 0; // isCyclic
  }
};

// create a numNodes sized array and fill it with content
function fillArray(content){
  var array = [];
  for (var i = 0; i < this.numNodes; i++){
    array.push(content);
  }
  return array;
}


module.exports = Graph;
