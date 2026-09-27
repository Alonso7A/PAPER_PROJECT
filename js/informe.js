// Genera el informe final en Markdown: protocolo de investigación (recuadros 0–8)
// + esqueleto IMRaD del paper + advertencias no corregidas + referencias.
import { lista, vacio, partirNombre } from './util.js';
import { construirMatriz, COLUMNAS_MATRIZ, ARREGLOS, parsearKeywords } from './reglas.js';

const PENDIENTE = '_[pendiente]_';

// Texto del usuario dentro del Markdown: sin HTML activo, pero legible en el .md descargado.
const seguro = (s) => (s ?? '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
const txt = (s) => (vacio(s) ? PENDIENTE : seguro(s.toString().trim()));
// Celda de tabla Markdown: una sola línea y sin barras verticales.
const celda = (s) => (vacio(s) ? '—' : seguro(s.toString().trim()).replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' '));

function tabla(cabeceras, filas) {
  return [
    `| ${cabeceras.join(' | ')} |`,
    `|${cabeceras.map(() => '---').join('|')}|`,
    ...filas.map((f) => `| ${f.map(celda).join(' | ')} |`),
  ].join('\n');
}

const numerada = (items) => (items.length ? items.map((x, i) => `${i + 1}. ${txt(x)}`).join('\n') : PENDIENTE);

// ── Referencias ──
const iniciales = (given) => given.split(/[\s-]+/).filter(Boolean).map((g) => `${g[0].toUpperCase()}.`).join(' ');

function autoresIEEE(autores) {
  const n = autores.map((a) => {
    const { given, family } = partirNombre(a);
    return [iniciales(given), family].filter(Boolean).join(' ');
  });
  if (n.length > 6) return `${n[0]} et al.`;
  if (n.length <= 2) return n.join(' and ');
  return `${n.slice(0, -1).join(', ')}, and ${n.at(-1)}`;
}

function autoresAPA(autores) {
  const n = autores.map((a) => {
    const { given, family } = partirNombre(a);
    return [family, iniciales(given)].filter(Boolean).join(', ');
  });
  if (n.length <= 1) return n.join('');
  return `${n.slice(0, -1).join(', ')}, & ${n.at(-1)}`;
}

export function formatearReferencia(p, estilo, n) {
  const doi = p.doi ? `https://doi.org/${p.doi}` : p.url || '';
  if (estilo === 'APA') {
    return `${autoresAPA(p.autores) || 'Sin autor'} (${p.anio || 's. f.'}). ${p.titulo}. ${p.revista ? `*${p.revista}*. ` : ''}${doi}`.trim();
  }
  return `[${n}] ${autoresIEEE(p.autores) || 'Sin autor'}, “${p.titulo},” ${p.revista ? `*${p.revista}*, ` : ''}${p.anio || 's. f.'}${p.doi ? `, doi: ${p.doi}` : doi ? `. [Online]. Available: ${doi}` : ''}.`;
}

function referencias(papers, estilo) {
  if (!papers.length) return PENDIENTE;
  if (estilo === 'APA') {
    const orden = [...papers].sort((a, b) =>
      partirNombre(a.autores[0] ?? '').family.localeCompare(partirNombre(b.autores[0] ?? '').family, 'es'));
    return orden.map((p) => seguro(formatearReferencia(p, 'APA'))).join('\n\n');
  }
  return papers.map((p, i) => seguro(formatearReferencia(p, 'IEEE', i + 1))).join('\n\n');
}

// ── Informe ──
export function generarMarkdown(s, d, mensajes, secciones) {
  const crit = d.combinaciones.criterios;
  const lbl = (k) => (s.tipificacion[k] ? crit[k].opciones[s.tipificacion[k]] : '—');
  const v = s.variables, c = s.cadena, x = s.diseno, p = s.problema;
  const papers = s.estadoArte.papers ?? [];
  const objetivos = lista(c.objetivosEsp);
  const estilo = p.citacion === 'APA' ? 'APA' : 'IEEE';
  const cita = (i) => (estilo === 'APA' ? `(${partirNombre(papers[i].autores[0] ?? 'Sin autor').family}, ${papers[i].anio || 's. f.'})` : `[${i + 1}]`);
  const destinoTxt = { revista: 'Artículo de revista', congreso: 'Artículo de congreso', tesis: 'Tesis' }[p.destino] ?? '—';
  const nivelAcadTxt = { bachiller: 'Bachiller', titulo: 'Título profesional', maestria: 'Maestría', doctorado: 'Doctorado' }[p.nivelAcad] ?? '—';
  const fecha = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  const vacioTxt = {
    evidencia: 'De evidencia (nadie lo midió)', metodologico: 'Metodológico (se hizo con método débil)',
    contexto: 'De contexto (no se probó en este escenario)', articulacion: 'De articulación (dominios nunca conectados)',
    practico: 'Práctico (existe en teoría, sin implementación)',
  }[s.estadoArte.vacio] ?? '—';
  const tipificacionFrase = d.combinaciones.orden.every((k) => s.tipificacion[k])
    ? `Investigación de enfoque ${lbl('enfoque').toLowerCase()}, tipo ${lbl('tipo').toLowerCase()}, nivel ${lbl('nivel').toLowerCase()}, diseño ${lbl('diseno').toLowerCase()}, temporalidad ${lbl('temporalidad').toLowerCase()} y unidad de análisis ${lbl('unidad').toLowerCase()}.`
    : PENDIENTE;

  const avisos = secciones
    .filter((sec) => mensajes[sec.id])
    .flatMap((sec) => mensajes[sec.id].filter((m) => m.n === 'aviso').map((m) => `- **${sec.num} · ${sec.titulo}:** ${seguro(m.t)}`));

  const kw = parsearKeywords(s.keywords.texto);
  const autores = s.autores?.lista ?? [];
  const bloqueAutores = autores.length
    ? tabla(['Autor', 'Afiliación', 'Correo'], autores.map((a) => [
      `${a.nombre ?? ''}${a.correspondencia ? ' (correspondencia)' : ''}`,
      [a.departamento, a.universidad, [a.ciudad, a.pais].filter(Boolean).join(', ')].filter(Boolean).join(' — '),
      a.correo,
    ]))
    : PENDIENTE;

  return `# ${txt(s.titulo.texto)}

**Protocolo de investigación y esqueleto del manuscrito**

| Dato | Valor |
|---|---|
| Destino | ${destinoTxt} |
| Nivel académico | ${nivelAcadTxt} |
| Estilo de citación | ${p.citacion ?? '—'} |
| Idioma | ${({ es: 'Español', en: 'Inglés' })[p.idioma] ?? '—'} |
${s.autores?.grupo ? `| Grupo | ${seguro(s.autores.grupo)} |\n` : ''}| Generado | ${fecha} |

**Autores**

${bloqueAutores}

**Palabras clave:** ${kw.map((k) => seguro(k.es)).join('; ') || PENDIENTE}

**Keywords:** ${kw.map((k) => seguro(k.en)).join('; ') || PENDIENTE}

---

## 1. Planteamiento del problema

**Fenómeno observado.** ${txt(p.a1)}

**Evidencia.** ${txt(p.a2)}

**Afectados y consecuencias.** ${txt(p.a3)}

**Lo que se sabe y lo que falta.** ${txt(p.a5)}

**Recursos.** Laboratorio: ${({ si: 'sí', parcial: 'parcial', no: 'no' })[p.c1] ?? '—'} · Presupuesto y plazos: ${txt(p.c2)} · Tiempo: ${txt(p.c3)} · Software: ${txt(p.c4)}

## 2. Variables y operacionalización

${tabla(['Variable', 'Tipo', 'Indicador', 'Instrumento', 'Escala / unidad'], [
    [v.vi, 'Independiente', `Niveles: ${v.viNiveles ?? '—'}`, 'Control del proceso', 'Según niveles'],
    [v.vd, 'Dependiente', v.vd, `${v.instrumento ?? '—'}${v.resolucion ? ` (resolución ${v.resolucion})` : ''}`, v.unidad],
  ])}

**Umbral a afirmar:** ${txt(v.umbral)} ${seguro(v.unidad ?? '')} · **Variables intervinientes y control:** ${txt(v.intervinientes)}

## 3. Tipificación metodológica

${tabla(['Criterio', 'Elección'], d.combinaciones.orden.map((k) => [crit[k].label, lbl(k)]))}

**Implementación prevista.** ${txt(s.tipificacion.implementacion)}

## 4. Estado del arte

${papers.length ? tabla(['Ref.', 'Objetivo', 'Metodología', 'Resultados', 'Limitaciones', 'Aporte'],
    papers.map((pp, i) => [cita(i), pp.objetivo, pp.metodologia, pp.resultados,
      pp.limitaciones ? `${pp.limitaciones} (${pp.origenLim === 'inferida' ? 'inferida' : 'declarada'})` : '', pp.aporte])) : PENDIENTE}

**Tipo de vacío:** ${vacioTxt}

**Aporte.** ${txt(s.estadoArte.aporte)}

## 5. Cadena lógica

**Pregunta general.** ${txt(c.preguntaGeneral)}

**Preguntas específicas**

${numerada(lista(c.preguntasEsp))}

**Objetivo general.** ${txt(c.objetivoGeneral)}

**Objetivos específicos**

${numerada(objetivos)}

**Hipótesis de investigación (H₁).** ${txt(c.h1)}

**Hipótesis nula (H₀).** ${txt(c.h0)}
${lista(c.hEsp).length ? `\n**Hipótesis específicas**\n\n${numerada(lista(c.hEsp))}\n` : ''}
## 6. Matriz de consistencia

${tabla(COLUMNAS_MATRIZ.map(([, l]) => l), construirMatriz(s, d).map((f) => COLUMNAS_MATRIZ.map(([k]) => f[k])))}

## 7. Diseño experimental

${tabla(['Elemento', 'Definición'], [
    ['Arreglo', ARREGLOS[x.arreglo] ?? ''],
    ['Factores × niveles', x.factores || x.niveles ? `${x.factores ?? '—'} factores × ${x.niveles ?? '—'} niveles` : ''],
    ['Réplicas', x.replicas],
    ['Aleatorización', x.aleatorizacion ? 'Sí' : 'No'],
    ['Prueba piloto', x.piloto ? 'Sí' : 'No'],
    ['Materiales, equipo y herramientas', x.materiales],
    ['Población y muestra', x.muestra],
    ['Línea base', x.lineaBase],
    ['Norma aplicable', x.norma],
    ['Análisis de datos', x.analisis],
  ])}

**Procedimiento.** ${txt(x.procedimiento)}

---

## 8. Esqueleto del manuscrito (IMRaD)

### Introducción (estructura OCAR)

- **Apertura (O):** ${txt(p.a1)} ${vacio(p.a3) ? '' : seguro(p.a3.trim())}
- **Lo que se sabe:** sintetizar por temas —no artículo por artículo— los ${papers.length} trabajos de la matriz, señalando convergencias y contradicciones.
- **Lo que falta:** vacío ${vacioTxt.toLowerCase()}. ${txt(s.estadoArte.aporte)}
- **Desafío (C), último párrafo:** El objetivo de este trabajo es ${vacio(c.objetivoGeneral) ? PENDIENTE : seguro(c.objetivoGeneral.trim().replace(/^./, (m) => m.toLowerCase()))}${vacio(c.h1) ? '' : ` Se plantea que ${seguro(c.h1.trim().replace(/^./, (m) => m.toLowerCase()))}`}

### Materiales y métodos

${tipificacionFrase} La variable independiente, ${txt(v.vi)}, se varió en los niveles ${txt(v.viNiveles)}; la variable dependiente, ${txt(v.vd)} [${seguro(v.unidad ?? '—')}], se midió con ${txt(v.instrumento)}. Se empleó un diseño ${seguro((ARREGLOS[x.arreglo] ?? '—').toLowerCase())} con ${seguro(x.replicas ?? '—')} réplicas${x.aleatorizacion ? ' y orden aleatorizado' : ''}. ${vacio(x.norma) ? '' : `El ensayo siguió la norma ${seguro(x.norma)}. `}Análisis: ${txt(x.analisis)}

### Resultados — ${PENDIENTE}

Un subapartado por objetivo específico, en el mismo orden:

${numerada(objetivos)}

### Discusión — ${PENDIENTE}

D1 hallazgo principal · D2 mecanismo físico · D3 contraste con la literatura · D4 contraste de hipótesis · D5 implicación práctica.

### Conclusiones — ${PENDIENTE}

Una conclusión afirmativa por objetivo específico, en el mismo orden:

${objetivos.length ? objetivos.map((o, i) => `${i + 1}. _Responde a:_ ${seguro(o)}`).join('\n') : PENDIENTE}

### Resumen — ${PENDIENTE}

Se escribe al final: 150–250 palabras, un párrafo, con al menos dos resultados cuantificados.

---

## 9. Advertencias no corregidas

${avisos.length ? avisos.join('\n') : 'Ninguna.'}

## Referencias

${referencias(papers, estilo)}
`;
}

// Muestra el informe en pantalla con opciones de descarga e impresión.
export async function abrirInforme(md, nombreBase, alCerrar, crearPdf) {
  const { mdAHtml } = await import('./guia.js');
  const vista = document.getElementById('vista-informe');
  document.getElementById('informe-doc').innerHTML = mdAHtml(md);
  vista.hidden = false;
  document.body.classList.add('con-informe');

  const { descargar } = await import('./util.js');
  document.getElementById('inf-md').onclick = () => descargar(`${nombreBase}.md`, md, 'text/markdown');
  const btnPdf = document.getElementById('inf-pdf');
  const estadoPdf = document.getElementById('inf-estado');
  btnPdf.onclick = async () => {
    btnPdf.disabled = true;
    estadoPdf.textContent = 'Generando PDF…';
    try {
      const bytes = await crearPdf();
      descargar(`${nombreBase}.pdf`, bytes, 'application/pdf');
      estadoPdf.textContent = 'PDF descargado (con el proyecto adjunto).';
    } catch (err) {
      estadoPdf.textContent = `No se pudo generar el PDF: ${err.message}`;
    } finally {
      btnPdf.disabled = false;
    }
  };
  document.getElementById('inf-cerrar').onclick = () => {
    vista.hidden = true;
    document.body.classList.remove('con-informe');
    alCerrar?.();
  };
  document.getElementById('inf-cerrar').focus();
}
