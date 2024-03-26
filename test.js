const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Doc</title>
  </head>
  <body>
    <h1>{{name}}</h1>
    <p>{{$if(bio, "cool")}}</p>
    {{$render(\`
      <h1>{{username}}</h1>
    \`, user)}}
  </body>
</html>
`;

function findScripts(
  html = "",
  startingDelimiter = "{{",
  endingDelimiter = "}}"
) {
  // find the points
  const points = [startingDelimiter, endingDelimiter]
    .map((delimater) => {
      const list = [];
      let index = 0;
      while (true) {
        index = html.indexOf(delimater, index);
        if (index === -1) break;
        list.push({ index, delimater });
        index += delimater.length;
      }
      return list;
    })
    .flat()
    .sort((a, b) => a.index - b.index)
    .reduce((list, point, index, points) => {
      const possiblePoints = points.slice(index + 1);
      let skip = 0;
      for (const possiblePoint of possiblePoints) {
        if (!possiblePoint.index) continue;
        // if {{
        if (possiblePoint.delimater === startingDelimiter) {
          possiblePoint.index = null;
          skip++;
          continue;
        }
        // if }}
        if (skip > 0) {
          skip--;
          continue;
        }
        list.push({
          start: point.index,
          end: possiblePoint.index,
        });
      }
      //
      return list;
    }, []);
  points.pop();
  // extract the matches and scripts
  const matches = points.map(({ start, end }) =>
    html.slice(start, end + endingDelimiter.length)
  );

  return matches;
}

console.log(findScripts(html));
