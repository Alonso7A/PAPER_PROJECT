// Punto de entrada: define los recuadros, pinta los formularios, guarda el avance
// en el navegador y vuelve a validar en cada cambio.
import { escHtml, obtener, asignar, vacio, descargar } from './util.js';
import { validarTodo, estadoDe, sugerirTitulo, construirMatriz, COLUMNAS_MATRIZ, ARREGLOS, parsearKeywords } from './reglas.js';
import { cargarGuia, guiaHtml } from './guia.js';
import { montarEstadoArte } from './estado-arte.js';
import { generarMarkdown, abrirInforme } from './informe.js';
import { generarPdf } from './informe-pdf.js';

const CLAVE_ALMACEN = 'creacion-paper:v1';
const CLAVE_SECCION = 'creacion-paper:seccion';

// ───────────────────────────── Definición de recuadros ─────────────────────────────
// p = ruta en el estado · t = tipo de control · l = etiqueta · ph = ejemplo · o = opciones

function definirSecciones(d) {
  const crit = d.combinaciones.criterios;
  const opcionesVerbo = Object.fromEntries(
    Object.entries(d.verbos.verbos).map(([v, x]) => [v, `${v} — ${x.niveles.join(' / ')}`]),
  );
  return [
    {
      id: 'problema', num: 0, titulo: 'Problema y destino',
      intro: 'Define si hay investigación (bloque A), si es factible (bloque C) y en qué formato se publicará (bloque D).',
      guia: { fase: 0, h3: ['Bloque A', 'Bloque C', 'Bloque D', 'Regla de bloqueo'] },
      grupos: [
        { titulo: 'Bloque A — El problema', campos: [
          { p: 'problema.a1', t: 'textarea', l: 'A1. ¿Qué fenómeno técnico no funciona, no está optimizado o no se comprende?', ph: 'Ej.: Las piezas impresas en FDM de bajo costo presentan desviaciones dimensionales en agujeros de ajuste que impiden el ensamble sin mecanizado posterior.' },
          { p: 'problema.a2', t: 'textarea', l: 'A2. ¿Con qué dato, medición o evidencia respaldas que existe?', ph: 'Ej.: En 20 piezas de prueba se midió una desviación media de 0,32 mm frente a una tolerancia de ajuste de 0,10 mm.' },
          { p: 'problema.a3', t: 'textarea', l: 'A3. ¿A quién afecta y qué consecuencia tiene no resolverlo?' },
          { p: 'problema.a4', t: 'radio', l: 'A4. ¿Es un problema de conocimiento o una tarea de ingeniería?', o: {
            conocimiento: 'Problema de conocimiento: nadie lo ha medido o explicado',
            tarea: 'Tarea de ingeniería: hay que construir algo',
          } },
          { p: 'problema.a5', t: 'textarea', l: 'A5. ¿Qué se sabe ya sobre esto y qué sospechas que falta?' },
        ] },
        { titulo: 'Bloque C — Los recursos', campos: [
          { p: 'problema.c1', t: 'select', l: 'C1. ¿Tienes laboratorio, taller o acceso a los equipos?', o: { si: 'Sí, acceso completo', parcial: 'Parcial o por gestionar', no: 'No' } },
          { p: 'problema.c2', t: 'textarea', l: 'C2. Presupuesto y plazo de entrega de los componentes críticos', rows: 2 },
          { p: 'problema.c3', t: 'text', l: 'C3. Tiempo total disponible', ph: 'Ej.: 6 meses' },
          { p: 'problema.c4', t: 'text', l: 'C4. Software de análisis estadístico o de simulación', ph: 'Ej.: Minitab, Python (statsmodels), ANSYS' },
        ] },
        { titulo: 'Bloque D — El destino', campos: [
          { p: 'problema.destino', t: 'select', l: 'D1. Producto', o: { revista: 'Artículo de revista', congreso: 'Artículo de congreso', tesis: 'Tesis' } },
          { p: 'problema.nivelAcad', t: 'select', l: 'D2. Nivel académico', o: { bachiller: 'Bachiller', titulo: 'Título profesional', maestria: 'Maestría', doctorado: 'Doctorado' } },
          { p: 'problema.citacion', t: 'select', l: 'D3. Estilo de citación', o: { IEEE: 'IEEE', APA: 'APA', otro: 'Otro (se usará formato IEEE)' } },
          { p: 'problema.idioma', t: 'select', l: 'Idioma del manuscrito', o: { es: 'Español (con resumen también en inglés)', en: 'Inglés' } },
        ] },
      ],
    },
    {
      id: 'variables', num: 1, titulo: 'Variables',
      intro: 'Define si el estudio es medible: qué varías, qué mides, con qué instrumento y con qué resolución.',
      guia: { fase: 0, h3: ['Bloque B'] },
      grupos: [
        { campos: [
          { p: 'variables.vi', t: 'text', l: 'B1. Variable independiente (lo que vas a variar)', ph: 'Ej.: la velocidad de impresión' },
          { p: 'variables.viNiveles', t: 'text', l: 'B5. Niveles de la variable independiente (separados por coma)', ph: 'Ej.: 40, 60, 80 mm/s' },
          { p: 'variables.vd', t: 'text', l: 'B2. Variable dependiente (lo que vas a medir)', ph: 'Ej.: la desviación dimensional' },
          { p: 'variables.unidad', t: 'text', l: 'Unidad de la variable dependiente', ph: 'Ej.: mm' },
          { p: 'variables.instrumento', t: 'text', l: 'B3. Instrumento con que medirás la variable dependiente', ph: 'Ej.: micrómetro digital de exteriores' },
          { p: 'variables.resolucion', t: 'decimal', l: 'Resolución del instrumento (en la unidad de la VD)', ph: 'Ej.: 0,001' },
          { p: 'variables.umbral', t: 'decimal', l: 'Umbral o diferencia que quieres afirmar (misma unidad)', ph: 'Ej.: 0,05' },
          { p: 'variables.intervinientes', t: 'textarea', l: 'B4. Factores que pueden contaminar el resultado y cómo los controlarás', ph: 'Ej.: temperatura ambiente (sala a 22 ± 2 °C), humedad del filamento (secado 4 h a 50 °C)…' },
        ] },
      ],
    },
    {
      id: 'titulo', num: 2, titulo: 'Título',
      intro: 'Cinco componentes: verbo rector, variable dependiente, variable independiente, contexto y condición.',
      guia: { fase: 1 },
      grupos: [
        { custom: 'componentesTitulo' },
        { campos: [
          { p: 'titulo.verbo', t: 'select', l: 'Verbo rector (determina el nivel)', o: opcionesVerbo },
          { p: 'titulo.contexto', t: 'text', l: 'Contexto: el sistema concreto', ph: 'Ej.: una impresora 3D FDM cartesiana de bajo costo' },
          { p: 'titulo.condicion', t: 'text', l: 'Condición', ph: 'Ej.: impresión con PLA a 210 °C' },
          { p: 'titulo.texto', t: 'textarea', rows: 3, l: 'Título redactado', ayuda: (s) => (s.problema.destino === 'tesis'
            ? 'Forma de tesis: [Verbo] + [VD] + “en función de” + [VI] + “en” [contexto] + “bajo” [condición]. Hasta 30 palabras.'
            : 'Forma de revista: sintagma nominal, p. ej. “Efecto de [VI] sobre [VD] en [contexto]”. 12 a 18 palabras.') },
        ] },
      ],
    },
    {
      id: 'keywords', num: 3, titulo: 'Palabras clave',
      intro: 'No resumen el título: son el mecanismo por el que otros encontrarán tu artículo.',
      guia: { fase: 2 },
      grupos: [
        { campos: [
          { p: 'keywords.texto', t: 'textarea', rows: 6, l: 'Una por línea, con el formato: español | inglés',
            ph: 'velocidad de impresión | printing speed\nexactitud dimensional | dimensional accuracy\nmodelado por deposición fundida | fused deposition modeling\nácido poliláctico | polylactic acid\nmanufactura aditiva | additive manufacturing' },
        ] },
      ],
    },
    {
      id: 'tipificacion', num: 4, titulo: 'Tipificación e implementación',
      intro: 'Declara los seis criterios de Casquero y describe cómo lo implementarás: la página verifica que ambos sean coherentes.',
      guia: { fase: 3 },
      grupos: [
        { titulo: 'Los seis criterios', campos: d.combinaciones.orden.map((k) => ({ p: `tipificacion.${k}`, t: 'select', l: crit[k].label, o: crit[k].opciones })) },
        { titulo: 'Implementación', campos: [
          { p: 'tipificacion.implementacion', t: 'textarea', rows: 4, l: '¿Cómo lo vas a implementar? Qué harás, con qué equipo y cómo medirás.',
            ph: 'Ej.: Imprimiré probetas con tres velocidades (40, 60, 80 mm/s) manteniendo fijos los demás parámetros, y mediré la desviación de cada agujero con micrómetro…' },
        ] },
      ],
    },
    {
      id: 'estadoArte', num: 5, titulo: 'Estado del arte',
      intro: 'Una síntesis crítica comparada que termina detectando un vacío. Agrega papers por búsqueda, PDF, .bib/.ris o DOI.',
      guia: { fase: 4 },
      grupos: [
        { custom: 'estadoArte' },
        { titulo: 'Vacío y aporte', campos: [
          { p: 'estadoArte.vacio', t: 'select', l: 'Tipo de vacío', o: {
            evidencia: 'De evidencia — nadie lo midió',
            metodologico: 'Metodológico — se hizo, pero con método débil',
            contexto: 'De contexto — no se probó en este escenario',
            articulacion: 'De articulación — dominios estudiados por separado',
            practico: 'Práctico — existe en teoría, sin implementación',
          } },
          { p: 'estadoArte.aporte', t: 'textarea', l: 'Redacción del aporte',
            ph: 'A diferencia de los trabajos previos, que […], el presente trabajo […], lo que permite […].' },
        ] },
      ],
    },
    {
      id: 'cadena', num: 6, titulo: 'Cadena lógica',
      intro: 'El objetivo general responde a la pregunta general; la hipótesis es su respuesta tentativa; cada pregunta específica tiene su objetivo.',
      guia: { fase: 5 },
      grupos: [
        { titulo: 'Preguntas', campos: [
          { p: 'cadena.preguntaGeneral', t: 'textarea', rows: 2, l: 'Pregunta general', ph: '¿De qué manera [VI] influye en [VD] en el contexto de [sistema]?' },
          { p: 'cadena.preguntasEsp', t: 'textarea', rows: 4, l: 'Preguntas específicas (una por línea, entre 3 y 5)' },
        ] },
        { titulo: 'Objetivos', campos: [
          { p: 'cadena.objetivoGeneral', t: 'textarea', rows: 2, l: 'Objetivo general (la pregunta general convertida en acción)' },
          { p: 'cadena.objetivosEsp', t: 'textarea', rows: 4, l: 'Objetivos específicos (uno por línea, mismo orden que las preguntas)' },
        ] },
        { titulo: 'Hipótesis', campos: [
          { p: 'cadena.h1', t: 'textarea', rows: 2, l: 'Hipótesis de investigación (H₁)', ph: 'Si [manipulo la VI], entonces [efecto en la VD, con umbral], siempre que [condiciones].' },
          { p: 'cadena.h0', t: 'textarea', rows: 2, l: 'Hipótesis nula (H₀)' },
          { p: 'cadena.hEsp', t: 'textarea', rows: 3, l: 'Hipótesis específicas (opcional, una por línea y por objetivo)' },
        ] },
      ],
    },
    {
      id: 'matriz', num: 7, titulo: 'Matriz de consistencia',
      intro: 'Se genera sola con los recuadros 1, 4, 6 y 8. Si una fila no cierra, ahí está la incoherencia.',
      guia: { fase: 6 },
      grupos: [{ custom: 'matriz' }],
    },
    {
      id: 'diseno', num: 8, titulo: 'Diseño experimental',
      intro: 'Arreglo, réplicas, línea base y procedimiento replicable.',
      guia: { fase: 7 },
      grupos: [
        { titulo: 'Arreglo', campos: [
          { p: 'diseno.arreglo', t: 'select', l: 'Arreglo experimental', o: ARREGLOS },
          { p: 'diseno.factores', t: 'decimal', l: 'Número de factores', ph: 'Ej.: 3' },
          { p: 'diseno.niveles', t: 'decimal', l: 'Niveles por factor', ph: 'Ej.: 3' },
          { p: 'diseno.replicas', t: 'decimal', l: 'Réplicas', ph: 'Ej.: 3' },
          { p: 'diseno.aleatorizacion', t: 'checkbox', l: 'El orden de las corridas será aleatorizado' },
          { p: 'diseno.piloto', t: 'checkbox', l: 'Haré una prueba piloto de 2 o 3 corridas' },
        ] },
        { titulo: 'Ejecución', campos: [
          { p: 'diseno.materiales', t: 'textarea', l: 'Materiales, equipo y herramientas', ph: 'Ej.: filamento PLA 1,75 mm, mismo lote; impresora …; boquilla de 0,4 mm…' },
          { p: 'diseno.muestra', t: 'textarea', rows: 2, l: 'Población y muestra (con justificación del tamaño)' },
          { p: 'diseno.lineaBase', t: 'textarea', rows: 2, l: 'Línea base: medición de la condición de referencia' },
          { p: 'diseno.procedimiento', t: 'textarea', rows: 5, l: 'Procedimiento paso a paso (replicable)' },
          { p: 'diseno.norma', t: 'text', l: 'Norma de ensayo aplicable', ph: 'Ej.: ISO 2768-1, ASTM D638' },
          { p: 'diseno.analisis', t: 'textarea', rows: 2, l: 'Análisis de datos: pruebas, nivel de significancia y software', ph: 'Ej.: ANOVA de un factor, α = 0,05, verificación de supuestos (Shapiro-Wilk, Levene), Minitab 21.' },
        ] },
      ],
    },
    {
      id: 'autores', num: 9, titulo: 'Autores',
      intro: 'Datos de cada miembro tal como aparecerán bajo el título: nombre, departamento, universidad, ciudad y país, y correo. El orden importa: primero quien ejecutó el trabajo, al final el asesor.',
      guia: { fase: 11, h3: ['Secciones administrativas'] },
      grupos: [
        { custom: 'autores' },
        { titulo: 'Datos complementarios', campos: [
          { p: 'autores.grupo', t: 'text', l: 'Grupo o proyecto de investigación (opcional)', ph: 'Ej.: GMIDEI' },
          { p: 'autores.agradecimientos', t: 'textarea', rows: 2, l: 'Agradecimientos y financiamiento (opcional)', ph: 'Ej.: Este trabajo fue financiado por … Los autores agradecen a …' },
        ] },
      ],
    },
    {
      id: 'informe', num: 10, titulo: 'Informe', esInforme: true,
      intro: 'Cuando ningún recuadro esté en rojo, genera el protocolo y el esqueleto IMRaD del paper.',
      guia: { titulos: ['Andamiaje interno vs. manuscrito publicado', 'Checklist final'] },
      grupos: [{ custom: 'informe' }],
    },
  ];
}

// ─────────────────────────────────── Estado ───────────────────────────────────

const estadoInicial = () => ({
  version: 1,
  problema: {}, variables: {}, titulo: {}, keywords: {}, tipificacion: {},
  estadoArte: { papers: [] }, cadena: {}, diseno: {}, autores: { lista: [] },
});

// Completa las partes que falten (proyectos guardados con versiones anteriores de la página)
// y descarta el bloque _export, que solo existe en los archivos exportados.
function normalizar(obj) {
  const { _export, ...resto } = obj;
  const e = { ...estadoInicial(), ...resto };
  e.estadoArte = { papers: [], ...e.estadoArte };
  e.autores = { lista: [], ...e.autores };
  return e;
}

function cargarEstado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_ALMACEN));
    if (guardado?.version === 1) return normalizar(guardado);
  } catch { /* almacenamiento no disponible o dañado */ }
  return estadoInicial();
}

let estado = cargarEstado();
let datos, secciones, mensajes = {}, actual;
let temporizador;

function guardar() {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(estado));
      marcarGuardado('Guardado');
    } catch {
      marcarGuardado('No se pudo guardar en este navegador: exporta el JSON', true);
    }
  }, 400);
  marcarGuardado('Guardando…');
}

function marcarGuardado(texto, error = false) {
  const el = document.getElementById('guardado');
  el.textContent = texto;
  el.classList.toggle('error', error);
}

const camposDe = (sec) => sec.grupos.flatMap((g) => g.campos ?? []);

function seccionVacia(sec) {
  if (sec.id === 'matriz') return vacio(estado.cadena.preguntasEsp);
  const sinCampos = camposDe(sec).every((c) => vacio(obtener(estado, c.p)) || obtener(estado, c.p) === false);
  if (sec.id === 'estadoArte') return sinCampos && !estado.estadoArte.papers.length;
  if (sec.id === 'autores') return sinCampos && !estado.autores.lista.length;
  return sinCampos;
}

const estadoSeccion = (sec) => (sec.esInforme ? null : estadoDe(mensajes[sec.id] ?? [], seccionVacia(sec)));
const informeHabilitado = () => secciones.filter((s) => !s.esInforme).every((s) => ['ok', 'aviso'].includes(estadoSeccion(s)));

// ─────────────────────────────────── Render ───────────────────────────────────

const ICONO = { pendiente: '○', error: '✕', aviso: '!', ok: '✓' };
const TEXTO_ESTADO = { pendiente: 'Pendiente', error: 'Con errores', aviso: 'Con advertencias', ok: 'Completo' };

function pintarLateral() {
  const ol = document.getElementById('lista-secciones');
  ol.innerHTML = secciones.map((s) => {
    const st = s.esInforme ? (informeHabilitado() ? 'ok' : 'pendiente') : estadoSeccion(s);
    return `<li>
      <a href="#${s.id}" class="${s.id === actual ? 'activa' : ''}" data-estado="${st}" ${s.id === actual ? 'aria-current="step"' : ''}>
        <span class="icono" aria-hidden="true">${s.esInforme ? '▤' : ICONO[st]}</span>
        <span class="num">${s.num}</span>
        <span class="nom">${escHtml(s.titulo)}</span>
        <span class="sr">${s.esInforme ? '' : TEXTO_ESTADO[st]}</span>
      </a></li>`;
  }).join('');
  const completos = secciones.filter((s) => !s.esInforme && estadoSeccion(s) !== 'pendiente' && estadoSeccion(s) !== 'error').length;
  const total = secciones.length - 1;
  document.getElementById('progreso-texto').textContent = `${completos} de ${total} recuadros sin errores`;
  document.getElementById('progreso-barra').style.width = `${(completos / total) * 100}%`;
}

function controlHtml(c) {
  const id = `f-${c.p.replace('.', '-')}`;
  const ph = c.ph ? ` placeholder="${escHtml(c.ph)}"` : '';
  switch (c.t) {
    case 'textarea':
      return `<textarea id="${id}" data-p="${c.p}" rows="${c.rows ?? 3}"${ph}></textarea>`;
    case 'select':
      return `<select id="${id}" data-p="${c.p}"><option value="">— Elige —</option>${
        Object.entries(c.o).map(([v, l]) => `<option value="${escHtml(v)}">${escHtml(l)}</option>`).join('')}</select>`;
    case 'radio':
      return `<div class="radios" role="radiogroup" aria-labelledby="${id}-l">${
        Object.entries(c.o).map(([v, l]) => `<label class="check"><input type="radio" name="${id}" value="${escHtml(v)}" data-p="${c.p}"> ${escHtml(l)}</label>`).join('')}</div>`;
    case 'checkbox':
      return `<label class="check"><input type="checkbox" id="${id}" data-p="${c.p}"> ${escHtml(c.l)}</label>`;
    case 'decimal':
      return `<input type="text" inputmode="decimal" id="${id}" data-p="${c.p}"${ph}>`;
    default:
      return `<input type="text" id="${id}" data-p="${c.p}"${ph}>`;
  }
}

function campoHtml(c) {
  const id = `f-${c.p.replace('.', '-')}`;
  const ayuda = typeof c.ayuda === 'function' ? c.ayuda(estado) : c.ayuda;
  const etiqueta = c.t === 'checkbox' ? '' : c.t === 'radio'
    ? `<span class="etq" id="${id}-l">${escHtml(c.l)}</span>`
    : `<label class="etq" for="${id}">${escHtml(c.l)}</label>`;
  return `<div class="campo" data-campo="${c.p}">
    ${etiqueta}
    ${ayuda ? `<p class="ayuda">${escHtml(ayuda)}</p>` : ''}
    ${controlHtml(c)}
    <ul class="msgs" data-msgs="${c.p}"></ul>
  </div>`;
}

function mostrarSeccion(id) {
  const sec = secciones.find((s) => s.id === id) ?? secciones[0];
  actual = sec.id;
  try { localStorage.setItem(CLAVE_SECCION, actual); } catch { /* opcional */ }

  const guia = guiaHtml(sec.guia);
  const i = secciones.indexOf(sec);
  const main = document.getElementById('contenido');
  main.innerHTML = `
    <section class="recuadro" aria-labelledby="titulo-seccion">
      <header class="recuadro-cab">
        <p class="paso">Recuadro ${sec.num} de ${secciones.length - 1}</p>
        <h2 id="titulo-seccion">${escHtml(sec.titulo)}</h2>
        <p class="intro">${escHtml(sec.intro)}</p>
      </header>
      <details class="guia">
        <summary>Guía de esta fase <span>(de paper-cientifico-ingenieria.md)</span></summary>
        <div class="guia-cuerpo">${guia ?? '<p>No se pudo cargar la guía. Si abriste el archivo con doble clic, usa un servidor local: <code>python3 -m http.server</code>.</p>'}</div>
      </details>
      <div class="estado-recuadro" id="estado-recuadro" role="status" aria-live="polite"></div>
      ${sec.grupos.map((g) => (g.custom
        ? `<div class="grupo custom" data-custom="${g.custom}"></div>`
        : `<fieldset class="grupo">${g.titulo ? `<legend>${escHtml(g.titulo)}</legend>` : ''}${g.campos.map(campoHtml).join('')}</fieldset>`)).join('')}
      <nav class="pasos" aria-label="Navegación entre recuadros">
        ${i > 0 ? `<a class="btn sec" href="#${secciones[i - 1].id}">← ${escHtml(secciones[i - 1].titulo)}</a>` : '<span></span>'}
        ${i < secciones.length - 1 ? `<a class="btn" href="#${secciones[i + 1].id}">${escHtml(secciones[i + 1].titulo)} →</a>` : ''}
      </nav>
    </section>`;

  for (const el of main.querySelectorAll('[data-p]')) {
    const v = obtener(estado, el.dataset.p);
    if (el.type === 'checkbox') el.checked = !!v;
    else if (el.type === 'radio') el.checked = el.value === v;
    else el.value = v ?? '';
  }
  for (const el of main.querySelectorAll('[data-custom]')) montarCustom(el.dataset.custom, el);

  pintarLateral();
  pintarMensajes();
  document.getElementById('lateral').classList.remove('abierto');
  main.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

function pintarMensajes() {
  const sec = secciones.find((s) => s.id === actual);
  const main = document.getElementById('contenido');
  for (const ul of main.querySelectorAll('[data-msgs]')) ul.innerHTML = '';
  const cab = document.getElementById('estado-recuadro');
  if (!cab || sec.esInforme) {
    if (sec.esInforme) pintarInformeCustom();
    return;
  }
  const st = estadoSeccion(sec);
  const lista = mensajes[sec.id] ?? [];
  const li = (m) => `<li class="msg ${m.n}">${escHtml(m.t)}</li>`;

  if (st === 'pendiente') {
    cab.dataset.estado = 'pendiente';
    cab.innerHTML = '<p>Completa los campos: se validan mientras escribes.</p>';
    return;
  }
  const sueltos = [];
  for (const m of lista) {
    const ul = m.c && main.querySelector(`[data-msgs="${m.c}"]`);
    if (ul) ul.insertAdjacentHTML('beforeend', li(m));
    else sueltos.push(m);
  }
  const errores = lista.filter((m) => m.n === 'error').length;
  const avisos = lista.filter((m) => m.n === 'aviso').length;
  const resumen = { error: `${errores} error(es) por corregir`, aviso: `Sin errores · ${avisos} advertencia(s)`, ok: 'Recuadro completo' }[st];
  cab.dataset.estado = st;
  cab.innerHTML = `<p class="resumen-st"><span class="icono">${ICONO[st]}</span> ${resumen}</p>${sueltos.length ? `<ul class="msgs">${sueltos.map(li).join('')}</ul>` : ''}`;
  if (actual === 'matriz') pintarMatriz(main.querySelector('[data-custom="matriz"]'));
}

function revalidar() {
  mensajes = validarTodo(estado, datos);
  pintarLateral();
  pintarMensajes();
}

// ─────────────────────────────── Bloques especiales ───────────────────────────────

function montarCustom(tipo, el) {
  if (tipo === 'componentesTitulo') {
    const v = estado.variables;
    el.innerHTML = `
      <div class="componentes">
        <p><span class="etiqueta-comp">VD</span> ${v.vd ? escHtml(v.vd) : '<em>completa el recuadro 1</em>'}${v.unidad ? ` [${escHtml(v.unidad)}]` : ''}</p>
        <p><span class="etiqueta-comp">VI</span> ${v.vi ? escHtml(v.vi) : '<em>completa el recuadro 1</em>'}</p>
        <button type="button" class="sec" id="btn-sugerir">Proponer título con mis componentes</button>
        <p class="ayuda" id="sugerencia-msg"></p>
      </div>`;
    el.querySelector('#btn-sugerir').addEventListener('click', () => {
      const t = sugerirTitulo(estado, datos);
      if (!t) {
        el.querySelector('#sugerencia-msg').textContent = 'Primero completa la VD y la VI (recuadro 1), el verbo rector y el contexto.';
        return;
      }
      estado.titulo.texto = t;
      document.querySelector('[data-p="titulo.texto"]').value = t;
      el.querySelector('#sugerencia-msg').textContent = 'Propuesta insertada. Ajústala a tu redacción.';
      guardar();
      revalidar();
    });
  } else if (tipo === 'estadoArte') {
    montarEstadoArte(el, {
      estado: () => estado,
      cambiado: () => { guardar(); revalidar(); },
      minimo: () => ({ congreso: 10, revista: 25, tesis: 25 })[estado.problema.destino] ?? 25,
      consultaSugerida: () => parsearKeywords(estado.keywords.texto).map((k) => k.en).filter(Boolean).slice(0, 3).join(' '),
    });
  } else if (tipo === 'matriz') {
    pintarMatriz(el);
  } else if (tipo === 'informe') {
    pintarInformeCustom();
  } else if (tipo === 'autores') {
    montarAutores(el);
  }
}

// ── Autores: una tarjeta por miembro, en el orden en que aparecerán en el paper ──
const CAMPOS_AUTOR = [
  ['nombre', 'Nombre completo', 'Ej.: Ana Torres Quispe'],
  ['departamento', 'Departamento o facultad', 'Ej.: Facultad de Ingeniería Mecánica'],
  ['universidad', 'Universidad o institución', 'Ej.: Universidad Nacional de Ingeniería'],
  ['ciudad', 'Ciudad', 'Ej.: Lima'],
  ['pais', 'País', 'Ej.: Perú'],
  ['correo', 'Correo electrónico', 'Ej.: ana.torres@uni.pe'],
  ['orcid', 'ORCID (opcional)', '0000-0000-0000-0000'],
];

function montarAutores(el) {
  const lista = () => estado.autores.lista;
  const cambio = () => { guardar(); revalidar(); };

  function pintar() {
    el.innerHTML = `
      ${lista().map((a, i) => `
        <div class="autor" data-i="${i}">
          <div class="autor-cab">
            <strong>Autor ${i + 1}${i === 0 ? ' · primer autor' : ''}</strong>
            <div class="autor-acciones">
              <button type="button" class="sec" data-accion="subir" ${i === 0 ? 'disabled' : ''} aria-label="Subir autor ${i + 1}">↑</button>
              <button type="button" class="sec" data-accion="bajar" ${i === lista().length - 1 ? 'disabled' : ''} aria-label="Bajar autor ${i + 1}">↓</button>
              <button type="button" class="peligro" data-accion="quitar">Quitar</button>
            </div>
          </div>
          <div class="grid-2">
            ${CAMPOS_AUTOR.map(([k, l, ph]) => `
              <label class="campo-mini">${l}<input data-ac="${k}" value="${escHtml(a[k])}" placeholder="${escHtml(ph)}"></label>`).join('')}
          </div>
          <label class="check"><input type="radio" name="correspondencia" data-ac="correspondencia" ${a.correspondencia ? 'checked' : ''}> Autor de correspondencia</label>
        </div>`).join('')}
      <button type="button" id="btn-agregar-autor">+ Agregar autor</button>
      <p class="ayuda">Vista previa del bloque de autores (así aparecerá bajo el título del paper):</p>
      <div class="vista-autores">${htmlVista()}</div>`;
  }

  const htmlVista = () => lista().filter((a) => a.nombre).map((a) => `
    <div class="bloque-autor">
      <strong>${escHtml(a.nombre)}${a.correspondencia ? '*' : ''}</strong>
      <span>${escHtml(a.departamento)}</span>
      <span>${escHtml(a.universidad)}</span>
      <span>${escHtml([a.ciudad, a.pais].filter(Boolean).join(', '))}</span>
      <span>${escHtml(a.correo)}</span>
    </div>`).join('') || '<p class="ayuda">Aún no hay autores con nombre.</p>';

  el.addEventListener('input', (e) => {
    const k = e.target.dataset.ac;
    const i = Number(e.target.closest('.autor')?.dataset.i);
    if (!k || Number.isNaN(i)) return;
    if (k === 'correspondencia') lista().forEach((a, j) => { a.correspondencia = j === i; });
    else lista()[i][k] = e.target.value;
    cambio();
    el.querySelector('.vista-autores').innerHTML = htmlVista();
  });
  el.addEventListener('change', (e) => {
    if (e.target.dataset.ac === 'correspondencia') e.target.dispatchEvent(new Event('input', { bubbles: true }));
  });
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.id === 'btn-agregar-autor') {
      lista().push({ correspondencia: lista().length === 0 });
    } else {
      const i = Number(btn.closest('.autor')?.dataset.i);
      const l = lista();
      if (btn.dataset.accion === 'quitar') {
        if (!confirm(`¿Quitar a ${l[i].nombre || `el autor ${i + 1}`}?`)) return;
        l.splice(i, 1);
      } else if (btn.dataset.accion === 'subir') [l[i - 1], l[i]] = [l[i], l[i - 1]];
      else if (btn.dataset.accion === 'bajar') [l[i + 1], l[i]] = [l[i], l[i + 1]];
      else return;
    }
    cambio();
    pintar();
  });

  pintar();
}

function pintarMatriz(el) {
  const filas = construirMatriz(estado, datos);
  el.innerHTML = filas.length
    ? `<div class="tabla-scroll"><table class="matriz">
        <thead><tr>${COLUMNAS_MATRIZ.map(([, l]) => `<th scope="col">${l}</th>`).join('')}</tr></thead>
        <tbody>${filas.map((f) => `<tr>${COLUMNAS_MATRIZ.map(([k]) => `<td class="${vacio(f[k]) ? 'falta' : ''}">${vacio(f[k]) ? 'Falta' : escHtml(f[k])}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`
    : '<p class="vacio-matriz">Aún no hay filas: escribe las preguntas específicas en el recuadro 6.</p>';
}

function pintarInformeCustom() {
  const el = document.querySelector('[data-custom="informe"]');
  if (!el) return;
  const habil = informeHabilitado();
  el.innerHTML = `
    <ul class="lista-estados">
      ${secciones.filter((s) => !s.esInforme).map((s) => {
        const st = estadoSeccion(s);
        const primerError = (mensajes[s.id] ?? []).find((m) => m.n === 'error');
        return `<li data-estado="${st}"><a href="#${s.id}"><span class="icono">${ICONO[st]}</span> ${s.num} · ${escHtml(s.titulo)}</a>
          <span class="detalle">${st === 'error' && primerError ? escHtml(primerError.t) : TEXTO_ESTADO[st]}</span></li>`;
      }).join('')}
    </ul>
    <div class="acciones-informe">
      <button type="button" id="btn-informe" ${habil ? '' : 'disabled'}>Generar informe</button>
      <p class="ayuda">${habil
        ? 'Muestra el informe y permite descargarlo en PDF. El PDF lleva adjunto el proyecto completo (JSON) para la skill paper_proyectos_GMIDEI.'
        : 'Se habilita cuando ningún recuadro está pendiente ni en rojo.'}</p>
    </div>`;
  el.querySelector('#btn-informe').addEventListener('click', () => {
    const md = generarMarkdown(estado, datos, mensajes, secciones);
    const fecha = new Date().toISOString().slice(0, 10);
    abrirInforme(md, `informe-paper-${fecha}`, () => document.getElementById('btn-informe')?.focus(),
      () => generarPdf(estado, datos, bloqueExport()));
  });
}

// ───────────────────────────── Acciones globales ─────────────────────────────

// El bloque _export resume la validación y traduce los códigos a texto legible.
// Lo usa la skill paper_proyectos_GMIDEI; la página lo ignora al importar.
function bloqueExport() {
  const crit = datos.combinaciones.criterios;
  const t = estado.tipificacion;
  const recuadros = Object.fromEntries(secciones.filter((s) => !s.esInforme).map((s) => {
    const msgs = mensajes[s.id] ?? [];
    return [s.id, {
      numero: s.num,
      titulo: s.titulo,
      estado: estadoSeccion(s),
      errores: msgs.filter((m) => m.n === 'error').map((m) => m.t),
      advertencias: msgs.filter((m) => m.n === 'aviso').map((m) => m.t),
    }];
  }));
  const verbo = datos.verbos.verbos[estado.titulo.verbo];
  return {
    formato: 'creacion-paper',
    version: 1,
    exportado: new Date().toISOString(),
    completo: informeHabilitado(),
    recuadros,
    etiquetas: {
      tipificacion: Object.fromEntries(datos.combinaciones.orden.map((k) => [k, t[k] ? crit[k].opciones[t[k]] : null])),
      verboRector: verbo ? { verbo: estado.titulo.verbo, niveles: verbo.niveles, nominal: verbo.nominal } : null,
      arreglo: ARREGLOS[estado.diseno.arreglo] ?? null,
      vacio: estado.estadoArte.vacio ?? null,
    },
    matrizConsistencia: construirMatriz(estado, datos),
  };
}

function exportar() {
  const fecha = new Date().toISOString().slice(0, 10);
  const salida = { ...estado, _export: bloqueExport() };
  descargar(`proyecto-paper-${fecha}.json`, JSON.stringify(salida, null, 2), 'application/json');
}

async function importar(archivo) {
  try {
    const nuevo = JSON.parse(await archivo.text());
    if (nuevo?.version !== 1) throw new Error('no es un proyecto de esta página');
    if (!confirm('Esto reemplazará el proyecto actual. ¿Continuar?')) return;
    estado = normalizar(nuevo);
    guardar();
    revalidar();
    mostrarSeccion(actual);
  } catch (err) {
    alert(`No se pudo importar: ${err.message}`);
  }
}

function reiniciar() {
  if (!confirm('Se borrará todo el proyecto de este navegador. Exporta antes el JSON si lo quieres conservar. ¿Continuar?')) return;
  estado = estadoInicial();
  guardar();
  revalidar();
  location.hash = 'problema';
  mostrarSeccion('problema');
}

function enlazarEventos() {
  const main = document.getElementById('contenido');
  const alCambiar = (e) => {
    const el = e.target;
    if (!el.dataset.p) return;
    const valor = el.type === 'checkbox' ? el.checked : el.value;
    asignar(estado, el.dataset.p, valor);
    guardar();
    revalidar();
  };
  main.addEventListener('input', alCambiar);
  main.addEventListener('change', (e) => { if (['radio', 'checkbox'].includes(e.target.type) || e.target.tagName === 'SELECT') alCambiar(e); });

  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (secciones.some((s) => s.id === id)) mostrarSeccion(id);
  });
  document.getElementById('btn-exportar').addEventListener('click', exportar);
  document.getElementById('btn-importar').addEventListener('click', () => document.getElementById('archivo-importar').click());
  document.getElementById('archivo-importar').addEventListener('change', (e) => {
    if (e.target.files[0]) importar(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('btn-reiniciar').addEventListener('click', reiniciar);
  document.getElementById('btn-menu').addEventListener('click', () => {
    const lat = document.getElementById('lateral');
    lat.classList.toggle('abierto');
    document.getElementById('btn-menu').setAttribute('aria-expanded', lat.classList.contains('abierto'));
  });
}

// ─────────────────────────────────── Inicio ───────────────────────────────────

async function iniciar() {
  try {
    const [verbos, combinaciones] = await Promise.all([
      fetch('data/verbos.json').then((r) => r.json()),
      fetch('data/combinaciones.json').then((r) => r.json()),
    ]);
    datos = { verbos, combinaciones };
  } catch {
    document.getElementById('contenido').innerHTML = `
      <div class="error-carga">
        <h2>No se pudieron cargar los datos</h2>
        <p>Si abriste <code>index.html</code> con doble clic, el navegador bloquea la lectura de archivos.
        Abre una terminal en la carpeta y ejecuta <code>python3 -m http.server 8000</code>; luego entra a
        <code>http://localhost:8000</code>.</p>
      </div>`;
    return;
  }
  try {
    await cargarGuia();
  } catch (err) {
    console.warn(err);
  }

  secciones = definirSecciones(datos);
  mensajes = validarTodo(estado, datos);
  enlazarEventos();

  let inicial = location.hash.slice(1);
  if (!secciones.some((s) => s.id === inicial)) {
    try { inicial = localStorage.getItem(CLAVE_SECCION) ?? 'problema'; } catch { inicial = 'problema'; }
  }
  mostrarSeccion(inicial);
  marcarGuardado('Guardado en este navegador');
}

iniciar();
