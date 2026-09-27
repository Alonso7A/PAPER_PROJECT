# Creador de Papers

Guía interactiva para construir un paper científico de ingeniería desde cero. La página muestra un recuadro por fase, corrige lo que se escribe (por ejemplo, un título sin contexto o un verbo que no corresponde al nivel de investigación) y, cuando ningún recuadro tiene errores, genera el protocolo de investigación y el esqueleto IMRaD del paper.

**Página publicada:** `https://TU_USUARIO.github.io/creacion-paper/`

## Recuadros

| # | Recuadro | Qué valida |
|---|---|---|
| 0 | Problema y destino | Evidencia del problema, problema de conocimiento vs. tarea, recursos, destino |
| 1 | Variables | VD con unidad e instrumento, niveles de la VI, regla 10:1 de resolución |
| 2 | Título | Cinco componentes, forma de tesis o de revista, número de palabras |
| 3 | Palabras clave | 4–6 términos en español e inglés, término puente, orden IEEE |
| 4 | Tipificación e implementación | Seis criterios, filtros de acotación, 30 combinaciones válidas, coherencia con la implementación |
| 5 | Estado del arte | Búsqueda (OpenAlex), subida de PDF, .bib/.ris, DOI verificado (Crossref/DataCite), matriz comparativa, vacío y aporte |
| 6 | Cadena lógica | Regla 1:1 preguntas-objetivos, verbos prohibidos, hipótesis contrastable |
| 7 | Matriz de consistencia | Se genera sola; marca las filas que no cierran |
| 8 | Diseño experimental | Línea base, réplicas, aleatorización, procedimiento, análisis |
| 9 | Informe | Descarga en Markdown o PDF |

## Estructura

```
├── index.html            Esqueleto de la página
├── css/styles.css        Estilos (claro/oscuro, móvil, impresión del informe)
├── js/
│   ├── app.js            Recuadros, navegación, guardado y validación en vivo
│   ├── reglas.js         Validaciones de cada recuadro
│   ├── guia.js           Lee docs/paper-cientifico-ingenieria.md y muestra cada fase
│   ├── estado-arte.js    OpenAlex, Crossref, DataCite, PDF.js, .bib/.ris y matriz
│   ├── informe.js        Genera el informe en Markdown
│   └── util.js           Funciones de texto compartidas
├── data/
│   ├── verbos.json       Verbo rector → nivel → forma nominal
│   └── combinaciones.json  Seis criterios y las 30 combinaciones válidas
└── docs/
    └── paper-cientifico-ingenieria.md   Fuente de la guía
```

## Cómo guía el .md a la página

- **Texto de la guía:** `guia.js` lee el .md y reparte cada sección `## FASE N — …` en su recuadro. Si editas el texto, la página cambia sola. **No renombres esos encabezados.**
- **Reglas:** están en `js/reglas.js` y `data/*.json`. Si cambias una regla en el .md, cámbiala también allí.

## Probar en local

La página debe servirse por HTTP (con doble clic el navegador bloquea la lectura del .md y los JSON):

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Privacidad

- El proyecto se guarda en el `localStorage` del navegador. Usa **Exportar proyecto** para respaldarlo.
- Los PDF se leen en el navegador; no se suben a ningún servidor. Solo se consultan OpenAlex, Crossref y DataCite (búsquedas y DOIs).

## Fuentes

- Casquero Zaidman, J. C. (2026). *Arquitectura metodológica de la investigación en la ingeniería: modelo de seis criterios, matriz de combinaciones y aplicaciones en tesis* (1.ª ed.). Lima, Perú.
- Schimel, J. (2012). *Writing Science: How to Write Papers That Get Cited and Proposals That Get Funded*. Oxford University Press.

Los PDF de estas obras no se incluyen en el repositorio (derechos de autor).
