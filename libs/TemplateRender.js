const fs = require("fs");
const path = require("path");

const viewsDir = path.dirname(process.cwd(), "/views");

function findScripts(html, startingDelimiter = "{{", endingDelimiter = "}}") {
  const scripts = [];
  let start = 0,
    end = 0;
  while (true) {
    start = html.indexOf(startingDelimiter, start);
    end = html.indexOf(endingDelimiter, start);
    if (start === -1) break;
    start += startingDelimiter.length;
    const match = html.slice(start - 2, end + 2);
    const statement = match.slice(2, -2);
    scripts.push({
      match,
      statement,
    });
  }
  return scripts;
}

// one of the weirdest code I have ever written
function findAndRunScripts(html, evaluate) {
  // select the statments
  const scripts = findScripts(html);
  // replace them with new data
  let newHtml = html;
  for (const { match, statement } of scripts)
    newHtml = newHtml.replace(match, evaluate(statement));
  return newHtml;
}

const helperFuncs = (globalProps = {}) => ({
  $if(condition, onTrue, onFalse = "") {
    return condition ? onTrue : onFalse;
  },
  $switch(condition, cases, defaultCase = "") {
    return cases[condition] || defaultCase;
  },

  $import(elementPath, props) {
    return renderTempalate(elementPath, props, globalProps);
  },
  $importList(elementPath, propsList = []) {
    return propsList.map((props) => this.$import(elementPath, props)).join("");
  },
});

function runScripts(statement, props, globalProps = {}) {
  // this is let the statement has access to props and provide js evn
  const helpers = helperFuncs(globalProps);
  const funcsKeys = Object.keys(helpers).join(",");
  const funcStr = `return (props, globalProps, {${funcsKeys}})=> (${statement})`;
  const funcBuilder = Function(funcStr);
  const func = funcBuilder();
  return func(props, globalProps, helpers);
}

function render(template, props, globalProps = {}) {
  return findAndRunScripts(template, (statement) =>
    runScripts(statement, props, globalProps)
  );
}

function findTemplateFiles() {
  const files = {};
  function readRecursively(dir = viewsDir) {
    const children = fs.readdirSync(dir);
    for (const child of children) {
      const childPath = path.join(dir, child);
      const stats = fs.statSync(childPath);
      if (stats.isDirectory()) {
        readRecursively(childPath);
        continue;
      }
      // if file and ext is html
      if (path.extname(child) !== ".html") continue;
      const fileKeyPath = path
        .relative(viewsDir, childPath)
        .replace(".html", "")
        .replace(path.sep, "/");
      files[fileKeyPath] = childPath;
    }
  }
  readRecursively();
  return files;
}

// --------- read the targeted file
const cache = {
  templates: null,
  html: {},
};

function renderTempalate(templatePath, props = {}, globalProps = {}) {
  if (!cache.templates) cache.templates = findTemplateFiles();
  const filePath = cache.templates[templatePath];
  if (!filePath)
    throw new Error(`templatePath: ${templatePath} does not exists!`);
  if (!cache.html[templatePath])
    cache.html[templatePath] = fs.readFileSync(filePath).toString();
  const templateFile = cache.html[templatePath];
  return render(templateFile, props, globalProps);
}

function renderTemplateList(templatePath, propsList = [], globalProps = {}) {
  return propsList
    .map((props) => renderTempalate(templatePath, props, globalProps))
    .join("");
}

module.exports = {
  render,
  renderTempalate,
  renderTemplateList,
};

// <!-- render -->
// {{title}}
// <!-- render with element -->
// {{`
// <h1>${title}</h1>
// `}}
// <!-- if -->
// {{$if(signed, "You are logged!")}}
// <!-- switch -->
// {{$switch(userRole, { admin:"You are an admin", user:`You are a simple
// user`, }, "IDK what the fuck you are")}}

// <!-- import -->
// {{$import("partials/Navbar", {title})}}
// <!-- importList -->
// {{$importList("partials/Navbar", users, true)}}

// <!-- import and importList can be user with if and switch -->
// {{$if(true, $import("partials/Navbar", {title}))}}
