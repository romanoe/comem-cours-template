/**
 * Génère cours/public/index.html depuis course.config.json.
 * Met aussi à jour le badge de licence dans README.md.
 * Relancer après chaque modification de course.config.json.
 * Usage : node scripts/generate-index.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(readFileSync(resolve(root, 'course.config.json'), 'utf-8'))

const { name, slug, subtitle, year, author, email, github, license = 'CC BY 4.0', decks } = config

function licenseBadge(license) {
  const badges = {
    'CC BY 4.0': {
      img: 'https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg',
      url: 'https://creativecommons.org/licenses/by/4.0/',
    },
    'CC BY-NC 4.0': {
      img: 'https://img.shields.io/badge/License-CC_BY--NC_4.0-lightgrey.svg',
      url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    },
    'CC BY-SA 4.0': {
      img: 'https://img.shields.io/badge/License-CC_BY--SA_4.0-lightgrey.svg',
      url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
    'MIT': {
      img: 'https://img.shields.io/badge/License-MIT-yellow.svg',
      url: 'https://opensource.org/licenses/MIT',
    },
  }
  const b = badges[license] ?? {
    img: `https://img.shields.io/badge/License-${license.replace(/ /g, '_')}-lightgrey.svg`,
    url: '#',
  }
  return { ...b, md: `[![License: ${license}](${b.img})](${b.url})` }
}

const badge = licenseBadge(license)

// --- index.html ---

const items = decks
  .map(({ out, title }, i) => {
    const num = String(i + 1).padStart(2, '0')
    return `    <li><a href="${out}/"><span class="num">${num}</span><span class="title">${title}</span></a></li>`
  })
  .join('\n')

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — ${subtitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;700&family=Atkinson+Hyperlegible+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #000; padding: 4rem 2rem; max-width: 720px; margin: 0 auto; }
    h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.03em;  font-family: 'Atkinson Hyperlegible Mono'}
    .subtitle { font-family: 'Atkinson Hyperlegible Mono', monospace; font-size: 0.9rem; color: #9e9e9e; margin-top: 0.5rem; }
    .courses { margin-top: 3rem; list-style: none; }
    .courses li { border-bottom: 1px solid #e0e0e0; }
    .courses li a { display: flex; align-items: center; padding: 1rem 0; text-decoration: none; color: #000; transition: opacity 0.2s; flex: 1; }
    .courses li a:hover { opacity: 0.6; }
    .courses li { display: flex; align-items: center; justify-content: space-between; }
    .num { font-family: 'Atkinson Hyperlegible Mono', monospace; font-size: 0.8rem; color: #9e9e9e; min-width: 2rem; }
    .title { flex: 1; margin-left: 1rem; font-weight: 500; }
    footer { margin-top: 3rem; font-family: 'Atkinson Hyperlegible Mono', monospace; font-size: 0.75rem; color: #9e9e9e; display: flex; gap: 1.5rem; }
    footer a { color: #9e9e9e; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <p class="subtitle">${subtitle} · ${year}</p>

  <ol class="courses">
${items}
  </ol>

  <footer>
    <a href="mailto:${email}">${author}</a>
    <a href="${github}">GitHub</a>
    <a href="${badge.url}">${license}</a>
  </footer>
</body>
</html>
`

mkdirSync(resolve(root, 'cours/public'), { recursive: true })
writeFileSync(resolve(root, 'cours/public/index.html'), html)
console.log('index.html generated.')

// --- README.md badge patch ---

const readmePath = resolve(root, 'README.md')
let readme = readFileSync(readmePath, 'utf-8')

// Remove any existing standalone license badge line + surrounding blank lines
const badgeLineRe = /\n*^\[!\[License:[^\]]*\]\([^)]*img\.shields\.io[^)]*\)\]\([^)]*\)\n*/gm
readme = readme.replace(badgeLineRe, '\n')

// Insert badge after the first h1 line
readme = readme.replace(/^(# .+\n)/, `$1\n${badge.md}\n\n`)

writeFileSync(readmePath, readme)
console.log('README.md badge updated.')
