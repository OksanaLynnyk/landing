import fs from 'fs';
import path from 'path';

function walk(dir, exts, cb) {
    fs.readdirSync(dir).forEach(f => {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) walk(full, exts, cb);
        else if (exts.includes(path.extname(full))) cb(full);
    });
}

const allClasses = new Set();

walk('./dist', ['.html'], file => {
    const html = fs.readFileSync(file, 'utf8');
    const classRegex = /class="([^"]+)"/g;
    let match;

    while ((match = classRegex.exec(html)) !== null) {
        const classes = match[1].split(/\s+/);
        classes.forEach(cls => {
            if (cls) allClasses.add(cls);
        });
    }
});

const classMap = {};
for (const cls of allClasses) {
    const hash = Math.random().toString(36).substring(2, 6);
    classMap[cls] = `${cls}-${hash}`;
}

fs.mkdirSync('.temp', { recursive: true });
fs.writeFileSync('.temp/class-map.json', JSON.stringify(classMap, null, 2));