// Utilidades compartidas: texto, rutas del estado y descargas.

// Minúsculas y sin tildes, para comparar textos escritos a mano.
export const norm = (s) =>
  (s ?? '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const escHtml = (s) =>
  (s ?? '').toString()
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const palabras = (s) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);

export const vacio = (v) =>
  v === undefined || v === null ||
  (typeof v === 'string' && v.trim() === '') ||
  (Array.isArray(v) && v.length === 0);

// Una entrada por línea; quita viñetas y numeraciones ("1.", "-", "•").
export const lista = (s, separador = /\n/) =>
  (s ?? '').toString().split(separador)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

export const numero = (s) => {
  const n = parseFloat((s ?? '').toString().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const capitalizar = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const contarPalabras = (s) => (s ?? '').toString().trim().split(/\s+/).filter(Boolean).length;

const VACIAS = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'unos', 'unas', 'en', 'y', 'e', 'o', 'u', 'a', 'al',
  'con', 'por', 'para', 'sobre', 'bajo', 'entre', 'que', 'se', 'su', 'sus', 'lo', 'como', 'segun',
  'mediante', 'funcion', 'of', 'the', 'and', 'in', 'on', 'for', 'to', 'an', 'by', 'with',
]);

// Raíz aproximada: basta para que "temperatura" y "temperaturas" coincidan.
const raiz = (w) => (w.length > 6 ? w.slice(0, 6) : w.replace(/(es|s)$/, ''));

export const significativas = (s) => palabras(s).filter((w) => w.length >= 3 && !VACIAS.has(w));

// Fracción de las palabras significativas de `fragmento` que aparecen en `texto` (0 a 1).
export function cobertura(fragmento, texto) {
  const sig = significativas(fragmento);
  if (!sig.length) return 1;
  const raices = new Set(palabras(texto).map(raiz));
  return sig.filter((w) => raices.has(raiz(w))).length / sig.length;
}

export function obtener(obj, ruta) {
  return ruta.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function asignar(obj, ruta, valor) {
  const partes = ruta.split('.');
  const ultima = partes.pop();
  const destino = partes.reduce((o, k) => (o[k] ??= {}), obj);
  destino[ultima] = valor;
}

export function descargar(nombre, contenido, tipo = 'text/plain') {
  const url = URL.createObjectURL(new Blob([contenido], { type: `${tipo};charset=utf-8` }));
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// "Given Family" o "Family, Given" → { given, family }
export function partirNombre(nombre) {
  const n = (nombre ?? '').trim();
  if (n.includes(',')) {
    const [family, given = ''] = n.split(',').map((x) => x.trim());
    return { given, family };
  }
  const trozos = n.split(/\s+/);
  const family = trozos.pop() ?? '';
  return { given: trozos.join(' '), family };
}

export function refCorta(p) {
  const primero = p.autores?.[0] ? partirNombre(p.autores[0]).family : 'Sin autor';
  const etal = (p.autores?.length ?? 0) > 1 ? ' et al.' : '';
  return `${primero}${etal} (${p.anio || 's. f.'})`;
}
