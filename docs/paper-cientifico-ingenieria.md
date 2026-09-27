---
name: paper-cientifico-ingenieria
description: Construye un paper científico de ingeniería desde cero, de la idea en blanco al manuscrito listo para enviar. Cubre la formulación del título con variables, las palabras clave indexables, la tipificación metodológica por seis criterios, la búsqueda y síntesis crítica del estado del arte, la detección del vacío de conocimiento, la cadena lógica completa (pregunta, objetivos, hipótesis, variables, método), el diseño experimental, y la redacción de resultados, discusión y conclusiones. Úsala siempre que alguien mencione paper, artículo científico, publicación, tesis, proyecto de investigación, estado del arte, metodología de investigación, diseño experimental, marco teórico, o pida ayuda con cualquier apartado de un trabajo académico de ingeniería, aunque no diga la palabra "paper". Úsala también cuando alguien tenga un tema y no sepa cómo convertirlo en investigación, o cuando pida un título, unas palabras clave o una matriz de consistencia.
---

# Paper científico de ingeniería, de cero a manuscrito

## Principio rector: la cadena lógica

Un paper no se reprueba por escribir mal. Se reprueba por **incoherencia lógica** entre lo que se pregunta, lo que se promete y lo que se demuestra.

```
Realidad problemática → Problema → Pregunta → Objetivos → Hipótesis
→ Variables → Método → Resultados → Discusión → Conclusiones
```

Cada eslabón se deriva del anterior. Tres reglas maestras gobiernan la cadena:

1. El **objetivo general** responde exactamente a la **pregunta general**.
2. La **hipótesis** es la respuesta tentativa a esa misma pregunta.
3. Las **conclusiones** contestan, una por una y en el mismo orden, a los **objetivos específicos**.

Si se modifica un eslabón, hay que revisar todos los demás. La herramienta que verifica esto es la **matriz de consistencia** (Fase 6).

---

## Andamiaje interno vs. manuscrito publicado

Buena parte de lo que sigue (preguntas específicas, hipótesis nula formal, matriz de operacionalización, matriz de consistencia) es **andamiaje**: garantiza la coherencia, pero no aparece como sección en el paper. Una tesis sí los expone como apartados propios; un artículo no.

El manuscrito de revista sigue la estructura **IMRaD**. Así se reparte el trabajo de cada fase:

| Sección del paper | Se alimenta de |
|---|---|
| Título, palabras clave | Fases 1 y 2 |
| Resumen (*abstract*) | Fase 11 |
| **I**ntroducción | Fase 0 (problema), Fase 4 (estado del arte y vacío), Fase 5 (objetivo y, si aplica, hipótesis en una o dos oraciones) |
| **M**étodos (materiales y métodos) | Fases 3, 6 y 7 (tipificación, variables operacionalizadas, diseño experimental) |
| **R**esultados | Fase 8 |
| **a**nd **D**iscusión | Fase 9 |
| Conclusiones | Fase 10 (algunas revistas las integran al final de la discusión) |
| Declaraciones y referencias | Fase 11 y Fase 4 |

### Estructura narrativa: OCAR

Schimel (*Writing Science*, 2012) muestra que un paper es una **historia** con cuatro funciones, y que la misma estructura se repite a escala de paper, de sección y de párrafo:

| Elemento | Función | Dónde vive en el paper |
|---|---|---|
| **O**pening (apertura) | El problema amplio y sus "personajes" (sistema, fenómeno) | Inicio de la introducción |
| **C**hallenge (desafío) | La pregunta concreta que se propone responder | **Final** de la introducción: vacío + objetivo |
| **A**ction (acción) | Lo que se hizo para responderla | Métodos y resultados |
| **R**esolution (resolución) | Qué cambió en nuestro conocimiento | Discusión y conclusiones |

La resolución debe **volver al punto de partida**: la conclusión responde al desafío planteado en la introducción, en sus mismos términos. Es la misma regla maestra de la cadena lógica, vista desde la redacción.

Las revistas especializadas usan OCAR directo (el desafío al final de la introducción, la conclusión al final). Las revistas generalistas prefieren adelantar la conclusión (estructura LD/LDR). Adelantarla en una revista especializada puede parecer que se forzó el dato para encajar en una historia decidida de antemano.

**A nivel de párrafo y oración:** la primera oración del párrafo fija el tema (*topic sentence*) y la información nueva o importante va al final de la oración (*stress position*), donde el lector pone el énfasis.

---

## FASE 0 — Entrevista de arranque

No escribas nada antes de tener estas respuestas. Son las preguntas que, una vez contestadas, definen de qué trata el paper y determinan todo lo demás.

Haz las preguntas por bloques, no todas de golpe. Si el usuario responde de forma vaga, no avances: reformula y vuelve a preguntar. Una respuesta vaga aquí se convierte en un paper incoherente después.

### Bloque A — El problema (define si hay investigación)

**A1.** ¿Qué fenómeno técnico observas que no funciona, no está optimizado o no se comprende?
**A2.** ¿Con qué dato, medición o evidencia respaldas que ese problema existe?
**A3.** ¿A quién afecta y qué consecuencia tiene no resolverlo?
**A4.** ¿Es un problema de **conocimiento** (nadie lo ha medido o explicado) o solo una **tarea de ingeniería** (hay que construir algo)?
**A5.** ¿Qué se sabe ya sobre esto y qué sospechas que falta?

> **Filtro crítico en A4.** "Quiero construir una máquina X" no es un problema de investigación. El problema es la brecha: "no existe evidencia de que un diseño de bajo costo alcance tolerancias aceptables". Si la respuesta a A4 es "tarea de ingeniería", ayuda al usuario a reformular hacia la brecha de conocimiento antes de continuar. Este es el punto donde más trabajos se pierden.

### Bloque B — Las variables (define si es medible)

**B1.** ¿Qué vas a **variar o manipular**? (variable independiente)
**B2.** ¿Qué vas a **medir** como efecto? (variable dependiente)
**B3.** ¿Con qué **instrumento** medirás la variable dependiente, y cuál es su resolución?
**B4.** ¿Qué factores podrían **contaminar** el resultado y cómo los controlarás? (intervinientes)
**B5.** ¿En cuántos **niveles** puedes variar cada variable independiente?

> **Filtro crítico en B3.** Si el usuario no puede nombrar el instrumento, la variable no está operacionalizada. Un indicador sin instrumento es una promesa vacía. Como criterio práctico de metrología (regla 10:1, heurística, no ley), la resolución del instrumento debería ser unas diez veces menor que el umbral que se quiere afirmar; algunas normas aceptan 4:1 si se declara la incertidumbre. Si no se cumple, el umbral no es sostenible: hay que ajustarlo, conseguir otro instrumento o justificar la relación con un análisis de incertidumbre.

### Bloque C — Los recursos (define si es factible)

**C1.** ¿Tienes laboratorio, taller o acceso a los equipos necesarios?
**C2.** ¿Cuál es tu presupuesto y cuánto tardan en llegar los componentes críticos?
**C3.** ¿Cuánto tiempo tienes en total?
**C4.** ¿Qué software de análisis estadístico o de simulación puedes usar?

> **Filtro crítico en C2.** Los ítems de importación con seis a diez semanas de entrega definen la ruta crítica del proyecto. Las órdenes de compra se emiten en la semana 1, en paralelo con la revisión bibliográfica, no cuando el diseño esté terminado.

### Bloque D — El destino (define el formato)

**D1.** ¿El producto es un paper de revista, un artículo de congreso, una tesis, o varios?
**D2.** ¿Qué nivel académico? (pregrado, título profesional, maestría, doctorado)
**D3.** ¿Qué estilo de citación exige tu institución o revista objetivo? (IEEE, APA, otro)

> **Por qué importa D1.** Una tesis lleva cronograma, EDT, presupuesto, matriz de adquisiciones, justificación como capítulo propio y defensa oral. Un paper no lleva nada de eso. Si el usuario hará ambos, el paper es un subconjunto de la tesis y conviene escribir primero la tesis.

### Regla de bloqueo

Si faltan respuestas de los bloques A o B, **no avances a la Fase 1**. Explica al usuario qué falta y por qué sin eso no se puede formular un título con variables.

Si faltan respuestas del bloque C, puedes avanzar hasta la Fase 5, pero adviértelo: el diseño experimental de la Fase 7 quedará bloqueado.

---

## FASE 1 — Título

Un título de investigación tiene cinco componentes: **verbo rector** (o su forma nominal), **variable dependiente**, **variable independiente**, **contexto/sistema** y **condición**. Se admiten dos formas, según el destino (bloque D).

**Forma de tesis** (convención de muchas universidades peruanas; empieza con verbo en infinitivo):

```
[Verbo rector] + [Variable dependiente] + "en función de" + [Variable independiente]
+ "en" [Contexto/sistema] + "bajo" [Condición]
```

> Ejemplo (Casquero, 2026): *"Evaluar el rendimiento térmico de un intercambiador de calor en función del caudal de agua en un sistema de enfriamiento industrial bajo condiciones de operación continua"*.

**Forma de revista** (sintagma nominal; las revistas no titulan con infinitivos):

```
[Sustantivo del verbo rector | "Efecto de"] + [VI] + "sobre/en" + [VD]
+ "de/en" [Contexto/sistema] (+ [Condición], si cabe)
```

> Ejemplo: *"Efecto del caudal de agua sobre el rendimiento térmico de un intercambiador de calor industrial en operación continua"*.

En la forma de revista, "en función de" no es obligatorio y la condición puede pasar al resumen si alarga demasiado el título. Los cinco componentes deben seguir siendo identificables, aunque el verbo esté nominalizado.

### Verbo rector según el nivel

| Nivel | Verbos (forma de tesis) | Forma nominal (revista) | Pregunta que responde |
|---|---|---|---|
| Exploratorio | explorar, sondear, identificar | exploración, identificación | ¿Existe el fenómeno? ¿Vale la pena estudiarlo? |
| Descriptivo | describir, caracterizar | descripción, caracterización | ¿Cómo es? |
| Correlacional | analizar, relacionar, asociar | análisis, relación entre…, asociación | ¿Se relacionan A y B? |
| Explicativo | evaluar, determinar, explicar | evaluación, determinación, efecto de… | ¿A causa B? ¿Por qué? |
| Predictivo | predecir, estimar, modelar, optimizar | predicción, estimación, modelado, optimización | ¿Qué ocurrirá? ¿Qué combinación es la mejor? |
| Aplicativo | diseñar, implementar, desarrollar | diseño, implementación, desarrollo | ¿Cómo lo resuelvo? |

El verbo rector no es decorativo: **determina el nivel de investigación y, con ello, toda la arquitectura metodológica posterior**. Elegir "diseñar" lleva a un nivel aplicativo; elegir "evaluar", a un nivel explicativo con manipulación de variables.

> **Sobre "optimizar".** Aunque suene a verbo de intervención, un problema de optimización busca la combinación de factores que maximiza o minimiza una respuesta. Eso exige conocer la relación causal y modelarla, así que según Casquero corresponde a investigación **aplicada** de nivel **explicativo o predictivo**, no aplicativo. Si lo que se quiere es construir el sistema optimizado, el verbo correcto es "diseñar" o "implementar".

> **"Analizar" es ambiguo.** Se usa tanto en estudios correlacionales como explicativos (Casquero, ejemplo 2: "Analizar…" → correlacional-explicativo). Si el trabajo manipula la VI, prefiere "evaluar" o "determinar".

### Procedimiento

1. Identifica si el destino es tesis o revista (bloque D) y aplica la forma que corresponda.
2. Diagnostica el título tentativo del usuario contra los cinco componentes. Señala cuáles faltan.
3. Propón **tres alternativas**, una por nivel de investigación, y descompón cada una en una tabla de cinco filas.
4. Para revista: 12 a 18 palabras, forma nominal. Para tesis: hasta 30 palabras, forma con verbo. Si el usuario hará ambas, entrega las dos versiones.
5. Deja que el usuario elija. El nivel que elija condiciona la Fase 3.

### Verificación

- ¿Se pueden señalar los cinco componentes (con el verbo explícito o nominalizado)?
- ¿El verbo rector o su forma nominal corresponde al nivel que se declarará en la Fase 3?
- ¿La variable dependiente se mide con un número y una unidad?
- ¿La variable independiente se puede variar en al menos tres niveles?
- ¿El contexto nombra un sistema concreto, no una categoría general?
- ¿Un lector ajeno puede deducir del título qué gráfico aparecerá en los resultados?
- ¿La forma (infinitivo o sintagma nominal) corresponde al destino?

---

## FASE 2 — Palabras clave

Las palabras clave no resumen el título: son el **mecanismo de recuperación** del artículo en bases de datos. Elige las que otro investigador **escribiría para buscar** un trabajo como este, no las que mejor lo describen.

### Procedimiento

1. Descompón el título y elimina conectores (preposiciones, gerundios, participios).
2. Clasifica cada resto por función: unidad de análisis, variable independiente, variable dependiente, proceso, campo de aplicación.
3. Normaliza cada término a su forma canónica y a su equivalente en inglés (usa vocabulario de tesauros reconocidos cuando existan).
4. Añade **al menos un término puente**: un concepto que no aparece en el título pero por el que la gente buscaría.

### Reglas

- Entre 4 y 6 términos, sustantivos o sintagmas nominales, de 1 a 3 palabras.
- Versión en español **y** en inglés. IEEE exige orden alfabético.
- Al menos uno debe nombrar una **variable**; al menos uno, el **sistema**.
- Escala correcta: ni "ingeniería" (millones de resultados) ni "fresa de 0,1 mm a 12 000 rpm" (cero resultados).

### Prueba decisiva

Busca cada palabra clave en un buscador académico. Si aparecen trabajos ajenos a tu campo, el término está mal elegido. Casi nadie hace esta prueba.

---

## FASE 3 — Tipificación metodológica

Declara seis criterios y verifica su coherencia.

| Criterio | Opciones |
|---|---|
| **Enfoque** | cuantitativo · cualitativo · mixto |
| **Tipo** | básica · aplicada · tecnológica |
| **Nivel** | exploratorio · descriptivo · correlacional · explicativo · predictivo · aplicativo |
| **Diseño** | experimental · cuasi experimental · no experimental |
| **Temporalidad** | transversal · longitudinal · retrospectivo · prospectivo |
| **Unidad de análisis** | sistema · individuo · grupo · institución · documento |

Las variantes generan un universo teórico de 3 × 3 × 6 × 3 × 4 × 5 = **3240 combinaciones**. Solo un subconjunto reducido (aprox. 5–15 %) es coherente, factible y válido. Los filtros siguientes lo acotan.

> **Nota sobre la temporalidad.** La lista mezcla dos ejes: el número de mediciones en el tiempo (transversal / longitudinal) y la dirección temporal (prospectivo / retrospectivo). Se sigue la convención de Casquero de elegir una sola, la que mejor describe el estudio. Si hacen falta dos (p. ej., longitudinal y prospectivo), decláralo explícitamente.

### Filtros de acotación

Aplica estos filtros en orden y descarta las combinaciones que fallen (Casquero, 2026):

| # | Filtro | Regla | Ejemplos |
|---|---|---|---|
| 1 | **Coherencia epistemológica** | El enfoque define los límites del diseño | Cualitativo + experimental ✗ · Cuantitativo + experimental ✓ · Cualitativo + no experimental ✓ |
| 2 | **Coherencia nivel-diseño** | No todos los niveles permiten manipular variables | Exploratorio → no experimental · Descriptivo → no experimental · Correlacional → no experimental o cuasi experimental · Explicativo → experimental o cuasi experimental |
| 3 | **Naturaleza del problema** | El problema manda sobre la metodología | Problema técnico (construir o mejorar algo) → tecnológica + aplicativo · Problema teórico → básica + exploratorio · Problema de optimización → aplicada + explicativo o predictivo |
| 4 | **Factibilidad operativa** | Se elige lo que realmente se puede ejecutar (bloque C) | Experimental sin laboratorio ✗ · No experimental con datos existentes ✓ |
| 5 | **Disponibilidad y tipo de datos** | Los datos disponibles definen el enfoque | Numéricos → cuantitativo · Entrevistas → cualitativo · Ambos → mixto |
| 6 | **Control de variables** | El nivel de control determina el diseño | Control alto → experimental · Parcial → cuasi experimental · Nulo → no experimental |
| 7 | **Temporalidad del fenómeno** | El tiempo del fenómeno define la temporalidad | Estable → transversal · Dinámico → longitudinal · Proyección → prospectivo · Histórico → retrospectivo |
| 8 | **Unidad de análisis adecuada** | Debe corresponder al objeto de estudio | Sistema fotovoltaico → sistema · Usuarios → individuos · Empresa → institución |
| 9 | **Nivel académico** | El nivel académico limita la complejidad | Bachiller → no experimental, descriptivo/correlacional · Título profesional → aplicada, cuasi experimental · Doctorado → explicativo/predictivo, experimental o modelamiento avanzado |
| 10 | **Validez científica** | Toda combinación debe permitir validez interna y externa | Se descarta si falta relación entre variables, si el diseño es incompatible con la hipótesis o si falta medición o control |

Añade además la **coherencia verbo-nivel**: el verbo rector del título (Fase 1) debe corresponder al nivel declarado.

> **Uso del filtro 3 con "cómo lo va a implementar".** La forma en que el usuario piensa ejecutar el trabajo revela la naturaleza del problema. "Voy a construir un prototipo y probarlo" es un problema técnico (tecnológica + aplicativo). "Voy a variar A y medir B" es un problema explicativo (aplicada + explicativo). "Voy a buscar la mejor combinación de A, B y C" es un problema de optimización (aplicada + explicativo o predictivo). Si la tipificación declarada no coincide con lo que el usuario describe, señálalo.

### Combinaciones típicas en ingeniería

La combinación de referencia de Casquero para ingeniería es:

> Cuantitativo · Aplicada · Explicativo · Cuasi experimental · Longitudinal · Sistema

Cuando el problema es técnico (diseñar o implementar un sistema), la variante habitual es:

> Cuantitativo · Tecnológica · Aplicativo · Cuasi experimental · Longitudinal · Sistema

En la matriz filtrada de 30 combinaciones válidas predominan el enfoque cuantitativo, los tipos aplicada y tecnológica, los diseños **cuasi experimental y no experimental** y la unidad de análisis sistema. El diseño **experimental** puro (control total, aleatorización) es válido pero más exigente: por ejemplo, Cuantitativo · Aplicada · Explicativo · Experimental · Prospectivo · Sistema, típico de un diseño factorial o Taguchi en laboratorio con control de intervinientes. Exige laboratorio y control reales (filtros 4 y 6).

Si el usuario elige una combinación que no está en la matriz filtrada, exige justificación explícita.

---

## FASE 4 — Estado del arte

No es un resumen de lecturas. Es una **síntesis crítica comparada** que termina detectando un vacío.

### Procedimiento

```
Buscar → Clasificar → Matriz comparativa → Sintetizar en prosa → Detectar el vacío
```

**1. Buscar.** Usa las palabras clave de la Fase 2. Prioriza los últimos 5 años, salvo obras fundacionales. El número de referencias depende del destino; consulta siempre la guía de autores de la revista, que a veces fija un máximo. Como orientación: artículo de congreso, 10–20; artículo de revista indexada, 25–40; artículo de revisión, 50 o más; tesis, según el reglamento. Distribúyelas en cuatro bloques:

- Antecedentes directos del problema
- Bases teóricas del fenómeno físico
- Normativa técnica aplicable
- Metodología estadística o de análisis

**2. Clasificar.** Ordena los trabajos por enfoque, nivel, diseño y unidad de análisis. La distribución revela el patrón del campo.

**3. Matriz comparativa.** Una fila por artículo, con estas columnas:

| Referencia | Objetivo | Metodología | Resultados | Limitaciones | Conclusiones | Aporte |

La columna **Limitaciones** es la mina de oro: lo que cada trabajo dejó sin resolver es exactamente donde nace el aporte propio. Distingue siempre lo **declarado por los autores** de lo **inferido por análisis**.

**4. Sintetizar en prosa.** El estado del arte se escribe **tema por tema**, no artículo por artículo. "Autor A hizo… Autor B hizo…" es una lista, no una síntesis. Agrupa varios trabajos por afirmación, señala convergencias, contradicciones y el límite común.

**5. Detectar el vacío.** Clasifícalo:

| Tipo de vacío | Definición |
|---|---|
| De evidencia | Nadie lo midió |
| Metodológico | Se hizo, pero con método débil |
| De contexto | No se probó en este escenario |
| De articulación | Dos dominios estudiados por separado, nunca conectados |
| Práctico | Existe en teoría, sin implementación |

### Redacción del aporte

> "A diferencia de los trabajos previos, que [limitación común], el presente trabajo [lo que hace distinto], lo que permite [beneficio verificable]."

### De estado del arte a introducción (OCAR)

En el paper, el estado del arte no es un capítulo aparte: se integra en la **introducción**, que cubre la apertura y el desafío de la estructura OCAR como un embudo:

1. **Apertura (O):** el problema técnico amplio y por qué importa (bloque A de la Fase 0).
2. **Lo que se sabe:** síntesis temática de la Fase 4, paso 4.
3. **Lo que falta:** el vacío clasificado de la Fase 4, paso 5.
4. **Desafío (C), al final de la introducción:** el objetivo del trabajo y, si aplica, la hipótesis, en una o dos oraciones. Suele empezar con "El objetivo de este trabajo es…".

Si el desafío no aparece claramente en el último párrafo de la introducción, el lector no sabe qué pregunta responden los resultados.

### Integridad — no negociable

**Nunca inventes autores, DOI, títulos ni artículos.** Verifica cada referencia en su fuente. Si un dato de autoría o paginación proviene de un registro secundario, decláralo explícitamente y pide al usuario que lo confirme en el DOI. Toda cita del texto debe estar en la bibliografía y viceversa.

---

## FASE 5 — Cadena lógica

### 5.1 Pregunta general

> ¿De qué manera [variable independiente] influye en [variable dependiente] en el contexto de [sistema]?

Verifícala con **FINER**: Factible, Interesante, Novedosa, Ética, Relevante. Si falla una, reformula.

### 5.2 Preguntas específicas

Descomponen la general en partes abordables. Normalmente entre 3 y 5.

### 5.3 Objetivos

El **objetivo general** es la pregunta general convertida en acción. Los **específicos** son los pasos verificables.

**Regla 1:1** — Cada pregunta específica tiene su objetivo específico y, al final, su conclusión. Esta simetría es lo primero que se revisa.

Verbos prohibidos por no evaluables: conocer, entender, aprender, profundizar, concientizar. ¿Cómo demuestras que "conociste" algo? Usa: analizar, determinar, medir, evaluar, validar, cuantificar.

Cada objetivo específico debe tener un **entregable verificable** asociado (una tabla, un modelo, un valor medido).

### 5.4 Hipótesis

> Si [manipulo la VI], entonces [ocurre el efecto en la VD], siempre que [condiciones críticas].

| Tipo | Símbolo | Función |
|---|---|---|
| De investigación | H₁ | Lo que se afirma |
| Nula | H₀ | Lo que se contrasta estadísticamente |
| Específicas | H₁.₁ … | Una por objetivo específico que lo requiera |

**El umbral no se elige por conveniencia.** Se deriva de dos restricciones independientes:

1. **Resolución del instrumento.** Con la regla práctica 10:1, afirmar un umbral de 15 μm pide una resolución de 1,5 μm o mejor. Si solo se alcanza una relación menor (p. ej., 4:1), justifícala con el presupuesto de incertidumbre.
2. **Criterio de aceptación funcional.** Tomado de la normativa aplicable o del requisito de desempeño del sistema.

Los niveles exploratorio y descriptivo pueden no llevar hipótesis; se sustituye por preguntas u objetivos. Confirma el reglamento institucional.

---

## FASE 6 — Operacionalización y matriz de consistencia

> Ambas matrices son **herramientas de trabajo**. En una tesis se incluyen, normalmente como anexo o como apartado del capítulo metodológico. En un paper no se publican: su contenido se reparte en la sección de Métodos (variables, instrumentos, escalas) y en el último párrafo de la introducción (objetivo e hipótesis).

### Matriz de operacionalización

Una fila por variable, cinco columnas obligatorias:

| Variable | Dimensión | Indicador | Instrumento | Escala |

Clasifica cada variable como independiente, dependiente, controlada o interviniente. Si no puedes nombrar el instrumento, la variable no está lista.

### Matriz de consistencia — herramienta maestra

Constrúyela **antes** de redactar cualquier capítulo. Si todas las filas cierran, el documento es coherente por construcción.

| Pregunta específica | Objetivo | Hipótesis | Variables | Indicador | Método | Instrumento |

**Verificación de cierre:**

- Cada objetivo específico tiene su hipótesis (o su justificación de no tenerla).
- Cada hipótesis tiene sus variables identificadas como VI y VD.
- Cada variable tiene un indicador medible.
- Cada indicador tiene un método que permite obtenerlo.
- Cada método tiene un instrumento nombrado.
- El conjunto es factible dentro del cronograma y presupuesto.

Si una fila no cuadra, ahí está la incoherencia. Corrígela antes de seguir.

---

## FASE 7 — Diseño experimental

### Elementos obligatorios

| Elemento | Qué define |
|---|---|
| Tipificación | Los seis criterios de la Fase 3, justificados |
| Materiales | Especificación completa, mismo lote |
| Equipo | Configuración, rangos, controlador, software |
| Herramientas | Geometría, material, recubrimiento |
| Variables | La matriz de operacionalización cerrada |
| Diseño | Arreglo (factorial, Taguchi), factores, niveles, réplicas, aleatorización |
| Población y muestra | Universo, subconjunto, justificación del tamaño y del método de selección |
| Procedimiento | Paso a paso replicable |
| Medición | Instrumento, resolución, calibración, repeticiones |
| Validez y confiabilidad | Calibración, incertidumbre, verificación de supuestos |
| Control de intervinientes | Cómo se neutraliza cada factor contaminante |
| Análisis de datos | Pruebas previstas, nivel de significancia, software |
| **Línea base** | Medición de la condición de referencia |

### Tres reglas que se olvidan

**Línea base.** Sin una medición de referencia no se puede afirmar mejora alguna. "Mejoré X" sin línea base es una bandera roja que hunde defensas.

**Justificación del tamaño de muestra.** El número de corridas debe derivarse del arreglo experimental, no de la conveniencia. Las réplicas permiten estimar el error experimental, requisito para la prueba F.

**Prueba piloto.** Ejecuta dos o tres corridas antes del experimento formal. Verifican que el instrumento resuelve lo necesario, que los consumibles sobreviven el número previsto de corridas, y que el rango de niveles produce diferencias detectables. Descubrir en la corrida 20 que los tres niveles dan resultados indistinguibles obliga a repetir todo.

### Norma aplicable

Cuando exista una norma de ensayo para lo que se mide, adóptala y cítala. Aporta tres ventajas: replicabilidad, citabilidad y comparabilidad con la literatura. Un protocolo informal no las tiene.

---

## FASE 8 — Resultados

Presenta la evidencia. El lector debe poder llegar a sus propias conclusiones leyendo solo esta sección.

### Estructura

Un subapartado por objetivo específico, **en el mismo orden**. No es el diario de laboratorio.

### Reglas

| # | Regla |
|---|---|
| 1 | Presenta, no interpreta. Si aparece "porque", es interpretación fuera de lugar |
| 2 | Cada dato aparece **una sola vez**: en tabla, en figura o en texto. Nunca en dos |
| 3 | Si el dato está en tabla, el texto señala la tendencia, no los valores |
| 4 | Si el dato está en figura, el texto describe la **forma**, no los valores |
| 5 | Toda cifra lleva unidad y, cuando aplique, incertidumbre |
| 6 | Reporta medidas de dispersión, no solo promedios |
| 7 | Declara el nivel de significancia en toda prueba estadística |
| 8 | Toda figura y tabla se numera, titula y referencia en el texto |
| 9 | Título de tabla arriba; de figura, abajo |
| 10 | Tablas y figuras autoexplicativas: comprensibles sin leer el texto |
| 11 | Reporta **todos** los resultados, incluidos los desfavorables y los ensayos fallidos |

### Contenido estadístico obligatorio

Cuando se aplique análisis de varianza, la tabla debe incluir suma de cuadrados, grados de libertad, cuadrado medio, estadístico F, valor p y **contribución porcentual**.

> **Distinción que casi nadie hace:** el valor p dice si el efecto es **real**; la contribución porcentual dice si **importa**. Un factor puede ser significativo y despreciable a la vez. Reporta ambos.

Añade siempre:

- **R² y R² ajustado**, para saber si el modelo es útil.
- **La fila de error con sus grados de libertad.** Si tiene menos de 4, la prueba F carece de potencia: aplica agrupamiento de factores no significativos y decláralo.
- **Verificación de supuestos** (normalidad de residuos, homogeneidad de varianzas, independencia) con la prueba usada y su valor p. Un análisis de varianza cuyos supuestos no se verifican no es válido.

### Optimización multiobjetivo

Si se aplica, declara explícitamente los pesos asignados a cada respuesta y **justifícalos**. Pesos iguales no son neutrales: son una decisión.

### Ensayo de confirmación

Se declara válido solo si el valor medido cae dentro del **intervalo de confianza** de la predicción. Si cae fuera, el modelo es insuficiente y probablemente hay interacción no modelada. Eso también se reporta.

---

## FASE 9 — Discusión

Aquí el dato se convierte en conocimiento. Es la sección donde más trabajos de ingeniería fallan, porque se limitan a repetir los resultados con otras palabras.

### Cinco movimientos

| Movimiento | Pregunta que responde |
|---|---|
| **D1** Hallazgo principal | ¿Qué encontramos, en una frase? |
| **D2** Mecanismo físico | ¿Por qué ocurrió? |
| **D3** Contraste con la literatura | ¿Coincide o contradice lo publicado? |
| **D4** Contraste de hipótesis | ¿Se acepta o se rechaza, con qué evidencia? |
| **D5** Implicación práctica | ¿Para qué sirve? |

### D2 es el que separa un trabajo mediocre de uno bueno

| Nivel | Ejemplo |
|---|---|
| Bajo (correlación) | "El factor A fue el más influyente." |
| Adecuado (mecanismo) | "El predominio de A se explica porque su incremento eleva la fuerza radial, lo que deflecta el conjunto y desplaza el punto de contacto efectivo, consistente con la baja rigidez medida en la Sección 3.1." |

Enlaza resultados de distintas secciones. Esa articulación suele ser el aporte declarado.

### D3 — tres situaciones

**Coincidencia:** señálala y explica qué sugiere sobre la generalidad del mecanismo.

**Discrepancia:** es el párrafo de mayor valor. No la ocultes ni la disculpes: **explícala con un mecanismo**. Un resultado que contradice la literatura y se explica bien vale más que uno que la confirma.

**Vacío:** si no hay con qué comparar, dilo explícitamente.

### D4 — contraste explícito

Declara aceptación o rechazo con la evidencia numérica que lo respalda. **La aceptación puede ser parcial**, y decirlo cuando corresponde demuestra rigor. Forzar una hipótesis a binaria cuando la evidencia es parcial es una bandera roja.

### Lo que no va en la discusión

- Repetir los resultados
- Introducir datos nuevos
- Afirmar mejora sin línea base
- Causalidad sin mecanismo
- Omitir lo contradictorio
- Concluir más de lo que los datos permiten

---

## FASE 10 — Conclusiones

### Reglas

1. **Simetría 1:1** con los objetivos específicos, en el mismo orden. Ni una más.
2. Numeradas, para que la simetría sea verificable.
3. Sin citas.
4. Sin datos que no aparecieran en Resultados.
5. **Afirmativas, no descriptivas.**

### La diferencia que define la sección

| Descriptiva (rechazada) | Afirmativa (correcta) |
|---|---|
| "Se estudió el efecto de los parámetros." | "El factor A explica el 63 % de la variabilidad, tres veces más que B, lo que lo identifica como parámetro de control prioritario." |

La primera relata el trabajo. La segunda afirma el conocimiento producido.

### Después de las conclusiones

Apartado propio, no dentro de ellas:

- **Limitaciones:** restricciones externas que sufriste (presupuesto, un solo equipo, tiempo).
- **Delimitaciones:** recortes que tú decidiste (solo este material, solo este rango).
- **Líneas futuras:** en tiempo futuro.

No las mezcles: son cosas distintas. Declarar una limitación antes de que la señalen demuestra madurez investigadora y desactiva la objeción.

---

## FASE 11 — Abstract y cierre

El abstract se escribe **al final**, nunca al principio.

### Cinco movimientos

| Movimiento | Extensión | Tiempo verbal |
|---|---|---|
| Contexto y problema | 1–2 oraciones | Presente |
| Objetivo | 1 oración | Pasado o infinitivo |
| Metodología | 2–3 oraciones | Pasado |
| Resultados **con cifras** | 2–3 oraciones | Pasado |
| Conclusión | 1 oración | Presente |

Estos cinco movimientos son el OCAR del paper completo comprimido en un párrafo: contexto y problema (O), objetivo (C), metodología y resultados (A), conclusión (R).

**Proporción:** ~20 % contexto y objetivo, 30 % método, 40 % resultados, 10 % conclusión. Si hay más oraciones de introducción que de resultados, está mal balanceado.

**Extensión:** 150–250 palabras, un solo párrafo.

**Prohibido:** citas, abreviaturas no definidas, tablas, ecuaciones, frases de relleno ("es de suma importancia"), promesas ("se espera que en un futuro"), y resultados que no aparecen en el cuerpo.

**Obligatorio:** al menos dos resultados cuantificados. "Se mejoró significativamente" no dice nada.

### Secciones administrativas

- **Autoría:** orden (primer autor quien ejecutó, último el asesor), filiación, ORCID, autor de correspondencia.
- **Declaraciones finales:** financiamiento, conflicto de intereses, disponibilidad de datos, contribución por autor (taxonomía CRediT) y **declaración de uso de herramientas de IA**, hoy exigida por la mayoría de editoriales.

---

## Orden de trabajo recomendado

No escribas de la primera sección a la última:

```
1. Fases 0 a 7 (toda la arquitectura documental)
2. Ejecutar experimentos
3. Resultados (figuras y tablas primero, texto después)
4. Discusión
5. Conclusiones
6. Introducción y estado del arte (se afinan sabiendo qué se encontró)
7. Abstract
8. Título definitivo (puede ajustarse al hallazgo principal)
```

En paralelo desde la semana 1: emitir órdenes de compra de los ítems de mayor plazo de entrega, y gestionar el acceso a los instrumentos de medición. El acceso a un instrumento calibrado suele ser el riesgo crítico del proyecto, y no es un riesgo económico sino de gestión: si no se puede medir la variable dependiente, la investigación completa se cae.

---

## Checklist final

- [ ] La cadena problema → pregunta → objetivos → hipótesis → variables → método → conclusiones es coherente.
- [ ] La matriz de consistencia cierra en todas sus filas.
- [ ] Cada objetivo específico tiene su conclusión, en el mismo orden.
- [ ] La hipótesis se acepta o rechaza explícitamente, con evidencia.
- [ ] Cada variable está operacionalizada: indicador, instrumento y escala.
- [ ] Existe línea base para toda afirmación de mejora.
- [ ] Los supuestos del análisis estadístico se verificaron y se declararon.
- [ ] El método es replicable y la muestra está justificada.
- [ ] Toda cita está en la bibliografía y viceversa; ninguna fuente inventada.
- [ ] El vacío de conocimiento y el aporte están declarados explícitamente.
- [ ] Figuras y tablas numeradas, tituladas y referenciadas.
- [ ] Acrónimos definidos en primer uso.
- [ ] Voz gramatical según la guía de la revista o el reglamento, y consistente en todo el documento. En español se usa el impersonal ("se midió"); muchas revistas en inglés prefieren la voz activa con "we", que Schimel recomienda porque identifica al actor y la acción.
- [ ] La introducción termina con el desafío (objetivo o hipótesis) y las conclusiones responden a ese mismo desafío (OCAR).
- [ ] El título tiene la forma que corresponde al destino: sintagma nominal para revista, verbo en infinitivo si el reglamento de tesis lo exige.
- [ ] La tipificación pasa los 10 filtros de acotación y coincide con la forma de implementación descrita.
- [ ] Formato de citación según la revista o el reglamento institucional.
- [ ] Control antiplagio aprobado.

---

## Errores que reprueban

| Error | Por qué es grave | Corrección |
|---|---|---|
| Tema demasiado amplio | Imposible de terminar; método difuso | Delimitar a una pregunta medible |
| Objetivos ≠ conclusiones | Rompe la coherencia maestra | Una conclusión por objetivo |
| Hipótesis no contrastable | No se puede aceptar ni rechazar | Añadir umbral medible e instrumento |
| Variables sin operacionalizar | No se sabe cómo medir | Indicador + instrumento + escala |
| "Mejoré" sin línea base | No hay con qué comparar | Medir la referencia antes |
| Citas inventadas o sin DOI | Falta de integridad académica | Verificar cada fuente |
| Marco teórico copiado | Plagio; sin análisis crítico | Sintetizar y comparar |
| Conclusiones infladas | Dicen más de lo que los datos permiten | Concluir solo lo sostenible |
| Discusión que repite resultados | No aporta conocimiento | Explicar el mecanismo |
| Confundir limitación con delimitación | Revela falta de comprensión metodológica | Separarlas en apartados |
| Tipificación que no coincide con la implementación | Declara "explicativo" pero solo construye un prototipo, o "aplicativo" pero solo varía factores | Aplicar el filtro 3 (naturaleza del problema) |
| Título de tesis enviado a una revista | Un infinitivo al inicio delata un documento no adaptado | Pasar a la forma nominal |
| Introducción sin desafío explícito | El lector no sabe qué pregunta responden los resultados | Cerrar la introducción con el objetivo (OCAR) |

---

## Cómo usar esta skill

Identifica en qué fase está el usuario y entra ahí. No lo obligues a empezar desde la Fase 0 si ya tiene un título o un corpus bibliográfico.

Si tiene solo un tema, empieza por la entrevista de la Fase 0. Si tiene un título, diagnostícalo en la Fase 1. Si tiene datos, ve a la Fase 8.

En cada fase, entrega el producto concreto (una tabla, una matriz, un texto redactado), no solo la explicación. Y al terminar cada fase, verifica el cierre con las preguntas de control antes de pasar a la siguiente.

---

## Fuentes base de este documento

- Casquero Zaidman, J. C. (2026). *Arquitectura metodológica de la investigación en la ingeniería: modelo de seis criterios, matriz de combinaciones y aplicaciones en tesis* (1.ª ed.). Lima, Perú. Fuente de los seis criterios, los diez filtros de acotación, la matriz filtrada y la estructura del título con verbo rector.
- Schimel, J. (2012). *Writing Science: How to Write Papers That Get Cited and Proposals That Get Funded*. Oxford University Press. Fuente de la estructura OCAR, de las variantes según el tipo de revista y de las posiciones de tema y énfasis en la oración.
