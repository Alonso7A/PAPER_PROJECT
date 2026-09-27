# Formato del proyecto exportado

El proyecto sale de la página Creador de Papers de dos formas, con **el mismo contenido**:

- **`proyecto-paper-AAAA-MM-DD.json`**: botón **Exportar proyecto (JSON)** de la barra lateral.
- **`informe-paper-AAAA-MM-DD.pdf`**: recuadro Informe → **Generar informe** → **Descargar PDF**. Es el informe legible, y lleva el JSON **adjunto** dentro del PDF con el nombre `proyecto-paper.json` (archivo incrustado). Se puede extraer con `pdfdetach -saveall informe.pdf` o con PyMuPDF (`fitz.open(pdf).embfile_get("proyecto-paper.json")`).

Ambos los lee la skill `paper_proyectos_GMIDEI` para redactar el paper en LaTeX.

- `version`: siempre `1` en este formato. Si cambia la estructura, sube este número y documenta la diferencia aquí.
- Todos los textos son los que escribió el usuario, sin procesar.
- Los campos vacíos pueden faltar o venir como `""`.

## Raíz

| Clave | Tipo | Contenido |
|---|---|---|
| `version` | número | Versión del formato (`1`) |
| `problema` | objeto | Recuadro 0 |
| `variables` | objeto | Recuadro 1 |
| `titulo` | objeto | Recuadro 2 |
| `keywords` | objeto | Recuadro 3 |
| `tipificacion` | objeto | Recuadro 4 |
| `estadoArte` | objeto | Recuadro 5 |
| `cadena` | objeto | Recuadro 6 |
| `diseno` | objeto | Recuadro 8 |
| `autores` | objeto | Recuadro 9 |
| `_export` | objeto | Resumen de validación y etiquetas legibles (solo en archivos exportados) |

La matriz de consistencia (recuadro 7) no se guarda: se deriva de los demás y viene calculada en `_export.matrizConsistencia`.

## `problema`

| Clave | Valores |
|---|---|
| `a1` | Fenómeno técnico observado |
| `a2` | Evidencia (dato o medición) |
| `a3` | A quién afecta y consecuencias |
| `a4` | `"conocimiento"` o `"tarea"` |
| `a5` | Qué se sabe y qué falta |
| `c1` | `"si"`, `"parcial"` o `"no"` (acceso a laboratorio) |
| `c2`, `c3`, `c4` | Presupuesto y plazos, tiempo total, software |
| `destino` | `"revista"`, `"congreso"` o `"tesis"` |
| `nivelAcad` | `"bachiller"`, `"titulo"`, `"maestria"` o `"doctorado"` |
| `citacion` | `"IEEE"`, `"APA"` u `"otro"` |
| `idioma` | `"es"` (español con resumen en inglés) o `"en"` |

## `variables`

| Clave | Contenido |
|---|---|
| `vi` | Variable independiente |
| `viNiveles` | Niveles de la VI, separados por coma (texto) |
| `vd` | Variable dependiente |
| `unidad` | Unidad de la VD |
| `instrumento` | Instrumento de medición de la VD |
| `resolucion`, `umbral` | Texto numérico con coma o punto decimal, en la unidad de la VD |
| `intervinientes` | Factores contaminantes y su control |

## `titulo`

| Clave | Contenido |
|---|---|
| `verbo` | Verbo rector en infinitivo (clave de `data/verbos.json`) |
| `contexto` | Sistema concreto |
| `condicion` | Condición |
| `texto` | Título redactado |

## `keywords`

| Clave | Contenido |
|---|---|
| `texto` | Una palabra clave por línea, con formato `español \| inglés` |

## `tipificacion`

Códigos de `data/combinaciones.json`; sus nombres legibles están en `_export.etiquetas.tipificacion`.

| Clave | Códigos |
|---|---|
| `enfoque` | `cuantitativo`, `cualitativo`, `mixto` |
| `tipo` | `basica`, `aplicada`, `tecnologica` |
| `nivel` | `exploratorio`, `descriptivo`, `correlacional`, `explicativo`, `predictivo`, `aplicativo` |
| `diseno` | `experimental`, `cuasi_experimental`, `no_experimental` |
| `temporalidad` | `transversal`, `longitudinal`, `prospectivo`, `retrospectivo` |
| `unidad` | `sistema`, `individuos`, `grupo`, `institucion`, `documentos` |
| `implementacion` | Texto: cómo se implementará |

## `estadoArte`

| Clave | Contenido |
|---|---|
| `papers` | Lista de referencias (ver abajo) |
| `vacio` | `evidencia`, `metodologico`, `contexto`, `articulacion` o `practico` |
| `aporte` | Frase “A diferencia de…” |

Cada elemento de `papers`:

| Clave | Contenido |
|---|---|
| `id` | Identificador interno |
| `doi` | DOI sin `https://doi.org/` (puede estar vacío) |
| `doiEstado` | `verificado`, `invalido`, `pendiente`, `error` o `sin_doi` |
| `titulo`, `autores` (lista de nombres), `anio`, `revista`, `url` | Datos bibliográficos |
| `fuente` | `openalex`, `pdf`, `bib`, `ris`, `doi` o `manual` |
| `objetivo`, `metodologia`, `resultados`, `aporte` | Columnas de la matriz comparativa |
| `limitaciones` | Limitaciones del trabajo |
| `origenLim` | `declarada` (por los autores) o `inferida` (por el usuario) |
| `resumen` | Resumen del paper, si se obtuvo (OpenAlex, PDF, .bib) |
| `sugerencias` | Frases sobre limitaciones extraídas del PDF, sin revisar: `{ texto, pagina }` (en proyectos antiguos, solo texto) |
| `hallazgos` | Frases con cifras (resultados cuantitativos): `{ texto, pagina, fuente, descartado }`. `fuente` es `pdf` (con página) o `resumen` (`pagina: null`). `descartado: true` si el usuario la desmarcó; no debe citarse |
| `conclusiones` | Extracto de la sección de conclusiones del PDF: `{ texto, pagina }` o `null` |
| `archivo`, `paginasPdf` | Nombre y número de páginas del PDF analizado (si se adjuntó) |

## `cadena`

| Clave | Contenido |
|---|---|
| `preguntaGeneral` | Texto |
| `preguntasEsp` | Una pregunta por línea |
| `objetivoGeneral` | Texto |
| `objetivosEsp` | Un objetivo por línea, en el mismo orden que las preguntas |
| `h1`, `h0` | Hipótesis de investigación y nula |
| `hEsp` | Hipótesis específicas, una por línea (opcional) |

## `diseno`

| Clave | Contenido |
|---|---|
| `arreglo` | `factorial_completo`, `factorial_fraccionado`, `taguchi`, `superficie_respuesta`, `un_factor`, `antes_despues`, `observacional`, `otro` |
| `factores`, `niveles`, `replicas` | Texto numérico |
| `aleatorizacion`, `piloto` | Booleanos |
| `materiales`, `muestra`, `lineaBase`, `procedimiento`, `norma`, `analisis` | Texto |

## `autores`

| Clave | Contenido |
|---|---|
| `lista` | Autores en orden de aparición |
| `grupo` | Grupo o proyecto de investigación (opcional) |
| `agradecimientos` | Agradecimientos y financiamiento (opcional) |

Cada elemento de `lista`: `nombre`, `departamento`, `universidad`, `ciudad`, `pais`, `correo`, `orcid` (opcional) y `correspondencia` (booleano; solo uno en `true`).

## `_export`

| Clave | Contenido |
|---|---|
| `formato` | `"creacion-paper"` |
| `version` | `1` |
| `exportado` | Fecha y hora ISO 8601 |
| `completo` | `true` si ningún recuadro está pendiente ni con errores |
| `recuadros` | Por cada recuadro: `numero`, `titulo`, `estado` (`pendiente`, `error`, `aviso`, `ok`), `errores` y `advertencias` (textos) |
| `etiquetas.tipificacion` | Nombres legibles de los seis criterios |
| `etiquetas.verboRector` | `{ verbo, niveles, nominal }` |
| `etiquetas.arreglo` | Nombre legible del arreglo experimental |
| `etiquetas.vacio` | Código del tipo de vacío |
| `matrizConsistencia` | Filas `{ pregunta, objetivo, hipotesis, variables, indicador, metodo, instrumento }` |
