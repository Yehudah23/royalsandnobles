#!/usr/bin/env node
// tools/preproc-templates.js
// Simple preprocessor to convert @if/@endif and @for/@endfor into Angular *ngIf/*ngFor
// Writes backups with .bak extension before modifying files.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src', 'app');
const exts = ['.html'];

function walk(dir, cb) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

function transform(content) {
  let out = content;
  // Replace @if(expression) with <ng-container *ngIf="expression">
  // and @endif with </ng-container>
  // Non-greedy match inside parentheses
  out = out.replace(/@if\s*\(([^)]+)\)/g, (m, expr) => `<ng-container *ngIf="${expr.trim()}">`);
  out = out.replace(/@endif/g, '</ng-container>');

  // Replace @for(let item in items) or @for(item in items)
  // with <ng-container *ngFor="let item of items"> and @endfor -> </ng-container>
  out = out.replace(/@for\s*\(\s*(?:let\s+)?([a-zA-Z_$][0-9a-zA-Z_$]*)\s+in\s+([^\)]+)\)/g,
    (m, item, collection) => `<ng-container *ngFor="let ${item.trim()} of ${collection.trim()}">`
  );
  out = out.replace(/@endfor/g, '</ng-container>');

  // Simple interpolation conversion: @{{ expr }} -> {{ expr }}
  out = out.replace(/@\{\{\s*([^}]+)\s*\}\}/g, (m, expr) => `{{ ${expr.trim()} }}`);

  return out;
}

function processFile(file) {
  if (!exts.includes(path.extname(file))) return;
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch (e) {
    console.error('Failed reading', file, e.message);
    return;
  }
  const transformed = transform(content);
  if (transformed === content) return; // nothing changed

  // backup
  try {
    const bak = file + '.bak';
    if (!fs.existsSync(bak)) {
      fs.writeFileSync(bak, content, 'utf8');
      console.log('Backup written:', bak);
    }
    fs.writeFileSync(file, transformed, 'utf8');
    console.log('Transformed:', file);
  } catch (e) {
    console.error('Failed writing', file, e.message);
  }
}

function main() {
  console.log('Preprocessing templates under', root);
  if (!fs.existsSync(root)) {
    console.error('Root not found:', root);
    process.exit(1);
  }
  walk(root, processFile);
  console.log('Preprocessing complete.');
}

main();
