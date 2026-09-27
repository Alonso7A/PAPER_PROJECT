// Recuadro 5 · Estado del arte.
// Cuatro formas de agregar papers (OpenAlex, PDF, .bib/.ris, DOI) y la matriz
// comparativa. Los archivos se leen en el navegador: nunca se suben a un servidor.
// Lo único que sale del navegador son las consultas a OpenAlex, Crossref y DataCite.
import { escHtml, norm, refCorta } from './util.js';

const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
const MAX_PAGINAS_PDF = 40;

// ─────────────────────────── Funciones puras (testeables) ───────────────────────────

export function limpiarDoi(s) {
  return (s ?? '').toString().trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .replace(/[.,;:)\]}>]+$/, '');
}

export function extraerDoi(texto) {
  const m = (texto ?? '').match(/\b(10\.\d{4,9}\/[^\s"<>]+)/i);
  return m ? limpiarDoi(m[1]) : '';
}

function extraerResumen(texto) {
  const m = texto.match(/\b(?:abstract|resumen)\b[\s.:—–-]*([\s\S]{100,3000}?)(?=\n\s*(?:keywords|key words|index terms|palabras clave|(?:1|i)\.?\s+introduc))/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

const RE_LIMITACION = /limitation|limitaci|future (?:work|research|studies)|trabajos? futuros?|further (?:research|work|studies|investigation)|should be (?:investigated|studied|explored)|not (?:considered|addressed|investigated)|no (?:se )?(?:consider|abord|estudi)|beyond the scope|fuera del alcance|drawback|shortcoming/i;

// Cifra con unidad, porcentaje, valor p, R² o ±: lo que convierte una frase en un hallazgo citable.
const RE_CIFRA = /\d+(?:[.,]\d+)?\s?(?:%|‰|mm\b|µm|μm|nm\b|cm\b|m\/s|mm\/s|mm\/min|mpa\b|gpa\b|kpa\b|kn\b|n\b|n·m|°\s?c|º\s?c|hz\b|khz\b|rpm\b|kw\b|w\b|ma\b|kg\b|g\b|j\b|db\b|min\b|times\b|veces\b|fold\b)|\bp\s?[<=>≤]\s?0?[.,]\d+|\br\s?(?:²|2|\^2)\s?=|±/i;
const RE_CAMBIO = /increas|decreas|reduc|improv|higher|lower|greater|maxim|minim|optim|significan|achiev|obtain|reach|resulted|showed|aument|disminu|mejor|mayor|menor|máxim|mínim|óptim|significativ|alcanz|obtuv|logr|redujo|increment/i;
const RE_REFERENCIA = /et al\.,|\(\d{4}\)\s*[.,]|vol\.\s*\d|pp\.\s*\d|doi:|https?:\/\//i;

const unir = (t) => t.replace(/-\n(?=[a-záéíóúñ])/g, '').replace(/[ \t]+/g, ' ');

function oraciones(texto, pagina) {
  return texto.replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ(])/)
    // Quita encabezados de sección que quedan pegados al inicio ("3. Results The deviation…").
    .map((t) => ({ texto: t.trim().replace(/^(?:\d+(?:\.\d+)*\.?\s+)?(?:results?(?: and discussion)?|discussion|conclusions?|resultados(?: y discusi[oó]n)?|discusi[oó]n|conclusiones)\s+(?=[A-ZÁÉÍÓÚÑ])/i, ''), pagina }))
    .filter((o) => o.texto);
}

// Decimal que no sea número de sección, ecuación, figura o tabla ("section 3.2", "3.2.3").
function tieneDecimal(t) {
  for (const m of t.matchAll(/(?<![\d.])\d+[.,]\d+(?![.\d])/g)) {
    if (!/(?:section|secci[oó]n|sec\.|eq\.|equation|ecuaci[oó]n|fig\.|figure|table|tabla|cap[ií]tulo|chapter)\s*$/i.test(t.slice(0, m.index))) return true;
  }
  return false;
}

function puntajeHallazgo(t) {
  if (t.length < 40 || t.length > 450 || RE_REFERENCIA.test(t)) return 0;
  const cambio = RE_CAMBIO.test(t);
  let base = 0;
  if (RE_CIFRA.test(t)) base = 2 + (cambio ? 1 : 0);
  else if (cambio && tieneDecimal(t)) base = 2; // cifra decimal sin unidad conocida (BLEU, índices…)
  return base ? base + (/^(?:fig|figure|table|tabla)\b/i.test(t) ? -1 : 0) : 0;
}

// Frases con resultados cuantitativos: las de mayor puntaje, devueltas en orden de aparición.
function elegirHallazgos(lista, max = 12) {
  const vistos = new Set();
  return lista
    .map((o, i) => ({ ...o, i, puntaje: puntajeHallazgo(o.texto) }))
    .filter((o) => o.puntaje >= 2 && !vistos.has(o.texto) && vistos.add(o.texto))
    .sort((a, b) => b.puntaje - a.puntaje || a.i - b.i)
    .slice(0, max)
    .sort((a, b) => a.i - b.i)
    .map(({ texto, pagina }) => ({ texto, pagina }));
}

// Para referencias sin PDF (OpenAlex, .bib): hallazgos tomados de su resumen.
export function hallazgosDeResumen(resumen) {
  return elegirHallazgos(oraciones(resumen ?? '', null), 5).map((h) => ({ ...h, fuente: 'resumen' }));
}

// paginas: texto de cada página → DOI, resumen, limitaciones, hallazgos y conclusiones con su página.
export function analizarTextoPdf(paginas) {
  const limpias = paginas.map(unir);
  const todo = limpias.join('\n');
  if (todo.replace(/\s/g, '').length < 200) {
    return { sinTexto: true, doi: '', resumen: '', limitaciones: [], hallazgos: [], conclusiones: null, paginas: paginas.length };
  }

  // El DOI propio está en las primeras páginas; más adelante solo hay DOIs de referencias.
  const inicio = limpias.slice(0, 2).join('\n');

  // Se descarta desde el último encabezado de referencias situado después del 40 % del texto.
  const cuerpo = [...limpias];
  let acumulado = 0;
  let corte = null;
  limpias.forEach((pg, i) => {
    for (const m of pg.matchAll(/\n\s*(?:\d+\.?\s*)?(?:references|referencias|bibliograf[ií]a|literature cited)\s*\n/gi)) {
      if (acumulado + m.index > todo.length * 0.4) corte = { i, index: m.index };
    }
    acumulado += pg.length + 1;
  });
  if (corte) {
    cuerpo[corte.i] = cuerpo[corte.i].slice(0, corte.index);
    cuerpo.length = corte.i + 1;
  }

  const frases = cuerpo.flatMap((pg, i) => oraciones(pg, i + 1));

  const limitaciones = [];
  for (const o of frases) {
    if (o.texto.length > 40 && o.texto.length < 600 && RE_LIMITACION.test(o.texto) && !limitaciones.some((l) => l.texto === o.texto)) {
      limitaciones.push(o);
      if (limitaciones.length >= 6) break;
    }
  }

  let conclusiones = null;
  for (let i = 0; i < cuerpo.length && !conclusiones; i++) {
    const m = cuerpo[i].match(/(?:^|\n)\s*(?:\d+\.?\s*|[IVX]+\.\s*)?(?:conclusions?|conclusiones|concluding remarks|summary and conclusions)\s*\n/i);
    if (!m) continue;
    let texto = cuerpo.slice(i).join('\n').slice(m.index + m[0].length);
    const fin = texto.search(/\n\s*(?:acknowledg|agradecimiento|funding|financiamiento|author contributions|conflicts? of interest|data availability|declaration)/i);
    if (fin > 0) texto = texto.slice(0, fin);
    texto = texto.replace(/\s+/g, ' ').trim();
    if (texto.length > 80) conclusiones = { texto: texto.length > 2500 ? `${texto.slice(0, 2500)}…` : texto, pagina: i + 1 };
  }

  return {
    sinTexto: false,
    doi: extraerDoi(inicio),
    resumen: extraerResumen(inicio),
    limitaciones,
    hallazgos: elegirHallazgos(frases).map((h) => ({ ...h, fuente: 'pdf' })),
    conclusiones,
    paginas: paginas.length,
  };
}

function tituloDesdePdf(meta, nombreArchivo) {
  const t = (meta ?? '').trim();
  if (t.length > 10 && !/^(microsoft word|untitled|document)/i.test(t) && !/\.(docx?|pdf|tex)$/i.test(t)) return t;
  return nombreArchivo.replace(/\.pdf$/i, '').replace(/[_]+/g, ' ');
}

// ── BibTeX ──
function limpiarBib(v) {
  return v
    .replace(/\\['`^"~=.u]\{?\\?([a-zA-Z])\}?/g, '$1') // acentos LaTeX → letra base
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function camposBib(cuerpo) {
  const campos = {};
  const re = /([A-Za-z][\w-]*)\s*=\s*/g;
  let m;
  while ((m = re.exec(cuerpo))) {
    let j = re.lastIndex, valor;
    if (cuerpo[j] === '{') {
      let prof = 0, k = j;
      for (; k < cuerpo.length; k++) {
        if (cuerpo[k] === '{') prof++;
        else if (cuerpo[k] === '}' && --prof === 0) break;
      }
      valor = cuerpo.slice(j + 1, k);
      j = k + 1;
    } else if (cuerpo[j] === '"') {
      let k = j + 1;
      while (k < cuerpo.length && !(cuerpo[k] === '"' && cuerpo[k - 1] !== '\\')) k++;
      valor = cuerpo.slice(j + 1, k);
      j = k + 1;
    } else {
      const k = cuerpo.slice(j).search(/[,}\n]/);
      valor = cuerpo.slice(j, k < 0 ? undefined : j + k);
      j = k < 0 ? cuerpo.length : j + k;
    }
    campos[m[1].toLowerCase()] = limpiarBib(valor);
    re.lastIndex = j;
  }
  return campos;
}

export function parsearBib(texto) {
  const inicios = [...texto.matchAll(/@(\w+)\s*\{\s*[^,]*,/g)];
  return inicios
    .map((m, i) => ({
      tipo: m[1].toLowerCase(),
      cuerpo: texto.slice(m.index + m[0].length, inicios[i + 1]?.index ?? texto.length),
    }))
    .filter((e) => !['comment', 'string', 'preamble'].includes(e.tipo))
    .map(({ cuerpo }) => {
      const c = camposBib(cuerpo);
      return {
        titulo: c.title ?? '',
        autores: c.author ? c.author.split(/\s+and\s+/i).map((a) => a.trim()).filter(Boolean) : [],
        anio: (c.year ?? '').match(/\d{4}/)?.[0] ?? '',
        revista: c.journal ?? c.booktitle ?? c.publisher ?? '',
        doi: limpiarDoi(c.doi),
        url: c.url ?? '',
        resumen: c.abstract ?? '',
      };
    })
    .filter((p) => p.titulo || p.doi);
}

// ── RIS ──
export function parsearRis(texto) {
  const out = [];
  let actual = null;
  for (const linea of texto.split(/\r?\n/)) {
    const m = linea.match(/^([A-Z][A-Z0-9])\s{1,2}-\s?(.*)$/);
    if (!m) continue;
    const [, tag, valor] = m;
    if (tag === 'TY') { actual = { titulo: '', autores: [], anio: '', revista: '', doi: '', url: '', resumen: '' }; continue; }
    if (!actual) continue;
    if (tag === 'ER') { out.push(actual); actual = null; continue; }
    const v = valor.trim();
    if (['AU', 'A1'].includes(tag)) actual.autores.push(v);
    else if (['TI', 'T1'].includes(tag) && !actual.titulo) actual.titulo = v;
    else if (['PY', 'Y1', 'DA'].includes(tag) && !actual.anio) actual.anio = v.match(/\d{4}/)?.[0] ?? '';
    else if (['JO', 'JF', 'T2', 'BT'].includes(tag) && !actual.revista) actual.revista = v;
    else if (tag === 'DO') actual.doi = limpiarDoi(v);
    else if (tag === 'UR' && !actual.url) actual.url = v;
    else if (tag === 'AB') actual.resumen = v;
  }
  return out.filter((p) => p.titulo || p.doi);
}

export function reconstruirResumen(indice) {
  if (!indice) return '';
  const pos = [];
  for (const [palabra, idxs] of Object.entries(indice)) for (const i of idxs) pos[i] = palabra;
  return pos.filter(Boolean).join(' ');
}

const quitarEtiquetas = (s) => (s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// ─────────────────────────────── Consultas a APIs ───────────────────────────────

async function resolverDoi(doi) {
  const ruta = doi.split('/').map(encodeURIComponent).join('/');
  const cr = await fetch(`https://api.crossref.org/works/${ruta}`);
  if (cr.ok) {
    const j = (await cr.json()).message;
    return {
      estado: 'verificado',
      titulo: quitarEtiquetas(j.title?.[0]),
      autores: (j.author ?? []).map((a) => [a.given, a.family].filter(Boolean).join(' ') || a.name).filter(Boolean),
      anio: String(j.issued?.['date-parts']?.[0]?.[0] ?? j.published?.['date-parts']?.[0]?.[0] ?? ''),
      revista: quitarEtiquetas(j['container-title']?.[0] ?? j.publisher ?? ''),
      url: j.URL ?? `https://doi.org/${doi}`,
    };
  }
  if (cr.status !== 404) return { estado: 'error' };

  // Crossref no lo tiene: puede ser un DOI de DataCite (arXiv, Zenodo, repositorios).
  const dc = await fetch(`https://api.datacite.org/dois/${ruta}`);
  if (dc.ok) {
    const a = (await dc.json()).data.attributes;
    return {
      estado: 'verificado',
      titulo: a.titles?.[0]?.title ?? '',
      autores: (a.creators ?? []).map((c) => (c.givenName ? `${c.givenName} ${c.familyName}` : c.name)).filter(Boolean),
      anio: String(a.publicationYear ?? ''),
      revista: a.container?.title ?? (typeof a.publisher === 'string' ? a.publisher : a.publisher?.name) ?? '',
      url: a.url ?? `https://doi.org/${doi}`,
    };
  }
  return { estado: dc.status === 404 ? 'invalido' : 'error' };
}

async function buscarOpenAlex(consulta, soloRecientes) {
  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('search', consulta);
  url.searchParams.set('per_page', '15');
  url.searchParams.set('select', 'id,doi,display_name,publication_year,authorships,primary_location,cited_by_count,abstract_inverted_index');
  if (soloRecientes) url.searchParams.set('filter', `from_publication_date:${new Date().getFullYear() - 5}-01-01`);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`OpenAlex respondió ${r.status}`);
  return (await r.json()).results.map((w) => ({
    doi: limpiarDoi(w.doi),
    titulo: w.display_name ?? '',
    autores: (w.authorships ?? []).map((a) => a.author?.display_name).filter(Boolean),
    anio: String(w.publication_year ?? ''),
    revista: w.primary_location?.source?.display_name ?? '',
    url: w.doi ?? w.id,
    citas: w.cited_by_count ?? 0,
    resumen: reconstruirResumen(w.abstract_inverted_index),
  }));
}

let pdfjsPromesa = null;
function cargarPdfjs() {
  pdfjsPromesa ??= import(PDFJS).then((m) => {
    m.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    return m;
  });
  return pdfjsPromesa;
}

async function leerPdf(archivo) {
  const pdfjs = await cargarPdfjs();
  const doc = await pdfjs.getDocument({ data: await archivo.arrayBuffer() }).promise;
  const meta = await doc.getMetadata().catch(() => null);
  const paginas = [];
  for (let i = 1; i <= Math.min(doc.numPages, MAX_PAGINAS_PDF); i++) {
    const contenido = await (await doc.getPage(i)).getTextContent();
    paginas.push(contenido.items.map((it) => it.str + (it.hasEOL ? '\n' : ' ')).join(''));
  }
  return { paginas, metaTitulo: meta?.info?.Title ?? '' };
}

// ─────────────────────────────────── Interfaz ───────────────────────────────────

// Las sugerencias antiguas eran texto; las nuevas traen la página.
const comoFrase = (s) => (typeof s === 'string' ? { texto: s, pagina: null } : s);

const clave = (p) => (p.doi ? `doi:${p.doi.toLowerCase()}` : `t:${norm(p.titulo).slice(0, 80)}`);

const BADGE_DOI = {
  verificado: ['ok', 'DOI verificado'],
  invalido: ['error', 'DOI inexistente'],
  pendiente: ['aviso', 'Verificando…'],
  error: ['aviso', 'DOI sin verificar'],
  sin_doi: ['aviso', 'Sin DOI'],
};
const FUENTE = { openalex: 'OpenAlex', pdf: 'PDF', bib: 'BibTeX', ris: 'RIS', doi: 'DOI', manual: 'Manual' };

export function montarEstadoArte(contenedor, ctx) {
  const papers = () => ctx.estado().estadoArte.papers;
  const abiertos = new Set();
  let resultados = [];
  let cola = Promise.resolve();

  contenedor.innerHTML = `
    <div class="ea-fuentes">
      <section class="ea-fuente">
        <h4>Buscar en OpenAlex</h4>
        <div class="fila">
          <input type="search" id="ea-q" placeholder="Palabras clave en inglés" aria-label="Consulta">
          <button type="button" id="ea-buscar">Buscar</button>
        </div>
        <label class="check"><input type="checkbox" id="ea-recientes" checked> Solo los últimos 5 años</label>
      </section>
      <section class="ea-fuente">
        <h4>Subir PDF</h4>
        <input type="file" id="ea-pdf" accept=".pdf,application/pdf" multiple>
        <p class="ayuda">Se lee en tu navegador: extrae el DOI, el resumen y frases sobre limitaciones.</p>
      </section>
      <section class="ea-fuente">
        <h4>Importar .bib o .ris</h4>
        <input type="file" id="ea-bib" accept=".bib,.ris,.txt" multiple>
        <p class="ayuda">Exporta desde Zotero, Mendeley, Scopus o Google Scholar.</p>
      </section>
      <section class="ea-fuente">
        <h4>Agregar por DOI</h4>
        <div class="fila">
          <input type="text" id="ea-doi" placeholder="10.xxxx/…" aria-label="DOI">
          <button type="button" id="ea-doi-btn">Agregar</button>
        </div>
        <button type="button" class="sec" id="ea-manual">Agregar referencia sin DOI</button>
      </section>
    </div>
    <p class="ea-estado" id="ea-estado" role="status" aria-live="polite"></p>
    <div id="ea-resultados"></div>
    <h4 class="ea-titulo-matriz">Matriz comparativa</h4>
    <p class="ayuda">Una fila por paper. Escribe las limitaciones con tus palabras e indica si las declararon los autores o las infieres tú.</p>
    <div id="ea-resumen" class="ea-resumen"></div>
    <div id="ea-matriz"></div>`;

  const $ = (sel) => contenedor.querySelector(sel);
  const q = $('#ea-q');
  q.value = ctx.consultaSugerida();

  const informar = (texto, tipo = 'info') => {
    const el = $('#ea-estado');
    el.textContent = texto;
    el.dataset.tipo = tipo;
  };

  function agregar(datos) {
    const nuevo = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      doi: '', titulo: '', autores: [], anio: '', revista: '', url: '', fuente: 'manual',
      objetivo: '', metodologia: '', resultados: '', limitaciones: '', origenLim: 'declarada', aporte: '',
      sugerencias: [], resumen: '', hallazgos: [], conclusiones: null,
      ...datos,
    };
    nuevo.doi = limpiarDoi(nuevo.doi);
    if (!nuevo.hallazgos.length && nuevo.resumen) nuevo.hallazgos = hallazgosDeResumen(nuevo.resumen);
    nuevo.doiEstado = nuevo.doi ? 'pendiente' : 'sin_doi';
    if (papers().some((p) => clave(p) === clave(nuevo))) {
      informar(`Ya está en la matriz: ${nuevo.titulo || nuevo.doi}`, 'aviso');
      return null;
    }
    papers().push(nuevo);
    if (!nuevo.limitaciones) abiertos.add(nuevo.id);
    ctx.cambiado();
    pintarMatriz();
    if (nuevo.doi) verificar(nuevo);
    return nuevo;
  }

  function verificar(p) {
    p.doiEstado = 'pendiente';
    refrescarTarjeta(p.id);
    cola = cola.then(async () => {
      try {
        const r = await resolverDoi(p.doi);
        p.doiEstado = r.estado;
        if (r.estado === 'verificado') {
          const sobrescribir = ['pdf', 'doi'].includes(p.fuente);
          for (const k of ['titulo', 'autores', 'anio', 'revista', 'url']) {
            const vacioActual = Array.isArray(p[k]) ? !p[k].length : !p[k];
            if ((sobrescribir || vacioActual) && r[k] && r[k].length) p[k] = r[k];
          }
        }
      } catch {
        p.doiEstado = 'error';
      }
      if (papers().includes(p)) {
        ctx.cambiado();
        refrescarTarjeta(p.id);
      }
    });
    return cola;
  }

  // Lee un PDF y devuelve lo extraído, listo para guardarse en la referencia.
  async function contenidoPdf(archivo) {
    const { paginas, metaTitulo } = await leerPdf(archivo);
    const info = analizarTextoPdf(paginas);
    return {
      info,
      metaTitulo,
      datos: {
        archivo: archivo.name, paginasPdf: info.paginas, hallazgos: info.hallazgos,
        conclusiones: info.conclusiones, sugerencias: info.limitaciones, resumen: info.resumen,
      },
    };
  }

  // Añade el contenido de un PDF a una referencia que ya estaba (p. ej., agregada desde OpenAlex).
  function incorporarPdf(p, d) {
    Object.assign(p, {
      archivo: d.archivo, paginasPdf: d.paginasPdf, hallazgos: d.hallazgos,
      conclusiones: d.conclusiones, sugerencias: d.sugerencias,
    });
    if (!p.resumen && d.resumen) p.resumen = d.resumen;
    abiertos.add(p.id);
  }

  function informarPdf(nombre, info) {
    if (info.sinTexto) informar(`${nombre}: parece escaneado (sin texto). Completa sus datos y su DOI a mano.`, 'aviso');
    else informar(`${nombre}: ${info.doi ? `DOI ${info.doi}` : 'sin DOI en las primeras páginas'} · ${info.hallazgos.length} hallazgo(s) con cifras · ${info.limitaciones.length} frase(s) sobre limitaciones${info.conclusiones ? ' · conclusiones extraídas' : ''}.`, info.doi ? 'info' : 'aviso');
  }

  // ── Fuentes ──
  $('#ea-buscar').addEventListener('click', async () => {
    const consulta = q.value.trim();
    if (!consulta) return informar('Escribe una consulta (usa tus palabras clave en inglés).', 'aviso');
    informar('Buscando en OpenAlex…');
    try {
      resultados = await buscarOpenAlex(consulta, $('#ea-recientes').checked);
      informar(`${resultados.length} resultados. Agrega los pertinentes a la matriz.`);
      pintarResultados();
    } catch (err) {
      informar(`No se pudo consultar OpenAlex (${err.message}). Usa PDF, .bib o DOI.`, 'error');
    }
  });
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#ea-buscar').click(); });

  $('#ea-resultados').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-agregar]');
    if (!btn) return;
    const r = resultados[Number(btn.dataset.agregar)];
    if (agregar({ ...r, fuente: 'openalex' })) {
      btn.disabled = true;
      btn.textContent = 'Agregado';
    }
  });

  $('#ea-pdf').addEventListener('change', async (e) => {
    for (const archivo of e.target.files) {
      informar(`Leyendo ${archivo.name}…`);
      try {
        const { info, metaTitulo, datos } = await contenidoPdf(archivo);
        const existente = info.doi && papers().find((pp) => pp.doi?.toLowerCase() === info.doi.toLowerCase());
        if (existente) {
          incorporarPdf(existente, datos);
          ctx.cambiado();
          refrescarTarjeta(existente.id);
          informarPdf(archivo.name, info);
          continue;
        }
        const p = agregar({ fuente: 'pdf', doi: info.doi, titulo: tituloDesdePdf(metaTitulo, archivo.name), ...datos });
        if (p) informarPdf(archivo.name, info);
      } catch (err) {
        informar(`No se pudo leer ${archivo.name}: ${err.message}`, 'error');
      }
    }
    e.target.value = '';
  });

  $('#ea-bib').addEventListener('change', async (e) => {
    let total = 0;
    for (const archivo of e.target.files) {
      const texto = await archivo.text();
      const esRis = /\.ris$/i.test(archivo.name) || /^TY\s{1,2}-/m.test(texto);
      const entradas = esRis ? parsearRis(texto) : parsearBib(texto);
      for (const en of entradas) if (agregar({ ...en, fuente: esRis ? 'ris' : 'bib' })) total++;
    }
    informar(`${total} referencia(s) importada(s). Verificando DOIs…`);
    e.target.value = '';
  });

  $('#ea-doi-btn').addEventListener('click', () => {
    const doi = limpiarDoi($('#ea-doi').value);
    if (!/^10\.\d{4,9}\//.test(doi)) return informar('Eso no parece un DOI (empieza con “10.”).', 'aviso');
    if (agregar({ fuente: 'doi', doi, titulo: doi })) $('#ea-doi').value = '';
  });

  $('#ea-manual').addEventListener('click', () => {
    agregar({ fuente: 'manual', titulo: 'Nueva referencia (edita sus datos)' });
  });

  // ── Matriz ──
  function pintarResultados() {
    const ya = new Set(papers().map(clave));
    $('#ea-resultados').innerHTML = resultados.length
      ? `<ol class="ea-lista">${resultados.map((r, i) => `
          <li>
            <div>
              <strong>${escHtml(r.titulo)}</strong>
              <span class="meta">${escHtml(refCorta(r))} · ${escHtml(r.revista || 's. r.')} · ${r.citas} citas</span>
            </div>
            <button type="button" class="sec" data-agregar="${i}" ${ya.has(clave(r)) ? 'disabled' : ''}>${ya.has(clave(r)) ? 'Agregado' : 'Agregar'}</button>
          </li>`).join('')}</ol>`
      : '';
  }

  function tarjeta(p, i) {
    const [tipoDoi, txtDoi] = BADGE_DOI[p.doiEstado] ?? BADGE_DOI.sin_doi;
    const limOk = p.limitaciones?.trim();
    const area = (campo, etq, filas = 2) => `
      <label class="campo-mini">${etq}
        <textarea data-pc="${campo}" rows="${filas}">${escHtml(p[campo])}</textarea>
      </label>`;
    const chips = (p.sugerencias ?? []).map(comoFrase).map((s, k) => `
      <button type="button" class="chip" data-sugerencia="${k}" title="Añadir a limitaciones">+ ${escHtml(s.texto.length > 140 ? `${s.texto.slice(0, 140)}…` : s.texto)}${s.pagina ? ` <em>(p. ${s.pagina})</em>` : ''}</button>`).join('');
    const hallazgos = p.hallazgos ?? [];
    const desdeResumen = hallazgos.length && hallazgos.every((h) => h.fuente === 'resumen');
    const bloqueHallazgos = hallazgos.length ? `
          <div class="hallazgos">
            <span class="etq-lim">Hallazgos cuantitativos (${hallazgos.filter((h) => !h.descartado).length} de ${hallazgos.length})</span>
            <p class="ayuda">Frases con cifras extraídas ${desdeResumen ? 'del resumen' : 'del PDF, con su página'}. Desmarca las que no sean resultados del trabajo: la skill citará solo las marcadas.</p>
            <ul>${hallazgos.map((h, k) => `
              <li><label class="check"><input type="checkbox" data-hallazgo="${k}" ${h.descartado ? '' : 'checked'}>
                <span>${escHtml(h.texto)}${h.pagina ? ` <em>(p. ${h.pagina})</em>` : ''}</span></label></li>`).join('')}
            </ul>
          </div>` : '';
    return `
      <details class="paper" data-id="${p.id}" ${abiertos.has(p.id) ? 'open' : ''}>
        <summary>
          <span class="paper-num">[${i + 1}]</span>
          <span class="paper-tit">${escHtml(refCorta(p))} — ${escHtml(p.titulo)}</span>
          <span class="badges">
            <span class="badge ${tipoDoi}" data-badge-doi>${txtDoi}</span>
            <span class="badge ${limOk ? 'ok' : 'error'}" data-badge-lim>${limOk ? 'Limitaciones' : 'Sin limitaciones'}</span>
            <span class="badge neutro">${FUENTE[p.fuente] ?? p.fuente}</span>
            ${p.archivo ? `<span class="badge ok" title="${escHtml(p.archivo)}">PDF · ${p.paginasPdf ?? '?'} pág.</span>` : ''}
          </span>
        </summary>
        <div class="paper-cuerpo">
          <p class="meta">${escHtml(p.autores.join(', ') || 'Autores sin completar')} · ${escHtml(p.revista || 'Fuente sin completar')} · ${escHtml(p.anio || 's. f.')}
            ${p.doi ? ` · <a href="https://doi.org/${escHtml(p.doi)}" target="_blank" rel="noopener">${escHtml(p.doi)}</a>` : ''}</p>
          ${p.resumen ? `<details class="resumen-paper"><summary>Resumen</summary><p>${escHtml(p.resumen)}</p></details>` : ''}
          ${p.conclusiones ? `<details class="resumen-paper"><summary>Conclusiones del PDF (p. ${p.conclusiones.pagina})</summary><p>${escHtml(p.conclusiones.texto)}</p></details>` : ''}
          <div class="grid-2">
            ${area('objetivo', 'Objetivo')}
            ${area('metodologia', 'Metodología')}
            ${area('resultados', 'Resultados')}
            ${area('aporte', 'Aporte')}
          </div>
          ${bloqueHallazgos}
          <div class="limitaciones">
            <div class="fila-lim">
              <span class="etq-lim">Limitaciones</span>
              <select data-pc="origenLim" aria-label="Origen de la limitación">
                <option value="declarada" ${p.origenLim === 'declarada' ? 'selected' : ''}>Declarada por los autores</option>
                <option value="inferida" ${p.origenLim === 'inferida' ? 'selected' : ''}>Inferida por mi análisis</option>
              </select>
            </div>
            <textarea data-pc="limitaciones" rows="3" aria-label="Limitaciones">${escHtml(p.limitaciones)}</textarea>
            ${chips ? `<p class="ayuda">Frases encontradas en el PDF (revísalas antes de usarlas):</p><div class="chips">${chips}</div>` : ''}
          </div>
          <details class="editar-biblio">
            <summary>Editar datos bibliográficos</summary>
            <div class="grid-2">
              <label class="campo-mini">Título<input data-pc="titulo" value="${escHtml(p.titulo)}"></label>
              <label class="campo-mini">Autores (separados por ;)<input data-pc="autores" value="${escHtml(p.autores.join('; '))}"></label>
              <label class="campo-mini">Año<input data-pc="anio" inputmode="numeric" value="${escHtml(p.anio)}"></label>
              <label class="campo-mini">Revista / fuente<input data-pc="revista" value="${escHtml(p.revista)}"></label>
              <label class="campo-mini">DOI<input data-pc="doi" value="${escHtml(p.doi)}"></label>
            </div>
          </details>
          <div class="paper-acciones">
            <label class="btn sec">${p.archivo ? 'Reemplazar PDF' : 'Adjuntar PDF'}<input type="file" accept=".pdf,application/pdf" data-adjuntar hidden></label>
            <button type="button" class="sec" data-accion="verificar" ${p.doi ? '' : 'disabled'}>Verificar DOI</button>
            <button type="button" class="peligro" data-accion="eliminar">Eliminar</button>
          </div>
        </div>
      </details>`;
  }

  function pintarResumen() {
    const ps = papers();
    const verif = ps.filter((p) => p.doiEstado === 'verificado').length;
    const conLim = ps.filter((p) => p.limitaciones?.trim()).length;
    $('#ea-resumen').textContent = ps.length
      ? `${ps.length} referencias · ${conLim} con limitaciones · ${verif} DOI verificados · mínimo requerido: ${ctx.minimo()}`
      : 'Aún no hay referencias. Usa cualquiera de las cuatro formas de arriba.';
  }

  function pintarMatriz() {
    $('#ea-matriz').innerHTML = papers().map(tarjeta).join('');
    pintarResumen();
  }

  // Si el usuario está escribiendo dentro de la tarjeta, solo se actualizan las etiquetas.
  function refrescarTarjeta(id) {
    const el = $(`.paper[data-id="${id}"]`);
    const i = papers().findIndex((p) => p.id === id);
    if (!el || i < 0) return;
    if (el.contains(document.activeElement)) {
      const [tipo, txt] = BADGE_DOI[papers()[i].doiEstado] ?? BADGE_DOI.sin_doi;
      const b = el.querySelector('[data-badge-doi]');
      b.className = `badge ${tipo}`;
      b.textContent = txt;
    } else {
      el.outerHTML = tarjeta(papers()[i], i);
    }
    pintarResumen();
  }

  const matriz = $('#ea-matriz');
  const paperDe = (el) => papers().find((p) => p.id === el.closest('.paper')?.dataset.id);

  matriz.addEventListener('toggle', (e) => {
    if (!e.target.matches('.paper')) return;
    if (e.target.open) abiertos.add(e.target.dataset.id);
    else abiertos.delete(e.target.dataset.id);
  }, true);

  matriz.addEventListener('input', (e) => {
    const campo = e.target.dataset.pc;
    const p = campo && paperDe(e.target);
    if (!p) return;
    const v = e.target.value;
    if (campo === 'autores') p.autores = v.split(';').map((x) => x.trim()).filter(Boolean);
    else if (campo === 'doi') {
      p.doi = limpiarDoi(v);
      p.doiEstado = p.doi ? 'error' : 'sin_doi'; // queda sin verificar hasta pulsar el botón
      e.target.closest('.paper').querySelector('[data-accion="verificar"]').disabled = !p.doi;
    } else p[campo] = v;
    if (campo === 'limitaciones') {
      const b = e.target.closest('.paper').querySelector('[data-badge-lim]');
      b.className = `badge ${v.trim() ? 'ok' : 'error'}`;
      b.textContent = v.trim() ? 'Limitaciones' : 'Sin limitaciones';
    }
    ctx.cambiado();
    pintarResumen();
  });
  matriz.addEventListener('change', async (e) => {
    if (e.target.matches('select[data-pc]')) {
      e.target.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    const p = paperDe(e.target);
    if (!p) return;
    if (e.target.dataset.hallazgo !== undefined) {
      p.hallazgos[Number(e.target.dataset.hallazgo)].descartado = !e.target.checked;
      const etq = e.target.closest('.hallazgos').querySelector('.etq-lim');
      etq.textContent = `Hallazgos cuantitativos (${p.hallazgos.filter((h) => !h.descartado).length} de ${p.hallazgos.length})`;
      ctx.cambiado();
    } else if (e.target.matches('[data-adjuntar]') && e.target.files[0]) {
      const archivo = e.target.files[0];
      informar(`Leyendo ${archivo.name}…`);
      try {
        const { info, datos } = await contenidoPdf(archivo);
        incorporarPdf(p, datos);
        if (!p.doi && info.doi) {
          p.doi = info.doi;
          verificar(p);
        }
        ctx.cambiado();
        refrescarTarjeta(p.id);
        informarPdf(archivo.name, info);
      } catch (err) {
        informar(`No se pudo leer ${archivo.name}: ${err.message}`, 'error');
      }
    }
  });

  matriz.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    const p = btn && paperDe(btn);
    if (!p) return;
    if (btn.dataset.sugerencia !== undefined) {
      const s = comoFrase(p.sugerencias[Number(btn.dataset.sugerencia)]);
      const frase = s.pagina ? `${s.texto} (p. ${s.pagina})` : s.texto;
      const ta = btn.closest('.limitaciones').querySelector('textarea');
      ta.value = ta.value.trim() ? `${ta.value.trim()}\n${frase}` : frase;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      btn.remove();
    } else if (btn.dataset.accion === 'verificar') {
      verificar(p);
    } else if (btn.dataset.accion === 'eliminar') {
      if (!confirm(`¿Eliminar “${p.titulo}” de la matriz?`)) return;
      papers().splice(papers().indexOf(p), 1);
      ctx.cambiado();
      pintarMatriz();
      pintarResultados();
    }
  });

  pintarMatriz();
}
