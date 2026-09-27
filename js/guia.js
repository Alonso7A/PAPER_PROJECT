// Lee docs/paper-cientifico-ingenieria.md y entrega el fragmento de cada fase
// para mostrarlo dentro de su recuadro. Depende de que los encabezados sigan
// el formato "## FASE N — …" y "### …".
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js';

const RUTA = 'docs/paper-cientifico-ingenieria.md';
let secciones = [];

export async function cargarGuia() {
  const r = await fetch(RUTA, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`No se pudo leer ${RUTA} (HTTP ${r.status})`);
  const md = (await r.text())
    .replace(/\r\n/g, '\n')
    .replace(/^---\n[\s\S]*?\n---\n/, ''); // encabezado YAML
  secciones = partir(md, '## ');
}

// Divide por encabezados de un nivel; lo previo al primero queda con título ''.
function partir(md, marca) {
  const out = [{ titulo: '', lineas: [] }];
  let dentroDeCodigo = false;
  for (const linea of md.split('\n')) {
    if (linea.startsWith('```')) dentroDeCodigo = !dentroDeCodigo;
    if (!dentroDeCodigo && linea.startsWith(marca)) {
      out.push({ titulo: linea.slice(marca.length).trim(), lineas: [] });
    } else {
      out.at(-1).lineas.push(linea);
    }
  }
  return out.map((s) => ({
    titulo: s.titulo,
    cuerpo: s.lineas.join('\n').replace(/\n-{3,}\s*$/, '').trim(),
  }));
}

function buscar(prefijo) {
  return secciones.find((s) => s.titulo.toLowerCase().startsWith(prefijo.toLowerCase()));
}

// ref = { fase: 0, h3: ['Bloque A', …] }  o  { titulos: ['Checklist final', …] }
export function guiaMarkdown(ref) {
  if (!secciones.length) return null;
  if (ref.titulos) {
    return ref.titulos
      .map((t) => buscar(t))
      .filter(Boolean)
      .map((s) => `## ${s.titulo}\n\n${s.cuerpo}`)
      .join('\n\n');
  }
  const sec = buscar(`FASE ${ref.fase} `);
  if (!sec) return null;
  if (!ref.h3) return sec.cuerpo;
  return partir(sec.cuerpo, '### ')
    .filter((s) => ref.h3.some((h) => s.titulo.startsWith(h)))
    .map((s) => `### ${s.titulo}\n\n${s.cuerpo}`)
    .join('\n\n');
}

export function guiaHtml(ref) {
  const md = guiaMarkdown(ref);
  return md ? marked.parse(md) : null;
}

export function mdAHtml(md) {
  return marked.parse(md);
}
