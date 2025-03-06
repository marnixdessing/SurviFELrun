import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { render } from 'mustache';

export function compile(path: string, dist: string = './dist') {
  const header = readFileSync(join(path, 'templates', 'header.mustache')).toString('utf-8');
  const footer = readFileSync(join(path, 'templates', 'footer.mustache')).toString('utf-8');

  // Remove existing output dir
  if (existsSync(dist)) {
    rmSync(dist, { recursive: true });
  }
  mkdirSync(dist);

  // Copy all files
  cpSync(path, dist, { recursive: true });

  // Overwrite html template
  const htmlfiles = readdirSync(path).filter(file => file.endsWith('.html'));
  const fullPartials = {
    header: header,
    footer: footer,
  };

  for (const htmlFile of htmlfiles) {
    const template = readFileSync(join(path, htmlFile)).toString('utf-8');
    const rendered = render(template, {}, fullPartials);
    const fileBasename = basename(htmlFile);
    writeFileSync(join(dist, fileBasename), rendered);
  }

}

console.log('Compiling static webpages...');
compile('./website');
console.log('Done compiling static webpages...');