// Validaciones de cada recuadro. Cada regla sale de docs/paper-cientifico-ingenieria.md;
// si cambias una regla allí, cámbiala también aquí.
//
// Cada validador devuelve una lista de mensajes { n, c, t }:
//   n = 'error' (bloquea) | 'aviso' (aconseja) | 'ok' | 'info'
//   c = ruta del campo al que se refiere (o null → resumen del recuadro)
//   t = texto del mensaje
import {
  norm, palabras, vacio, lista, numero, capitalizar, contarPalabras, cobertura, significativas,
} from './util.js';

const E = (t, c = null) => ({ n: 'error', c, t });
const A = (t, c = null) => ({ n: 'aviso', c, t });
const OK = (t, c = null) => ({ n: 'ok', c, t });
const I = (t, c = null) => ({ n: 'info', c, t });

const MIN_REFERENCIAS = { congreso: 10, revista: 25, tesis: 25 };
const DESTINO_TXT = { congreso: 'un artículo de congreso', revista: 'un artículo de revista', tesis: 'una tesis' };

const CONTEXTOS_GENERICOS = [
  'industria', 'la industria', 'ingenieria', 'la ingenieria', 'sistema', 'sistemas', 'un sistema', 'el sistema',
  'empresa', 'la empresa', 'empresas', 'maquinas', 'las maquinas', 'la mineria', 'mineria', 'procesos',
  'el peru', 'peru', 'la manufactura', 'manufactura', 'la construccion',
];
const KEYWORDS_GENERICAS = [
  'ingenieria', 'tecnologia', 'ciencia', 'investigacion', 'sistema', 'sistemas', 'innovacion', 'industria',
  'engineering', 'technology', 'science', 'research', 'system', 'systems', 'innovation', 'industry',
];

const esInfinitivo = (w) => /(ar|er|ir)(se)?$/.test(w);

// ─────────────────────────── 0 · Problema y destino ───────────────────────────
function vProblema(s) {
  const p = s.problema, m = [];
  if (vacio(p.a1)) m.push(E('Describe el fenómeno técnico que falla, no está optimizado o no se comprende.', 'problema.a1'));
  else if (p.a1.trim().length < 40) m.push(A('Demasiado breve: nombra el sistema, qué falla y en qué condición.', 'problema.a1'));

  if (vacio(p.a2)) m.push(E('Sin evidencia no hay problema demostrado. Cita un dato, una medición o un reporte.', 'problema.a2'));
  else if (!/\d/.test(p.a2)) m.push(A('La evidencia suele llevar un número (medición, porcentaje, costo, frecuencia). Añádelo si lo tienes.', 'problema.a2'));

  if (vacio(p.a3)) m.push(E('Indica a quién afecta y qué consecuencia tiene no resolverlo.', 'problema.a3'));

  if (vacio(p.a4)) m.push(E('Decide si es un problema de conocimiento o una tarea de ingeniería.', 'problema.a4'));
  else if (p.a4 === 'tarea') {
    m.push(E('“Construir X” no es un problema de investigación. Reformula A1 como brecha: “no existe evidencia de que [solución] alcance [desempeño medible] en [sistema]”. Cuando lo hayas reformulado, marca “problema de conocimiento”.', 'problema.a4'));
  } else m.push(OK('Planteado como problema de conocimiento.', 'problema.a4'));

  if (vacio(p.a5)) m.push(A('Resume qué se sabe y qué sospechas que falta: es la semilla del vacío de conocimiento (recuadro 5).', 'problema.a5'));

  const faltanC = ['c1', 'c2', 'c3', 'c4'].filter((k) => vacio(p[k]));
  if (faltanC.length) {
    m.push(A(`Faltan datos de recursos (${faltanC.map((k) => k.toUpperCase()).join(', ')}). Puedes avanzar, pero el diseño experimental (recuadro 8) quedará bloqueado.`));
  }
  if (p.c1 === 'no') m.push(A('Sin laboratorio ni acceso a equipos, un diseño experimental no es factible (filtro 4).', 'problema.c1'));

  if (vacio(p.destino)) m.push(E('Elige el destino: define la forma del título y el número de referencias.', 'problema.destino'));
  if (vacio(p.nivelAcad)) m.push(E('Elige el nivel académico (filtro 9 de acotación).', 'problema.nivelAcad'));
  if (vacio(p.citacion)) m.push(E('Elige el estilo de citación.', 'problema.citacion'));
  if (vacio(p.idioma)) m.push(E('Elige el idioma del manuscrito.', 'problema.idioma'));
  return m;
}

// ─────────────────────────────── 1 · Variables ───────────────────────────────
function vVariables(s) {
  const v = s.variables, m = [];
  if (vacio(v.vi)) m.push(E('Nombra lo que vas a variar o manipular.', 'variables.vi'));

  const niveles = lista(v.viNiveles, /[,;\n]/);
  if (!niveles.length) m.push(E('Indica en qué niveles variarás la VI.', 'variables.viNiveles'));
  else if (niveles.length < 2) m.push(E('Con un solo nivel no hay variación: necesitas al menos dos, idealmente tres.', 'variables.viNiveles'));
  else if (niveles.length === 2) m.push(A('Con dos niveles solo ves si hay efecto, no la forma de la curva. Usa tres o más si puedes.', 'variables.viNiveles'));
  else m.push(OK(`${niveles.length} niveles.`, 'variables.viNiveles'));

  if (vacio(v.vd)) m.push(E('Nombra lo que vas a medir como efecto.', 'variables.vd'));
  if (!vacio(v.vi) && !vacio(v.vd) && norm(v.vi) === norm(v.vd)) {
    m.push(E('La VI y la VD no pueden ser la misma variable.', 'variables.vd'));
  }
  if (vacio(v.unidad)) m.push(E('Sin unidad no hay variable medible. Indica la unidad de la VD (mm, °C, %, N…).', 'variables.unidad'));
  if (vacio(v.instrumento)) m.push(E('Si no puedes nombrar el instrumento, la variable no está operacionalizada.', 'variables.instrumento'));

  const res = numero(v.resolucion), umb = numero(v.umbral);
  if (res && umb && res > 0) {
    const r = umb / res;
    const txt = `Relación umbral/resolución = ${r.toFixed(1).replace('.', ',')}:1.`;
    if (r >= 10) m.push(OK(`${txt} Cumple la regla práctica 10:1.`, 'variables.umbral'));
    else if (r >= 4) m.push(A(`${txt} No llega a 10:1; justifícalo con el presupuesto de incertidumbre.`, 'variables.umbral'));
    else m.push(E(`${txt} El instrumento no permite afirmar ese umbral: ajusta el umbral o consigue otro instrumento.`, 'variables.umbral'));
  } else {
    m.push(A('Completa la resolución y el umbral para verificar la regla 10:1.', 'variables.umbral'));
  }

  if (vacio(v.intervinientes)) m.push(A('Identifica qué factores pueden contaminar el resultado y cómo los controlarás.', 'variables.intervinientes'));
  return m;
}

// ──────────────────────────────── 2 · Título ────────────────────────────────
function vTitulo(s, d) {
  const t = s.titulo, v = s.variables, m = [];
  const destino = s.problema.destino || 'revista';
  const esTesis = destino === 'tesis';
  const verbos = d.verbos.verbos;

  if (vacio(t.verbo)) m.push(E('Elige el verbo rector: determina el nivel de investigación.', 'titulo.verbo'));
  else {
    const vb = verbos[t.verbo];
    m.push(I(`“${t.verbo}” corresponde al nivel ${vb.niveles.join(' o ')}.`, 'titulo.verbo'));
    if (vb.nota) m.push(I(vb.nota, 'titulo.verbo'));
  }

  if (vacio(t.contexto)) m.push(E('Falta el contexto: nombra el sistema concreto donde se estudia.', 'titulo.contexto'));
  else if (CONTEXTOS_GENERICOS.includes(norm(t.contexto)) || significativas(t.contexto).length < 2) {
    m.push(A('Contexto demasiado general: nombra un sistema concreto, no una categoría (p. ej., “una impresora 3D FDM cartesiana de bajo costo”, no “la industria”).', 'titulo.contexto'));
  }

  if (vacio(t.condicion)) {
    if (esTesis) m.push(E('La forma de tesis exige la condición: “bajo [condición]”.', 'titulo.condicion'));
    else m.push(I('En revista la condición es opcional; puede ir en el resumen.', 'titulo.condicion'));
  }

  if (vacio(t.texto)) {
    m.push(E('Redacta el título (o usa “Proponer título”).', 'titulo.texto'));
    return m;
  }

  const componentes = [
    ['la variable dependiente', v.vd],
    ['la variable independiente', v.vi],
    ['el contexto', t.contexto],
  ];
  for (const [nombre, valor] of componentes) {
    if (vacio(valor)) continue;
    if (cobertura(valor, t.texto) >= 0.6) m.push(OK(`Contiene ${nombre}.`, 'titulo.texto'));
    else m.push(E(`Al título le falta ${nombre} (“${valor}”).`, 'titulo.texto'));
  }
  if (!vacio(t.condicion)) {
    if (cobertura(t.condicion, t.texto) >= 0.6) m.push(OK('Contiene la condición.', 'titulo.texto'));
    else if (esTesis) m.push(E(`Al título le falta la condición (“${t.condicion}”).`, 'titulo.texto'));
    else m.push(I('La condición no aparece en el título; en revista puede ir en el resumen.', 'titulo.texto'));
  }

  const tw = palabras(t.texto);
  const primera = tw[0] ?? '';
  const empiezaConVerbo = Object.keys(verbos).some((k) => norm(k) === primera);

  if (!vacio(t.verbo)) {
    const vb = verbos[t.verbo];
    if (esTesis) {
      if (primera !== norm(t.verbo)) m.push(A(`En la forma de tesis el título empieza con el verbo rector: “${capitalizar(t.verbo)} …”.`, 'titulo.texto'));
      else m.push(OK('Empieza con el verbo rector.', 'titulo.texto'));
      if (!norm(t.texto).includes('en funcion de')) m.push(A('La forma de tesis enlaza la VD y la VI con “en función de”.', 'titulo.texto'));
    } else if (empiezaConVerbo) {
      m.push(A(`Las revistas no titulan con infinitivos. Usa la forma nominal: “${capitalizar(vb.nominal)} de …” o “Efecto de [VI] sobre [VD] …”.`, 'titulo.texto'));
    } else {
      const nominales = [norm(vb.nominal), ...d.verbos.nominalesRevista.map(norm)];
      if (nominales.some((n) => tw.includes(n))) m.push(OK('Forma nominal adecuada para revista.', 'titulo.texto'));
      else m.push(A(`No se reconoce el verbo rector en forma nominal (“${vb.nominal}”, “efecto”, “influencia”). Sin él, el nivel de investigación no queda claro.`, 'titulo.texto'));
    }
  }

  const n = contarPalabras(t.texto);
  if (esTesis) {
    if (n > 30) m.push(A(`${n} palabras: un título de tesis no debería pasar de 30.`, 'titulo.texto'));
    else if (n < 10) m.push(A(`${n} palabras: probablemente falta algún componente.`, 'titulo.texto'));
  } else if (n < 12 || n > 18) {
    m.push(A(`${n} palabras: para ${DESTINO_TXT[destino]} apunta a 12–18.`, 'titulo.texto'));
  } else {
    m.push(OK(`${n} palabras.`, 'titulo.texto'));
  }
  return m;
}

// Construye un título con los componentes que ya escribió el usuario.
export function sugerirTitulo(s, d) {
  const t = s.titulo, v = s.variables;
  if (vacio(t.verbo) || vacio(v.vd) || vacio(v.vi) || vacio(t.contexto)) return null;
  const vb = d.verbos.verbos[t.verbo];
  const cond = vacio(t.condicion) ? '' : ` bajo ${t.condicion.trim()}`;
  let titulo;
  if (s.problema.destino === 'tesis') {
    titulo = `${capitalizar(t.verbo)} ${v.vd.trim()} en función de ${v.vi.trim()} en ${t.contexto.trim()}${cond}`;
  } else if (vb.niveles.includes('explicativo') && !vb.niveles.includes('correlacional')) {
    titulo = `Efecto de ${v.vi.trim()} sobre ${v.vd.trim()} en ${t.contexto.trim()}${cond}`;
  } else {
    titulo = `${capitalizar(vb.nominal)} de ${v.vd.trim()} en función de ${v.vi.trim()} en ${t.contexto.trim()}${cond}`;
  }
  return titulo.replace(/\bde el\b/g, 'del').replace(/\ba el\b/g, 'al').replace(/\s+/g, ' ');
}

// ───────────────────────────── 3 · Palabras clave ─────────────────────────────
export function parsearKeywords(texto) {
  return lista(texto).map((l) => {
    const [es = '', en = ''] = l.split('|').map((x) => x.trim());
    return { es, en };
  });
}

function vKeywords(s) {
  const m = [], c = 'keywords.texto';
  const pares = parsearKeywords(s.keywords.texto);
  if (!pares.length) return [E('Escribe entre 4 y 6 palabras clave, una por línea: español | inglés.', c)];

  if (pares.length < 4 || pares.length > 6) m.push(E(`Tienes ${pares.length}; deben ser entre 4 y 6.`, c));
  else m.push(OK(`${pares.length} palabras clave.`, c));

  pares.forEach(({ es, en }, i) => {
    const etq = `Línea ${i + 1} (“${es || en}”)`;
    const nes = contarPalabras(es), nen = contarPalabras(en);
    if (!es) m.push(E(`${etq}: falta el término en español.`, c));
    else if (nes > 3) m.push(E(`${etq}: ${nes} palabras; usa sintagmas de 1 a 3 palabras.`, c));
    if (!en) m.push(E(`${etq}: falta la versión en inglés (formato “español | inglés”).`, c));
    else if (nen > 3) m.push(E(`${etq}: la versión en inglés tiene ${nen} palabras; máximo 3.`, c));
    if (KEYWORDS_GENERICAS.includes(norm(es)) || KEYWORDS_GENERICAS.includes(norm(en))) {
      m.push(A(`${etq}: término demasiado general; devolvería millones de resultados.`, c));
    }
  });

  const vars = `${s.variables.vi ?? ''} ${s.variables.vd ?? ''}`;
  if (vars.trim() && !pares.some((p) => p.es && cobertura(p.es, vars) >= 0.5)) {
    m.push(A('Ninguna palabra clave nombra una variable (VI o VD).', c));
  }
  if (!vacio(s.titulo.contexto) && !pares.some((p) => p.es && cobertura(p.es, s.titulo.contexto) >= 0.5)) {
    m.push(A('Ninguna palabra clave nombra el sistema (contexto del título).', c));
  }
  if (!vacio(s.titulo.texto)) {
    if (pares.some((p) => p.es && cobertura(p.es, s.titulo.texto) < 0.5)) m.push(OK('Incluye al menos un término puente (no está en el título).', c));
    else m.push(A('Añade un término puente: un concepto que no está en el título pero por el que la gente buscaría.', c));
  }

  const vistos = new Set();
  for (const p of pares) {
    const k = norm(p.es);
    if (k && vistos.has(k)) m.push(A(`“${p.es}” está repetida.`, c));
    vistos.add(k);
  }

  if (s.problema.citacion === 'IEEE') {
    const en = pares.map((p) => p.en).filter(Boolean);
    const ordenadas = [...en].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    if (en.join('|') !== ordenadas.join('|')) m.push(A(`IEEE pide los términos (Index Terms) en orden alfabético: ${ordenadas.join(', ')}.`, c));
  }
  m.push(I('Prueba decisiva: busca cada término en un buscador académico. Si aparecen trabajos ajenos a tu campo, cámbialo.', c));
  return m;
}

// ─────────────────────── 4 · Tipificación e implementación ───────────────────────
const PATRONES_IMPLEMENTACION = {
  tecnico: /constru|prototip|fabric|disen|implement|ensambl|desarroll|montaj|programar|automatiz/,
  manipula: /variar|varia(ndo|re)|niveles|factor|ensay|experiment|manipul|probar distint|comparar/,
  optimiza: /optimi|mejor combinaci|maximiz|minimiz|taguchi|superficie de respuesta/,
  observa: /registros|historic|base de datos|datos existentes|monitore|observa/,
  cualitativo: /encuesta|entrevist|percepci|usabilidad|grupo focal/,
};

function vTipificacion(s, d) {
  const t = s.tipificacion, m = [];
  const crit = d.combinaciones.criterios;
  const lbl = (k, v) => crit[k].opciones[v] ?? v;

  for (const k of d.combinaciones.orden) {
    if (vacio(t[k])) m.push(E(`Elige ${crit[k].label.toLowerCase()}.`, `tipificacion.${k}`));
  }

  // Filtro 1: coherencia epistemológica
  if (t.enfoque === 'cualitativo' && t.diseno === 'experimental') {
    m.push(E('Filtro 1 (coherencia epistemológica): el enfoque cualitativo no admite diseño experimental.', 'tipificacion.diseno'));
  }
  // Filtro 2: coherencia nivel-diseño
  const permitidos = d.combinaciones.nivelDiseno[t.nivel];
  if (permitidos && t.diseno && !permitidos.includes(t.diseno)) {
    m.push(E(`Filtro 2 (nivel-diseño): el nivel ${lbl('nivel', t.nivel).toLowerCase()} solo admite diseño ${permitidos.map((x) => lbl('diseno', x).toLowerCase()).join(' o ')}; elegiste ${lbl('diseno', t.diseno).toLowerCase()}.`, 'tipificacion.diseno'));
  }
  // Coherencia verbo-nivel
  const verbo = s.titulo.verbo;
  if (verbo && t.nivel) {
    const vb = d.verbos.verbos[verbo];
    if (!vb.niveles.includes(t.nivel)) {
      m.push(E(`El verbo del título (“${verbo}”) corresponde al nivel ${vb.niveles.join(' o ')}, pero declaraste ${lbl('nivel', t.nivel).toLowerCase()}. Cambia el verbo o el nivel.`, 'tipificacion.nivel'));
    } else {
      m.push(OK(`Coherente con el verbo del título (“${verbo}”).`, 'tipificacion.nivel'));
    }
  }
  // Filtro 4: factibilidad operativa
  if (s.problema.c1 === 'no' && t.diseno === 'experimental') {
    m.push(E('Filtro 4 (factibilidad): diseño experimental sin laboratorio ni equipos (C1 = No).', 'tipificacion.diseno'));
  } else if (s.problema.c1 === 'parcial' && t.diseno === 'experimental') {
    m.push(A('Filtro 4: con acceso parcial al laboratorio, asegura el control total que exige el diseño experimental.', 'tipificacion.diseno'));
  }
  // Filtro 8: unidad de análisis
  if (t.unidad === 'documentos' && (t.diseno === 'experimental' || t.diseno === 'cuasi_experimental')) {
    m.push(A('Filtro 8: sobre documentos no se manipulan variables; revisa la unidad de análisis o el diseño.', 'tipificacion.unidad'));
  }
  // Filtro 9: nivel académico
  const na = s.problema.nivelAcad;
  if (na === 'bachiller' && (t.diseno === 'experimental' || ['explicativo', 'predictivo'].includes(t.nivel))) {
    m.push(A('Filtro 9: para bachiller lo usual es no experimental y descriptivo/correlacional. Confirma que puedes sostener esta exigencia.', 'tipificacion.nivel'));
  }
  if (na === 'doctorado' && ['exploratorio', 'descriptivo'].includes(t.nivel)) {
    m.push(A('Filtro 9: para doctorado se espera nivel explicativo o predictivo.', 'tipificacion.nivel'));
  }

  // Matriz filtrada de 30 combinaciones
  const completa = d.combinaciones.orden.every((k) => t[k]);
  if (completa) {
    const actual = d.combinaciones.orden.map((k) => t[k]).join('|');
    const hallada = d.combinaciones.validas.find((v) => v.c.join('|') === actual);
    if (hallada) m.push(OK(`Coincide con la combinación nº ${hallada.n} de la matriz filtrada de Casquero.`));
    else m.push(A('Esta combinación no está entre las 30 válidas de la matriz filtrada. Justifícala explícitamente o ajústala.'));
  }

  // Filtro 3: naturaleza del problema, deducida de la implementación
  const c = 'tipificacion.implementacion';
  if (vacio(t.implementacion)) {
    m.push(E('Describe cómo lo vas a implementar: permite verificar la naturaleza del problema (filtro 3).', c));
  } else {
    const txt = norm(t.implementacion);
    const hay = Object.fromEntries(Object.entries(PATRONES_IMPLEMENTACION).map(([k, re]) => [k, re.test(txt)]));
    if (hay.tecnico && !hay.manipula && !hay.optimiza && t.tipo && t.tipo !== 'tecnologica') {
      m.push(A('Filtro 3: describes construir algo (problema técnico). Lo coherente es tipo tecnológica y nivel aplicativo.', c));
    }
    if (hay.optimiza && t.nivel && !['explicativo', 'predictivo'].includes(t.nivel)) {
      m.push(A('Filtro 3: describes un problema de optimización. Lo coherente es tipo aplicada con nivel explicativo o predictivo.', c));
    }
    if (hay.manipula && t.diseno === 'no_experimental') {
      m.push(A('Describes variar factores (manipular la VI), pero declaraste diseño no experimental. Si manipulas, es experimental o cuasi experimental.', c));
    }
    if (hay.observa && !hay.manipula && t.diseno === 'experimental') {
      m.push(A('Describes observar o usar datos existentes: eso es diseño no experimental, no experimental.', c));
    }
    if (hay.cualitativo && t.enfoque === 'cuantitativo') {
      m.push(A('Mencionas encuestas, entrevistas o percepción: si las analizarás, el enfoque es mixto.', c));
    }
    if (t.nivel === 'aplicativo' && !hay.tecnico) {
      m.push(A('Declaraste nivel aplicativo, pero la implementación no menciona diseñar, construir ni implementar nada.', c));
    }
    if (t.implementacion.trim().length < 80) m.push(A('Descríbelo con más detalle: qué harás, con qué equipo y cómo medirás.', c));
  }
  return m;
}

// ──────────────────────────────── 5 · Estado del arte ────────────────────────────────
function vEstadoArte(s) {
  const e = s.estadoArte, papers = e.papers ?? [], m = [];
  const destino = s.problema.destino || 'revista';
  const min = MIN_REFERENCIAS[destino];

  if (papers.length < min) m.push(E(`Tienes ${papers.length} de ${min} referencias mínimas para ${DESTINO_TXT[destino]}.`));
  else m.push(OK(`${papers.length} referencias.`));

  const titulo = (p) => `“${(p.titulo || 'sin título').slice(0, 60)}…”`;
  const sinLim = papers.filter((p) => vacio(p.limitaciones));
  if (sinLim.length) m.push(E(`${sinLim.length} paper(s) sin limitaciones escritas. La columna Limitaciones es donde nace tu aporte.`));

  const invalidos = papers.filter((p) => p.doiEstado === 'invalido');
  invalidos.forEach((p) => m.push(E(`El DOI ${p.doi} no existe en Crossref ni DataCite: ${titulo(p)}. Corrígelo o elimina la referencia.`)));

  const sinVerificar = papers.filter((p) => p.doi && ['pendiente', 'error'].includes(p.doiEstado));
  if (sinVerificar.length) m.push(A(`${sinVerificar.length} DOI sin verificar (sin conexión o pendiente). Pulsa “Verificar DOI” en cada uno.`));

  const sinDoi = papers.filter((p) => !p.doi);
  if (sinDoi.length) m.push(A(`${sinDoi.length} referencia(s) sin DOI: verifícalas a mano en su fuente (normas, libros y tesis a veces no tienen DOI).`));

  const limite = new Date().getFullYear() - 5;
  const conAnio = papers.filter((p) => p.anio);
  const viejos = conAnio.filter((p) => Number(p.anio) < limite);
  if (conAnio.length && viejos.length / conAnio.length > 0.5) {
    m.push(A(`${viejos.length} de ${conAnio.length} referencias son anteriores a ${limite}. Prioriza los últimos 5 años, salvo obras fundacionales.`));
  }

  const incompletas = papers.filter((p) => vacio(p.objetivo) || vacio(p.metodologia) || vacio(p.resultados));
  if (incompletas.length) m.push(A(`${incompletas.length} fila(s) de la matriz con objetivo, metodología o resultados vacíos.`));

  if (vacio(e.vacio)) m.push(E('Clasifica el vacío de conocimiento que detectaste.', 'estadoArte.vacio'));
  if (vacio(e.aporte)) m.push(E('Redacta el aporte con la plantilla “A diferencia de…”.', 'estadoArte.aporte'));
  else if (!norm(e.aporte).includes('a diferencia')) {
    m.push(A('Usa la plantilla: “A diferencia de los trabajos previos, que [limitación común], el presente trabajo [lo distinto], lo que permite [beneficio verificable]”.', 'estadoArte.aporte'));
  }
  return m;
}

// ──────────────────────────────── 6 · Cadena lógica ────────────────────────────────
function vCadena(s, d) {
  const c = s.cadena, m = [];
  const prohibidos = d.verbos.verbosProhibidos;
  const vi = s.variables.vi ?? '', vd = s.variables.vd ?? '';

  if (vacio(c.preguntaGeneral)) m.push(E('Formula la pregunta general.', 'cadena.preguntaGeneral'));
  else {
    const pg = c.preguntaGeneral.trim();
    if (!pg.startsWith('¿') || !pg.endsWith('?')) m.push(A('Escríbela como pregunta: “¿…?”.', 'cadena.preguntaGeneral'));
    if ((vi && cobertura(vi, pg) < 0.5) || (vd && cobertura(vd, pg) < 0.5)) {
      m.push(A('La pregunta general debe relacionar la VI con la VD: “¿De qué manera [VI] influye en [VD] en [sistema]?”.', 'cadena.preguntaGeneral'));
    }
  }

  const preguntas = lista(c.preguntasEsp);
  if (!preguntas.length) m.push(E('Descompón la pregunta general en preguntas específicas (una por línea).', 'cadena.preguntasEsp'));
  else if (preguntas.length < 3 || preguntas.length > 5) m.push(A(`Tienes ${preguntas.length}; lo habitual son entre 3 y 5.`, 'cadena.preguntasEsp'));

  const revisarVerbo = (texto, campo, etq) => {
    const primera = palabras(texto)[0] ?? '';
    if (prohibidos.includes(primera)) m.push(E(`${etq}: “${primera}” no es evaluable. Usa analizar, determinar, medir, evaluar, validar o cuantificar.`, campo));
    else if (!esInfinitivo(primera)) m.push(A(`${etq}: empieza con un verbo en infinitivo.`, campo));
  };

  if (vacio(c.objetivoGeneral)) m.push(E('Redacta el objetivo general: la pregunta general convertida en acción.', 'cadena.objetivoGeneral'));
  else {
    revisarVerbo(c.objetivoGeneral, 'cadena.objetivoGeneral', 'Objetivo general');
    const primera = palabras(c.objetivoGeneral)[0];
    if (s.titulo.verbo && primera !== norm(s.titulo.verbo) && !prohibidos.includes(primera)) {
      m.push(A(`El objetivo general suele usar el verbo rector del título (“${s.titulo.verbo}”).`, 'cadena.objetivoGeneral'));
    }
  }

  const objetivos = lista(c.objetivosEsp);
  if (!objetivos.length) m.push(E('Redacta los objetivos específicos (uno por línea).', 'cadena.objetivosEsp'));
  else {
    if (preguntas.length && objetivos.length !== preguntas.length) {
      m.push(E(`Regla 1:1: tienes ${preguntas.length} preguntas específicas y ${objetivos.length} objetivos específicos.`, 'cadena.objetivosEsp'));
    } else if (preguntas.length) m.push(OK('Regla 1:1 entre preguntas y objetivos.', 'cadena.objetivosEsp'));
    objetivos.forEach((o, i) => revisarVerbo(o, 'cadena.objetivosEsp', `Objetivo ${i + 1}`));
  }

  const nivel = s.tipificacion.nivel;
  if (vacio(c.h1)) {
    if (['explicativo', 'predictivo'].includes(nivel)) m.push(E(`El nivel ${nivel} exige hipótesis de investigación (H₁).`, 'cadena.h1'));
    else if (['correlacional', 'aplicativo'].includes(nivel)) m.push(A('Este nivel normalmente lleva hipótesis. Formúlala o justifica su ausencia.', 'cadena.h1'));
    else if (nivel) m.push(I('Los niveles exploratorio y descriptivo pueden no llevar hipótesis; confirma el reglamento.', 'cadena.h1'));
  } else {
    if (!/\d/.test(c.h1)) m.push(A('Una hipótesis sin umbral numérico no se puede contrastar. Incluye el valor y la unidad.', 'cadena.h1'));
    if (!(/\bsi\b/.test(norm(c.h1)) && /entonces/.test(norm(c.h1)))) {
      m.push(I('Plantilla sugerida: “Si [manipulo la VI], entonces [efecto en la VD], siempre que [condiciones]”.', 'cadena.h1'));
    }
    if (vacio(c.h0)) m.push(A('Formula la hipótesis nula (H₀): es la que se contrasta estadísticamente.', 'cadena.h0'));
  }
  const hEsp = lista(c.hEsp);
  if (hEsp.length > objetivos.length && objetivos.length) {
    m.push(A('Hay más hipótesis específicas que objetivos específicos.', 'cadena.hEsp'));
  }
  return m;
}

// ──────────────────────────── 7 · Matriz de consistencia ────────────────────────────
export function construirMatriz(s, d) {
  const c = s.cadena, v = s.variables, t = s.tipificacion;
  const preguntas = lista(c.preguntasEsp);
  const objetivos = lista(c.objetivosEsp);
  const hEsp = lista(c.hEsp);
  const sinHipotesis = ['exploratorio', 'descriptivo'].includes(t.nivel);
  const disenoTxt = t.diseno ? d.combinaciones.criterios.diseno.opciones[t.diseno] : '';
  const metodo = [disenoTxt, s.diseno.arreglo ? ARREGLOS[s.diseno.arreglo] : ''].filter(Boolean).join(' — ');
  const instrumento = v.instrumento
    ? `${v.instrumento}${v.resolucion ? ` (resolución ${v.resolucion} ${v.unidad ?? ''})` : ''}`.trim()
    : '';
  const filas = Math.max(preguntas.length, objetivos.length);
  return Array.from({ length: filas }, (_, i) => ({
    pregunta: preguntas[i] ?? '',
    objetivo: objetivos[i] ?? '',
    hipotesis: hEsp[i] ?? (c.h1?.trim() || (sinHipotesis ? '(no aplica en este nivel)' : '')),
    variables: v.vi || v.vd ? `VI: ${v.vi ?? '—'} · VD: ${v.vd ?? '—'}` : '',
    indicador: v.vd ? `${v.vd}${v.unidad ? ` [${v.unidad}]` : ''}` : '',
    metodo,
    instrumento,
  }));
}

export const COLUMNAS_MATRIZ = [
  ['pregunta', 'Pregunta específica'], ['objetivo', 'Objetivo'], ['hipotesis', 'Hipótesis'],
  ['variables', 'Variables'], ['indicador', 'Indicador'], ['metodo', 'Método'], ['instrumento', 'Instrumento'],
];

function vMatriz(s, d) {
  const filas = construirMatriz(s, d), m = [];
  if (!filas.length) return [E('La matriz se genera sola con los recuadros 1, 4, 6 y 8. Completa primero la cadena lógica (recuadro 6).')];
  filas.forEach((f, i) => {
    const faltan = COLUMNAS_MATRIZ.filter(([k]) => vacio(f[k])).map(([, l]) => l.toLowerCase());
    if (faltan.length) m.push(E(`Fila ${i + 1}: falta ${faltan.join(', ')}.`));
  });
  if (!m.length) m.push(OK('Todas las filas cierran.'));
  m.push(I('Verifica que el conjunto sea factible con tu tiempo (C3) y presupuesto (C2).'));
  return m;
}

// ──────────────────────────── 8 · Diseño experimental ────────────────────────────
export const ARREGLOS = {
  factorial_completo: 'Factorial completo',
  factorial_fraccionado: 'Factorial fraccionado',
  taguchi: 'Arreglo ortogonal de Taguchi',
  superficie_respuesta: 'Superficie de respuesta',
  un_factor: 'Un factor a la vez',
  antes_despues: 'Comparación antes/después (con línea base)',
  observacional: 'Observacional (no experimental)',
  otro: 'Otro',
};

function vDiseno(s) {
  const x = s.diseno, m = [];
  const faltanC = ['c1', 'c2', 'c3', 'c4'].filter((k) => vacio(s.problema[k]));
  if (faltanC.length) m.push(E(`Bloqueado: completa el bloque C (recursos) del recuadro 0 — faltan ${faltanC.map((k) => k.toUpperCase()).join(', ')}.`));

  const noExp = s.tipificacion.diseno === 'no_experimental';
  if (vacio(x.arreglo)) m.push(E('Elige el arreglo experimental.', 'diseno.arreglo'));
  else if (noExp && x.arreglo !== 'observacional') {
    m.push(A('Declaraste diseño no experimental: un arreglo factorial implica manipular variables.', 'diseno.arreglo'));
  }

  const rep = numero(x.replicas);
  if (rep === null) m.push(E('Indica el número de réplicas.', 'diseno.replicas'));
  else if (rep < 2) m.push(A('Sin réplicas no se estima el error experimental y la prueba F pierde potencia.', 'diseno.replicas'));

  const f = numero(x.factores), nv = numero(x.niveles);
  if (x.arreglo === 'factorial_completo' && f && nv && rep) {
    m.push(I(`Corridas del factorial completo: ${nv}^${f} × ${rep} réplicas = ${nv ** f * rep}.`, 'diseno.replicas'));
  }
  if (!noExp && !x.aleatorizacion) m.push(A('Aleatoriza el orden de las corridas para neutralizar efectos no controlados.', 'diseno.aleatorizacion'));
  if (!x.piloto) m.push(A('Planifica una prueba piloto de 2 o 3 corridas antes del experimento formal.', 'diseno.piloto'));

  if (vacio(x.lineaBase)) m.push(E('Sin línea base no podrás afirmar mejora alguna. Describe la medición de referencia.', 'diseno.lineaBase'));
  if (vacio(x.materiales)) m.push(A('Especifica materiales (mismo lote), equipo y herramientas.', 'diseno.materiales'));
  if (vacio(x.muestra)) m.push(A('Define población y muestra, y justifica el tamaño.', 'diseno.muestra'));

  if (vacio(x.procedimiento)) m.push(E('Describe el procedimiento paso a paso, de forma replicable.', 'diseno.procedimiento'));
  else if (x.procedimiento.trim().length < 150) m.push(A('El procedimiento es breve: otro investigador debería poder replicarlo solo con este texto.', 'diseno.procedimiento'));

  if (vacio(x.norma)) m.push(A('Si existe una norma de ensayo para lo que mides, adóptala y cítala (replicabilidad y comparabilidad).', 'diseno.norma'));

  if (vacio(x.analisis)) m.push(E('Indica las pruebas estadísticas previstas, el nivel de significancia y el software.', 'diseno.analisis'));
  else if (!/0[.,]0[15]|α|alfa|signific/i.test(x.analisis)) m.push(A('Declara el nivel de significancia (p. ej., α = 0,05).', 'diseno.analisis'));
  return m;
}

// ─────────────────────────────────── 9 · Autores ───────────────────────────────────
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_ORCID = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
const CAMPOS_AUTOR_OBLIGATORIOS = [
  ['nombre', 'nombre'], ['departamento', 'departamento'], ['universidad', 'universidad'],
  ['ciudad', 'ciudad'], ['pais', 'país'], ['correo', 'correo'],
];

function vAutores(s) {
  const lista = s.autores?.lista ?? [], m = [];
  if (!lista.length) return [E('Agrega al menos un autor: sus datos van bajo el título del paper.')];

  lista.forEach((a, i) => {
    const etq = `Autor ${i + 1}${a.nombre ? ` (${a.nombre})` : ''}`;
    const faltan = CAMPOS_AUTOR_OBLIGATORIOS.filter(([k]) => vacio(a[k])).map(([, l]) => l);
    if (faltan.length) m.push(E(`${etq}: falta ${faltan.join(', ')}.`));
    if (!vacio(a.correo) && !RE_CORREO.test(a.correo.trim())) m.push(E(`${etq}: el correo no tiene un formato válido.`));
    if (!vacio(a.orcid) && !RE_ORCID.test(a.orcid.trim())) m.push(A(`${etq}: el ORCID debe tener el formato 0000-0000-0000-0000.`));
  });

  const corresp = lista.filter((a) => a.correspondencia).length;
  if (corresp === 0) m.push(A('Marca un autor de correspondencia; si no, se asumirá el primero.'));
  if (lista.length > 6) m.push(A(`${lista.length} autores: la plantilla IEEE de conferencia se ve bien hasta 6; revisa la lista de autoría.`));
  if (!m.some((x) => x.n === 'error')) m.push(OK(`${lista.length} autor(es) con datos completos.`));
  return m;
}

// ────────────────────────────────── Conjunto ──────────────────────────────────
const VALIDADORES = {
  problema: vProblema,
  variables: vVariables,
  titulo: vTitulo,
  keywords: vKeywords,
  tipificacion: vTipificacion,
  estadoArte: vEstadoArte,
  cadena: vCadena,
  matriz: vMatriz,
  diseno: vDiseno,
  autores: vAutores,
};

export function validarTodo(s, d) {
  return Object.fromEntries(Object.entries(VALIDADORES).map(([id, fn]) => [id, fn(s, d)]));
}

export function estadoDe(mensajes, estaVacia) {
  if (estaVacia) return 'pendiente';
  if (mensajes.some((x) => x.n === 'error')) return 'error';
  if (mensajes.some((x) => x.n === 'aviso')) return 'aviso';
  return 'ok';
}
