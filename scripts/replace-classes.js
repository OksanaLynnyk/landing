import fs from 'fs';
import path from 'path';

const manifestPath = path.resolve('.temp/class-map.json');

if (!fs.existsSync(manifestPath)) {
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function processFiles(dir, exts) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processFiles(fullPath, exts); 
    } else if (exts.includes(path.extname(file))) {
      processFile(fullPath);
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);

  if (ext === '.html') {
    content = processHTML(content);
  } else if (ext === '.css') {
    content = processCSS(content);
  } else if (ext === '.js') {
    content = processJS(content);
  }

  fs.writeFileSync(filePath, content);
}

const excluded = ['swiper', 'swiper-wrapper', 'swiper-slide', 'btn-next', 'btn-prev', 'swiper-my', 'swiper-button-prev-desktop',
  'swiper-button-prev-mobile',
  'swiper-button-next-desktop',
  'swiper-button-next-mobile', 'swiper-button-prev', 'swiper-button-next', 'swiper-pagination', 'prevDot', 'dot']

function processHTML(content) {
  return content.replace(/class="([^"]*)"/g, (match, classList) => {
    const newClasses = classList.split(/\s+/)
      .map(cls => excluded.includes(cls) ? cls : (manifest[cls] || cls))
      .join(' ');
    return `class="${newClasses}"`;
  });
}

function processCSS(content) {
  const excluded = ['swiper', 'swiper-wrapper', 'swiper-slide', 'btn-next', 'btn-prev', 'swiper-my', 'swiper-button-prev-desktop',
    'swiper-button-prev-mobile',
    'swiper-button-next-desktop',
    'swiper-button-next-mobile', 'swiper-button-prev', 'swiper-button-next', 'swiper-pagination', 'prevDot', 'dot'];

  for (const [orig, hashed] of Object.entries(manifest)) {
    if (excluded.includes(orig)) continue;

    content = content.replace(
      new RegExp(`\\.${escapeRegExp(orig)}(?![\\w-])`, 'g'),
      `.${hashed}`
    );
  }

  return content;
}

const excludedJS = ['swiper', 'swiper-wrapper', 'swiper-slide', 'btn-next', 'btn-prev', 'swiper-my', 'swiper-button-prev-desktop',
  'swiper-button-prev-mobile',
  'swiper-button-next-desktop',
  'swiper-button-next-mobile', 'swiper-button-prev', 'swiper-button-next', 'swiper-pagination', 'prevDot', 'dot'];

function processJS(content) {
  for (const [orig, hashed] of Object.entries(manifest)) {
    if (!orig.includes('-') || excludedJS.includes(orig)) continue;

    const esc = escapeRegExp(orig);
    content = content.replace(
      new RegExp(`\\.${esc}\\b(?!-)`, 'g'),
      `.${hashed}`
    );

    content = content.replace(
      new RegExp(`(['"])${esc}\\b(?!-)\\1`, 'g'),
      (_, q) => `${q}${hashed}${q}`
    );

    content = content.replace(
      new RegExp(`classList\\.(add|remove|toggle|contains)\\(\\s*(['"])${esc}\\2`, 'g'),
      m => m.replace(orig, hashed)
    );

    content = content.replace(
      new RegExp(`(querySelector(All)?\\(\\s*(['"]))\\.${esc}(\\3)`, 'g'),
      (_, p, a, q, s) => `${p}.${hashed}${s}`
    );

    content = content.replace(
      new RegExp(`(className\\s*=\\s*(['"]))${esc}(\\2)`, 'g'),
      (_, b, q) => `${b}${hashed}${q}`
    );

    content = content.replace(
      new RegExp(`(new Swiper\\(\\s*['"])\\.${esc}\\b(?!-)(['"])`, 'g'),
      (_, p, q) => `${p}.${hashed}${q}`
    );
  }
  return content;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

processFiles('dist', ['.html', '.css', '.js']);