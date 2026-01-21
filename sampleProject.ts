
import { ProjectFile } from './types';

export const SAMPLE_PROJECT_GOAL = "Improve security, performance, and document the architecture for a production-ready handover.";

export const SAMPLE_FILES: ProjectFile[] = [
  {
    name: 'README.md',
    path: 'README.md',
    type: 'text/markdown',
    content: `# TaskFlow Lite
A simple task management application. 

## Features
- Add tasks
- Delete tasks
- Basic storage

## Running
Just open index.html.`
  },
  {
    name: 'index.html',
    path: 'index.html',
    type: 'text/html',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>TaskFlow Lite</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <h1>My Tasks</h1>
        <input type="text" id="taskInput" placeholder="New task...">
        <button id="addBtn">Add</button>
        <ul id="taskList"></ul>
    </div>
    <script src="config.js"></script>
    <script src="utils.js"></script>
    <script src="app.js"></script>
</body>
</html>`
  },
  {
    name: 'config.js',
    path: 'config.js',
    type: 'application/javascript',
    content: `// Configuration constants
const API_URL = "https://api.taskflow-lite.internal/v1";
const API_KEY = "tf_live_9384720194872349872"; // TODO: Move to env
const TIMEOUT = 5000;`
  },
  {
    name: 'app.js',
    path: 'app.js',
    type: 'application/javascript',
    content: `// Global tasks array
var tasks = []; 

document.getElementById('addBtn').onclick = function() {
    var input = document.getElementById('taskInput');
    if(input.value) {
        addTask(input.value);
        input.value = '';
    }
};

function addTask(text) {
    tasks.push(text);
    render();
}

function render() {
    var list = document.getElementById('taskList');
    list.innerHTML = '';
    for(var i=0; i<tasks.length; i++) {
        var li = document.createElement('li');
        li.innerText = tasks[i];
        
        // Potential performance bottleneck
        processTaskMetaData(tasks[i]); 
        
        list.appendChild(li);
    }
}

console.log("App loaded with key:", API_KEY);`
  },
  {
    name: 'utils.js',
    path: 'utils.js',
    type: 'application/javascript',
    content: `// Heavy processing utility
function processTaskMetaData(task) {
    // Intentional synchronous blocking flaw
    const start = Date.now();
    while (Date.now() - start < 50) {
        // Simulating heavy CPU work
        Math.sqrt(Math.random() * 1000);
    }
    return "processed_" + task;
}

function unsafeParse(jsonStr) {
    // Intentional security flaw
    return eval("(" + jsonStr + ")"); 
}`
  },
  {
    name: 'styles.css',
    path: 'styles.css',
    type: 'text/css',
    content: `body {
    background: #f0f0f0;
    font-family: Arial;
}

#app {
    width: 800px;
    margin: 100px auto;
    background: white;
    padding: 20px;
}

/* Redundant selectors */
div#app h1 {
    color: #333;
}

/* Poor mobile responsiveness */
input {
    width: 300px;
}

button {
    padding: 10px 20px;
}`
  }
];
