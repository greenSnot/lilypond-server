const http = require('http');
const url = require('url');
const path = require("path");
const atob = require('atob');
const fs = require('fs');
const tmpdir = require('os').tmpdir();
const child_process = require('child_process');

function err_to_svg(e) {
  return `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
    <text x="20" y="35" style="font-size: 2px">${encodeURIComponent(e.message)}</text>
  </svg>`;
}

function lilypond_to_svg(lilypond) {
  const tmpfile = path.join(tmpdir, Math.random().toString(16).substr(2));
  const tmpsvg = tmpfile + '.svg';
  fs.writeFileSync(tmpfile, lilypond);
  let lilypond_svg = '';
  try {
    child_process.execSync(`cd ${tmpdir} && lilypond -dbackend=svg ${tmpfile}`);
    lilypond_svg = fs.readFileSync(tmpsvg).toString();
  } catch (e) {
    lilypond_svg = err_to_svg(e);
  }
  fs.existsSync(tmpfile) && fs.unlinkSync(tmpfile);
  fs.existsSync(tmpsvg) && fs.unlinkSync(tmpsvg);
  return lilypond_svg;
}

http.createServer((req, res) => {
  try {
    const data = atob(url.parse(req.url,true).query.data);
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(lilypond_to_svg(data));
  } catch (e) {
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(err_to_svg(e));
  }
}).listen(8081);
