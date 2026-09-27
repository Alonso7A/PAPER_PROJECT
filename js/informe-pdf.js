// Informe en PDF: protocolo completo + anexo con una ficha por referencia (hallazgos con
// página, conclusiones, resumen) + el proyecto JSON ADJUNTO dentro del PDF.
// El adjunto (proyecto-paper.json) es lo que lee la skill paper_proyectos_GMIDEI: así el
// PDF sirve a la vez para leerlo y como entrada exacta, sin depender de extraer texto.
import { lista, vacio, refCorta } from './util.js';
import { construirMatriz, COLUMNAS_MATRIZ, ARREGLOS, parsearKeywords } from './reglas.js';
import { formatearReferencia } from './informe.js';

const PDFMAKE = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js';
const PDFMAKE_FUENTES = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.min.js';
const PDFLIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.esm.min.js';
export const NOMBRE_ADJUNTO = 'proyecto-paper.json';

const AZUL = '#00629B';
const GRIS = '#5A6B7D';

function cargarScript(src) {
  return new Promise((ok, mal) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = Object.assign(document.createElement('script'), { src });
    s.onload = ok;
    s.onerror = () => mal(new Error(`no se pudo cargar ${src}`));
    document.head.append(s);
  });
}

async function librerias() {
  await cargarScript(PDFMAKE);
  await cargarScript(PDFMAKE_FUENTES);
  return { pdfMake: window.pdfMake, pdfLib: await import(PDFLIB) };
}

// ───────────────────────────── piezas del documento ─────────────────────────────

const t = (v) => (vacio(v) ? '—' : String(v).trim());
const h1 = (texto, extra = {}) => ({ text: texto, style: 'h1', ...extra });
const h2 = (texto) => ({ text: texto, style: 'h2' });
const parrafo = (etq, valor) => ({ text: [{ text: `${etq} `, bold: true }, t(valor)], margin: [0, 0, 0, 5] });

function tabla(cabeceras, filas, anchos) {
  return {
    table: {
      headerRows: 1,
      widths: anchos ?? cabeceras.map(() => '*'),
      body: [
        cabeceras.map((c) => ({ text: c, style: 'tablaCab' })),
        ...filas.map((f) => f.map((c) => (typeof c === 'object' && c !== null ? c : { text: t(c), style: 'tabla' }))),
      ],
    },
    layout: {
      hLineWidth: (i, nodo) => (i === 0 || i === 1 || i === nodo.table.body.length ? 0.8 : 0.3),
      vLineWidth: () => 0,
      hLineColor: (i) => (i <= 1 ? '#333' : '#C9D2DC'),
      fillColor: (i) => (i === 0 ? '#EEF2F6' : null),
      paddingTop: () => 3, paddingBottom: () => 3,
    },
    margin: [0, 2, 0, 10],
  };
}

const claveValor = (filas) => tabla(['Dato', 'Valor'], filas, [150, '*']);

function bloqueAutores(autores) {
  if (!autores.length) return { text: 'Sin autores registrados', style: 'nota', alignment: 'center' };
  const filas = [];
  for (let i = 0; i < autores.length; i += 3) filas.push(autores.slice(i, i + 3));
  return filas.map((fila) => ({
    columns: fila.map((a) => ({
      width: '*',
      stack: [
        { text: `${t(a.nombre)}${a.correspondencia ? '*' : ''}`, fontSize: 10.5 },
        ...[a.departamento, a.universidad, [a.ciudad, a.pais].filter(Boolean).join(', '), a.correo, a.orcid ? `ORCID: ${a.orcid}` : '']
          .filter(Boolean).map((l) => ({ text: l, fontSize: 8.5 })),
      ],
      alignment: 'center',
    })),
    columnGap: 10,
    margin: [0, 0, 0, 10],
  }));
}

function combinacion(s, d) {
  const orden = d.combinaciones.orden;
  if (!orden.every((k) => s.tipificacion[k])) return null;
  const actual = orden.map((k) => s.tipificacion[k]).join('|');
  return d.combinaciones.validas.find((v) => v.c.join('|') === actual)?.n ?? null;
}

// formatearReferencia marca la revista con *cursiva* de Markdown; en el PDF se quita.
const referenciaTexto = (p, estilo, n) => formatearReferencia(p, estilo, n).replace(/\*/g, '');

function fichaReferencia(p, n, estilo) {
  const hallazgos = (p.hallazgos ?? []).filter((h) => !h.descartado);
  const descartados = (p.hallazgos ?? []).length - hallazgos.length;
  const estadoDoi = { verificado: 'verificado', invalido: 'INEXISTENTE — no citar', pendiente: 'sin verificar', error: 'sin verificar', sin_doi: 'sin DOI' }[p.doiEstado] ?? p.doiEstado;
  const fuenteHallazgos = hallazgos.length && hallazgos.every((h) => h.fuente === 'resumen') ? 'del resumen' : 'del PDF';
  return {
    stack: [
      { text: referenciaTexto(p, estilo, n), style: 'h2', margin: [0, 8, 0, 2] },
      {
        text: [
          `DOI: ${p.doi || '—'} (${estadoDoi})  ·  Fuente: ${p.fuente ?? '—'}`,
          p.archivo ? `  ·  PDF: ${p.archivo} (${p.paginasPdf ?? '?'} pág.)` : '  ·  Sin PDF adjuntado',
        ],
        style: 'nota', margin: [0, 0, 0, 4],
      },
      tabla(['Campo', 'Contenido'], [
        ['Objetivo', p.objetivo], ['Metodología', p.metodologia], ['Resultados', p.resultados],
        [`Limitaciones (${p.origenLim === 'inferida' ? 'inferidas' : 'declaradas'})`, p.limitaciones], ['Aporte', p.aporte],
      ], [110, '*']),
      ...(hallazgos.length ? [
        { text: `Hallazgos cuantitativos ${fuenteHallazgos}, revisados por el usuario${descartados ? ` (${descartados} descartado/s)` : ''}`, bold: true, fontSize: 9, margin: [0, 0, 0, 3] },
        { ul: hallazgos.map((h) => ({ text: [h.texto, h.pagina ? { text: `  (p. ${h.pagina})`, color: AZUL, bold: true } : ''], fontSize: 8.5 })), margin: [0, 0, 0, 6] },
      ] : []),
      ...(p.conclusiones ? [
        { text: `Conclusiones del PDF (p. ${p.conclusiones.pagina})`, bold: true, fontSize: 9, margin: [0, 0, 0, 2] },
        { text: p.conclusiones.texto, fontSize: 8.5, margin: [0, 0, 0, 6] },
      ] : []),
      ...(p.resumen ? [
        { text: 'Resumen', bold: true, fontSize: 9, margin: [0, 0, 0, 2] },
        { text: p.resumen, fontSize: 8.5, color: '#333', margin: [0, 0, 0, 6] },
      ] : []),
    ],
    unbreakable: false,
  };
}

// ───────────────────────────── documento completo ─────────────────────────────

export function construirDocumento(s, d, exp) {
  const pr = s.problema, v = s.variables, c = s.cadena, x = s.diseno;
  const crit = d.combinaciones.criterios;
  const etq = (k) => (s.tipificacion[k] ? crit[k].opciones[s.tipificacion[k]] : '—');
  const autores = s.autores?.lista ?? [];
  const papers = s.estadoArte.papers ?? [];
  const estilo = pr.citacion === 'APA' ? 'APA' : 'IEEE';
  const kw = parsearKeywords(s.keywords.texto);
  const verbo = d.verbos.verbos[s.titulo.verbo];
  const res = parseFloat(String(v.resolucion ?? '').replace(',', '.'));
  const umb = parseFloat(String(v.umbral ?? '').replace(',', '.'));
  const relacion = res > 0 && umb > 0 ? `${(umb / res).toFixed(1).replace('.', ',')}:1` : '—';
  const nComb = combinacion(s, d);
  const vacioTxt = {
    evidencia: 'De evidencia (nadie lo midió)', metodologico: 'Metodológico (método débil)', contexto: 'De contexto (no probado en este escenario)',
    articulacion: 'De articulación (dominios no conectados)', practico: 'Práctico (sin implementación)',
  }[s.estadoArte.vacio] ?? '—';
  const fecha = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  const conCitas = papers.filter((p) => p.doiEstado !== 'invalido');

  const recuadros = Object.values(exp.recuadros ?? {});
  const avisosPendientes = recuadros.flatMap((r) => [
    ...r.errores.map((e) => ({ r, n: 'Error', e })), ...r.advertencias.map((e) => ({ r, n: 'Advertencia', e })),
  ]);

  const contenido = [
    // Portada
    { text: t(s.titulo.texto), style: 'titulo' },
    { text: 'Protocolo de investigación y datos del proyecto', style: 'subtitulo' },
    ...[bloqueAutores(autores)].flat(),
    autores.some((a) => a.correspondencia)
      ? { text: `* Autor de correspondencia: ${autores.find((a) => a.correspondencia).correo ?? ''}`, style: 'nota', alignment: 'center', margin: [0, 0, 0, 8] } : '',
    {
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            { text: exp.completo ? 'Validación: completo — ningún recuadro con errores' : 'Validación: INCOMPLETO — revisa la sección 10', bold: true, color: exp.completo ? '#1E7A44' : '#B3261E', fontSize: 9.5 },
            { text: `Este PDF lleva adjunto el archivo ${NOMBRE_ADJUNTO} con todos los datos del proyecto. Entrégalo a la skill paper_proyectos_GMIDEI de Claude Code (“genera el paper desde este informe”) para redactar el artículo en LaTeX.`, fontSize: 8.5, margin: [0, 3, 0, 0] },
            { text: `Generado el ${fecha}${s.autores?.grupo ? ` · Grupo ${s.autores.grupo}` : ''} · Creador de Papers`, fontSize: 8, color: GRIS, margin: [0, 3, 0, 0] },
          ],
          margin: [8, 6, 8, 6],
        }]],
      },
      layout: { hLineColor: () => AZUL, vLineColor: () => AZUL, hLineWidth: () => 0.8, vLineWidth: () => 0.8 },
      margin: [0, 6, 0, 14],
    },

    h1('1. Datos generales'),
    claveValor([
      ['Destino', { revista: 'Artículo de revista', congreso: 'Artículo de congreso', tesis: 'Tesis' }[pr.destino]],
      ['Nivel académico', { bachiller: 'Bachiller', titulo: 'Título profesional', maestria: 'Maestría', doctorado: 'Doctorado' }[pr.nivelAcad]],
      ['Estilo de citación', pr.citacion],
      ['Idioma del manuscrito', { es: 'Español (resumen también en inglés)', en: 'Inglés' }[pr.idioma]],
      ['Grupo', s.autores?.grupo],
    ]),

    h1('2. Planteamiento del problema'),
    parrafo('A1. Fenómeno observado.', pr.a1),
    parrafo('A2. Evidencia.', pr.a2),
    parrafo('A3. Afectados y consecuencias.', pr.a3),
    parrafo('A4. Tipo de problema.', pr.a4 === 'conocimiento' ? 'Problema de conocimiento' : pr.a4 === 'tarea' ? 'Tarea de ingeniería' : null),
    parrafo('A5. Lo que se sabe y lo que falta.', pr.a5),
    h2('Recursos (bloque C)'),
    claveValor([
      ['C1. Laboratorio y equipos', { si: 'Sí, acceso completo', parcial: 'Parcial o por gestionar', no: 'No' }[pr.c1]],
      ['C2. Presupuesto y plazos', pr.c2], ['C3. Tiempo total', pr.c3], ['C4. Software', pr.c4],
    ]),

    h1('3. Título y palabras clave'),
    { text: t(s.titulo.texto), italics: true, fontSize: 11, margin: [0, 0, 0, 6] },
    tabla(['Componente', 'Valor'], [
      ['Verbo rector', s.titulo.verbo ? `${s.titulo.verbo} (nivel ${verbo?.niveles.join(' / ')}; forma nominal: ${verbo?.nominal})` : null],
      ['Variable dependiente', v.vd ? `${v.vd} [${t(v.unidad)}]` : null],
      ['Variable independiente', v.vi ? `${v.vi} (niveles: ${t(v.viNiveles)})` : null],
      ['Contexto', s.titulo.contexto], ['Condición', s.titulo.condicion],
    ], [130, '*']),
    tabla(['Palabra clave', 'Keyword'], kw.map((k) => [k.es, k.en]), ['*', '*']),

    h1('4. Variables y medición'),
    tabla(['Variable', 'Tipo', 'Indicador', 'Instrumento', 'Unidad'], [
      [v.vi, 'Independiente', `Niveles: ${t(v.viNiveles)}`, 'Controlada por diseño', '—'],
      [v.vd, 'Dependiente', v.vd, `${t(v.instrumento)}${v.resolucion ? ` (resolución ${v.resolucion})` : ''}`, v.unidad],
    ], ['*', 60, '*', '*', 45]),
    parrafo('Umbral a afirmar:', v.umbral ? `${v.umbral} ${t(v.unidad)} — relación umbral/resolución ${relacion} (regla práctica 10:1)` : null),
    parrafo('Intervinientes y control:', v.intervinientes),

    h1('5. Tipificación metodológica'),
    tabla(['Criterio', 'Elección'], d.combinaciones.orden.map((k) => [crit[k].label, etq(k)]), [150, '*']),
    { text: nComb ? `Coincide con la combinación nº ${nComb} de la matriz filtrada de Casquero (2026).` : 'La combinación no figura entre las 30 válidas de la matriz filtrada: debe justificarse.', style: 'nota', margin: [0, 0, 0, 6] },
    parrafo('Implementación prevista.', s.tipificacion.implementacion),

    h1('6. Estado del arte'),
    parrafo('Tipo de vacío:', vacioTxt),
    parrafo('Aporte:', s.estadoArte.aporte),
    { text: `${papers.length} referencias (${papers.filter((p) => p.doiEstado === 'verificado').length} con DOI verificado, ${papers.filter((p) => p.archivo).length} con PDF analizado). La matriz comparativa está en la página siguiente y el detalle de cada una en el Anexo A.`, style: 'nota' },

    // Matriz comparativa en horizontal
    h1('6.1 Matriz comparativa', { pageBreak: 'before', pageOrientation: 'landscape' }),
    tabla(['Ref.', 'Objetivo', 'Metodología', 'Resultados', 'Limitaciones', 'Aporte'],
      papers.map((p, i) => [
        { text: [{ text: `[${i + 1}] `, bold: true }, refCorta(p)], style: 'tabla' },
        p.objetivo, p.metodologia, p.resultados,
        p.limitaciones ? `${p.limitaciones} (${p.origenLim === 'inferida' ? 'inferida' : 'declarada'})` : null, p.aporte,
      ]), [70, '*', '*', '*', '*', '*']),

    h1('7. Matriz de consistencia'),
    tabla(COLUMNAS_MATRIZ.map(([, l]) => l), construirMatriz(s, d).map((f) => COLUMNAS_MATRIZ.map(([k]) => f[k]))),

    h1('8. Cadena lógica', { pageBreak: 'before', pageOrientation: 'portrait' }),
    parrafo('Pregunta general.', c.preguntaGeneral),
    h2('Preguntas específicas'),
    { ol: lista(c.preguntasEsp).map((q) => ({ text: q, fontSize: 9.5 })), margin: [0, 0, 0, 6] },
    parrafo('Objetivo general.', c.objetivoGeneral),
    h2('Objetivos específicos'),
    { ol: lista(c.objetivosEsp).map((o) => ({ text: o, fontSize: 9.5 })), margin: [0, 0, 0, 6] },
    parrafo('Hipótesis de investigación (H1).', c.h1),
    parrafo('Hipótesis nula (H0).', c.h0),
    ...(lista(c.hEsp).length ? [h2('Hipótesis específicas'), { ol: lista(c.hEsp).map((h) => ({ text: h, fontSize: 9.5 })) }] : []),

    h1('9. Diseño experimental'),
    claveValor([
      ['Arreglo', ARREGLOS[x.arreglo]],
      ['Factores × niveles', x.factores || x.niveles ? `${t(x.factores)} × ${t(x.niveles)}` : null],
      ['Réplicas', x.replicas], ['Aleatorización', x.aleatorizacion ? 'Sí' : 'No'], ['Prueba piloto', x.piloto ? 'Sí' : 'No'],
      ['Materiales, equipo y herramientas', x.materiales], ['Población y muestra', x.muestra], ['Línea base', x.lineaBase],
      ['Norma de ensayo', x.norma], ['Análisis de datos', x.analisis],
    ]),
    parrafo('Procedimiento.', x.procedimiento),

    h1('10. Estado de validación'),
    tabla(['Recuadro', 'Estado'], recuadros.map((r) => [`${r.numero} · ${r.titulo}`, { ok: 'Completo', aviso: 'Con advertencias', error: 'Con errores', pendiente: 'Pendiente' }[r.estado] ?? r.estado]), ['*', 110]),
    ...(avisosPendientes.length
      ? [h2('Errores y advertencias no corregidos'), { ul: avisosPendientes.map((a) => ({ text: [{ text: `${a.n} (${a.r.numero} · ${a.r.titulo}): `, bold: true }, a.e], fontSize: 8.5 })) }]
      : [{ text: 'Sin errores ni advertencias pendientes.', style: 'nota' }]),

    h1('Anexo A. Fichas de referencias', { pageBreak: 'before' }),
    { text: 'Detalle de cada referencia para citar con precisión. Los hallazgos llevan la página del PDF de donde se extrajeron; solo figuran los que el usuario dejó marcados.', style: 'nota', margin: [0, 0, 0, 6] },
    ...papers.map((p, i) => fichaReferencia(p, i + 1, estilo)),

    h1('Referencias', { pageBreak: 'before' }),
    ...conCitas.map((p, i) => ({ text: referenciaTexto(p, estilo, i + 1), fontSize: 8.5, margin: [0, 0, 0, 3] })),
  ];

  return {
    pageSize: 'A4',
    pageMargins: [50, 55, 50, 50],
    info: {
      title: s.titulo.texto || 'Proyecto de paper',
      author: autores.map((a) => a.nombre).filter(Boolean).join(', '),
      subject: 'Protocolo de investigación — Creador de Papers',
      keywords: kw.map((k) => k.es).join(', '),
      creator: 'Creador de Papers',
    },
    header: (pagina) => (pagina > 1 ? { text: t(s.titulo.texto).slice(0, 110), fontSize: 7.5, color: GRIS, margin: [50, 22, 50, 0] } : null),
    footer: (pagina, total) => ({
      columns: [
        { text: `Creador de Papers · adjunto: ${NOMBRE_ADJUNTO}`, fontSize: 7.5, color: GRIS },
        { text: `${pagina} / ${total}`, alignment: 'right', fontSize: 7.5, color: GRIS },
      ],
      margin: [50, 12, 50, 0],
    }),
    content: contenido,
    styles: {
      titulo: { fontSize: 17, bold: true, alignment: 'center', margin: [0, 10, 0, 4] },
      subtitulo: { fontSize: 10, color: GRIS, alignment: 'center', margin: [0, 0, 0, 14] },
      h1: { fontSize: 12.5, bold: true, color: AZUL, margin: [0, 12, 0, 6] },
      h2: { fontSize: 10, bold: true, margin: [0, 6, 0, 4] },
      tablaCab: { fontSize: 8.5, bold: true },
      tabla: { fontSize: 8.5 },
      nota: { fontSize: 8.5, italics: true, color: GRIS, margin: [0, 0, 0, 4] },
    },
    defaultStyle: { fontSize: 9.5, lineHeight: 1.15 },
  };
}

// Genera el PDF, le adjunta el proyecto JSON y devuelve los bytes.
export async function generarPdf(s, d, exp) {
  const { pdfMake, pdfLib } = await librerias();
  const base = await new Promise((ok, mal) => {
    try {
      pdfMake.createPdf(construirDocumento(s, d, exp)).getBuffer((buf) => ok(new Uint8Array(buf)));
    } catch (err) {
      mal(err);
    }
  });
  const doc = await pdfLib.PDFDocument.load(base);
  const json = JSON.stringify({ ...s, _export: exp }, null, 2);
  await doc.attach(new TextEncoder().encode(json), NOMBRE_ADJUNTO, {
    mimeType: 'application/json',
    description: 'Proyecto completo exportado por Creador de Papers (entrada de la skill paper_proyectos_GMIDEI)',
    creationDate: new Date(),
    modificationDate: new Date(),
  });
  doc.setProducer('Creador de Papers (pdfmake + pdf-lib)');
  return doc.save();
}
