# Revisión de implementación e interfaz de ImgConvert CLI

La evidencia inicial se conserva como diagnóstico histórico. La [disposición final](#disposición-final-de-las-correcciones) registra la implementación y su verificación posterior.

## 1. Resumen ejecutivo

La selección de herramientas responde a tareas reales: comprimir o convertir un lote, preparar imágenes con medidas exactas, repetir recetas mediante presets y generar recursos móviles. La separación entre conversión general, Alloy y branding es útil. Sharp evita implementar codecs propios y el sistema de ayuda permite consultar temas concretos.

La implementación todavía exige demasiadas excepciones para ser predecible. Algunos flags no se aplican, hay combinaciones de transformaciones que fallan y un resultado incorrecto puede devolver éxito al shell. El riesgo global es alto por las colisiones de archivos y las decisiones de limpieza, especialmente al automatizar tareas. No se observó un servicio expuesto a Internet ni un sistema de usuarios: el actor es quien ejecuta el comando con sus propios permisos de archivos.

Las cinco prioridades son evitar pérdidas por colisión, corregir la limpieza entre plataformas, devolver estados de error fiables, resolver todas las opciones una sola vez y reparar la conexión de Alloy con sus argumentos. La actualización de dependencias se realizó por autorización explícita y se comprobó aparte; no corrige esas fallas funcionales.

Hay que preservar conversión individual y por lotes, extensiones originales, transparencias, crop/canvas/trim, renombrado natural, presets existentes, escalas Alloy y categorías de branding. Las rutas relativas a la fuente son una decisión documentada, por lo que no recomiendo cambiarlas de forma silenciosa a rutas relativas al directorio de ejecución.

La verificación cubrió macOS arm64, Node 22.23.2 y comprobaciones específicas con Node 22.13.0. No incluye builds Android/iOS, Windows/Linux, una campaña de imágenes maliciosas ni un benchmark de grandes lotes.

### Valor práctico de las herramientas

| Herramienta                       | Para qué resulta útil                               | Valoración del contrato                                                                                                                                                                                           |
| --------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conversión individual y por lotes | Optimizar entregas web y cambiar codecs             | La forma `imgconvert source -f webp` es directa. Mantenerla; reparar colisiones y estados de salida antes de sumar formatos.                                                                                      |
| Width, height y fit               | Preparar thumbnails, banners e imágenes con límites | Los cinco fits cubren casos distintos. Conservar el default actual y ofrecer ejemplos por resultado. Un futuro control de no ampliar debe ser explícito; inside no tiene esa semántica.                           |
| Crop y canvas                     | Extraer una región y ajustar un lienzo sin escalar  | Son operaciones diferentes y ambas merecen existir. Su combinación debe funcionar con el orden documentado.                                                                                                       |
| Trim                              | Quitar bordes detectados por color o transparencia  | Útil para logos y assets, con la limitación de que no detecta objetos ni elimina fondos complejos.                                                                                                                |
| Quality y formatos                | Ajustar JPEG/WebP/AVIF o re-encodear PNG/TIFF/GIF   | Quality no equivale al mismo ahorro en todos los codecs. Conservar defaults por formato y no prometer reducción de tamaño. `all` incluye ambas extensiones JPEG por compatibilidad; no retirarlas sin transición. |
| Name y rename                     | Nombrar archivos de entrega o enumerar un catálogo  | La separación entre un nombre individual y reglas de lote es razonable. Debe existir una política de colisiones antes de escribir.                                                                                |
| Presets                           | Repetir una receta en proyectos o equipos           | Son la función que más reduce flags repetidos. Su utilidad depende de que JSON y CLI compartan validación y precedencia.                                                                                          |
| Alloy                             | Derivar recursos por densidad desde un master       | La escala fija reduce errores de integración. Las fuentes y grupos configurados deben poder ejecutarse sin un argumento de relleno.                                                                               |
| Brand                             | Crear launcher, notification y splash Android       | Las categorías separadas son útiles. Los nombres de propiedades y las instrucciones deben corresponder al SDK seleccionado.                                                                                       |
| Completions y ayuda por tema      | Descubrir opciones sin memorizar nombres            | La estructura es adecuada; el completado necesita el mismo conocimiento que Commander para cubrir los subcomandos.                                                                                                |

## 2. Hallazgos

Todos los hallazgos confirmados tienen una disposición en la matriz. Las referencias de línea corresponden al estado revisado; los cambios de dependencias conservan la lógica de los procesadores.

| ID   | Estado              | Severidad   | Área                   | Problema                                                                        |
| ---- | ------------------- | ----------- | ---------------------- | ------------------------------------------------------------------------------- |
| F-01 | Confirmado          | Alta        | Archivos               | Colisiones y sobrescritura silenciosa                                           |
| F-02 | Confirmado          | Alta        | Limpieza               | La orientación iPhone decide eliminaciones Android                              |
| F-03 | Confirmado          | Alta        | Automatización         | Los errores no producen un resultado fiable para scripts                        |
| F-04 | Confirmado          | Media       | Salida                 | --replace no reemplaza la entrada                                               |
| F-05 | Confirmado          | Media       | Alloy                  | Los parámetros públicos de Alloy no llegan completos al procesador              |
| F-06 | Confirmado          | Media       | Validación             | La validación acepta valores que contradicen la ayuda                           |
| F-07 | Confirmado          | Media       | Configuración          | La configuración falla de forma silenciosa o incompleta                         |
| F-08 | Confirmado          | Media       | Transformaciones       | Crop y canvas se combinan usando dimensiones anteriores                         |
| F-09 | Confirmado          | Media       | Branding               | La interfaz Android conserva nombres y notas de Titanium e iOS                  |
| F-10 | Confirmado          | Media       | Previsualización       | Dry-run no valida todos los insumos y staging no contiene el borrado            |
| F-11 | Confirmado          | Media       | Temporales             | Los errores dejan masters intermedios                                           |
| F-12 | Confirmado          | Informativa | API JavaScript         | El paquete exporta una entrada que ejecuta el CLI                               |
| F-13 | Confirmado          | Media       | Arquitectura           | Persisten rutas antiguas y duplicación de precedencia                           |
| F-14 | Confirmado          | Media       | Pruebas y herramientas | Los comandos de desarrollo prometen rutas inexistentes y borran rutas generales |
| F-15 | Confirmado          | Baja        | Autocompletado         | La ayuda y los completadores no comparten la misma definición                   |
| F-16 | Confirmado          | Baja        | Descubrimiento         | La ejecución sin argumentos falla antes de mostrar ayuda                        |
| F-17 | Confirmado          | Alta        | Dependencias           | Versiones antiguas y requisito de runtime incorrecto                            |
| F-18 | Riesgo condicionado | Media       | Rendimiento            | El lote no tiene un límite explícito de concurrencia                            |

### F-01 Colisiones y sobrescritura silenciosa

Estado: Confirmado. Severidad: Alta. Área: Archivos.

Referencia: [src/processors/image.js:593](../../src/processors/image.js#L593).

Dos entradas same.jpg y same.png convertidas a WebP producen un único same.webp. El resumen puede contar dos imágenes aunque sólo quede un destino. rename y --name también pueden coincidir con archivos existentes.

Impacto y usos afectados: Conversión por lotes y generación de variantes; un resultado sustituye a otro sin una decisión del usuario.

Cambio propuesto: Calcular todos los destinos antes de procesar. Rechazar colisiones dentro del lote y requerir --overwrite para sustituir destinos existentes. Escribir el temporal junto al destino antes del rename.

Alternativa menos restrictiva: No bloquear carpetas ni nombres legítimos. Ofrecer --overwrite explícito y --rename enumerate como salida para colisiones de nombres.

Compatibilidad: Ruptura justificada: los scripts que dependen de sobrescribir deberán usar --overwrite; conservar su capacidad mediante esa opción.

Prueba de aceptación: Dos entradas con el mismo basename deben producir un error previo a las escrituras. Con --overwrite, sólo permitir sustituciones explícitas sin carreras dentro del lote.

Disposición: Corregir ahora.

### F-02 La orientación iPhone decide eliminaciones Android

Estado: Confirmado. Severidad: Alta. Área: Limpieza.

Referencia: [src/processors/alloy-modern/tiapp-reader.js:71](../../src/processors/alloy-modern/tiapp-reader.js#L71).

Con iPhone configurado en vertical y una actividad Android horizontal, readTiapp devuelve portraitOnly=true. cleanup-legacy incluye res-land-hdpi en el plan de borrado. La reproducción usó --dry-run y conservó el archivo temporal.

Impacto y usos afectados: Mantenimiento de proyectos Titanium: puede eliminar recursos Android que siguen en uso. Además, hasAdaptiveIcons sólo comprueba una carpeta, sin verificar el recurso activo del manifest.

Cambio propuesto: Separar orientación por plataforma y exigir evidencia Android para borrar variantes horizontales. No equiparar presencia de carpeta con uso efectivo de adaptive icons. Ante datos insuficientes, conservar recursos y explicar por qué.

Alternativa menos restrictiva: Mantener limpieza específica y dry-run. Evitar eliminar toda la función o exigir un proyecto autenticado; el límite real es comprobar referencias y plataforma.

Compatibilidad: Compatible con la intención de una limpieza segura; algunos archivos que antes se borraban se conservarán hasta poder justificar su eliminación.

Prueba de aceptación: iPhone vertical + Android horizontal debe conservar res-land-*. Una carpeta adaptive vacía no debe bastar para borrar el icono/splash heredado.

Disposición: Corregir ahora.

### F-03 Los errores no producen un resultado fiable para scripts

Estado: Confirmado. Severidad: Alta. Área: Automatización.

Referencia: [src/processors/image.js:479](../../src/processors/image.js#L479).

Un crop fuera de la imagen termina con exit 0 y cero salidas. Un archivo SVG individual termina con exit 0 y cero procesados. Un crop decimal arroja una traza de Sharp porque parte de la preparación queda fuera del try.

Impacto y usos afectados: Pipelines y scripts pueden continuar aunque no exista ningún resultado. Los usuarios reciben estilos de error distintos para problemas equivalentes.

Cambio propuesto: Usar parseAsync y un límite de error común. Los procesadores deben devolver conteos de éxito/fallo y el comando debe establecer exit distinto de cero ante fallos. Rechazar una entrada individual no soportada.

Alternativa menos restrictiva: Permitir continuar con imágenes válidas en un lote, pero devolver un estado de fallo parcial. No abortar todo un lote por el primer archivo incorrecto.

Compatibilidad: Compatible con el uso previsto; corrige scripts que interpretaban como éxito una operación fallida. Documentar el código de salida para éxito parcial.

Prueba de aceptación: Lote mixto conserva las salidas válidas y termina con fallo; formato individual no soportado, extracción inválida y color inválido generan mensajes breves sin trazas salvo --debug.

Disposición: Corregir ahora.

### F-04 --replace no reemplaza la entrada

Estado: Confirmado. Severidad: Media. Área: Salida.

Referencia: [src/processors/image.js:444](../../src/processors/image.js#L444).

photo.png --replace --width 40 conserva la entrada 400x200 y crea converted/photo.png de 40x20. outputFileBase ya está construido dentro del output, por lo que ambas ramas eligen ese directorio.

Impacto y usos afectados: Compresión de originales y scripts de mantenimiento no cumplen su objetivo. El alias oculto comparte el problema.

Cambio propuesto: Resolver el destino de reemplazo desde inputFile. Mantener --replace y --replace-originals como alias; se puede añadir --in-place para coherencia con brand. Definir conversión de extensión sin borrar el original implícitamente.

Alternativa menos restrictiva: No implementar borrado de fuentes al convertir formatos. Para cambio de extensión, generar un hermano conservando la fuente, salvo una futura opción explícita de borrado.

Compatibilidad: Compatible para compresión del mismo formato. El caso de cambio de formato debe quedar especificado antes de implementar.

Prueba de aceptación: Compresión sin conversión actualiza el original de forma atómica; la conversión no elimina la fuente ni crea una carpeta innecesaria.

Disposición: Corregir ahora.

### F-05 Los parámetros públicos de Alloy no llegan completos al procesador

Estado: Confirmado. Severidad: Media. Área: Alloy.

Referencia: [src/cli/commands/alloy.js:12](../../src/cli/commands/alloy.js#L12).

_userArgs está vacío y applyConfigPrecedence sustituye -o. processAlloyLegacy siempre toma presets.alloy, aunque se pase otro -p. La entrada es obligatoria incluso cuando las plataformas tienen source; la selección de grupos no está conectada.

Impacto y usos afectados: El usuario termina editando JSON o ejecutando todos los grupos para operaciones que parecen disponibles por flags.

Cambio propuesto: Pasar argumentos explícitos a la precedencia, seleccionar la definición solicitada y permitir source omitido si existe en la configuración. Añadir --group para seleccionar grupos, con validación. Mantener los presets existentes.

Alternativa menos restrictiva: Conservar el comando y su escala fija, sin sustituirlo por una nueva configuración incompatible. No reutilizar -p alloy:grupo de forma ambigua con los presets generales.

Compatibilidad: Compatible mediante correcciones y opciones adicionales. Las fuentes por plataforma deben seguir teniendo su precedencia documentada.

Prueba de aceptación: alloy -o destino usa ese destino; -p personalizado selecciona sus plataformas; --group ejecuta sólo ese grupo; una configuración con fuentes puede funcionar sin fuente posicional.

Disposición: Corregir ahora.

### F-06 La validación acepta valores que contradicen la ayuda

Estado: Confirmado. Severidad: Media. Área: Validación.

Referencia: [src/cli/program.js:7](../../src/cli/program.js#L7).

--width 12abc y --width 12.9 producen ancho 12. -q 101 puede completarse en PNG. Un origen negativo de crop se omite con advertencia. --padding 0 falla en Commander aunque la validación interna acepta 0. Posiciones inválidas se sustituyen por center.

Impacto y usos afectados: Errores de escritura producen imágenes aparentemente válidas con medidas o encuadres distintos de los pedidos.

Cambio propuesto: Validar enteros completos, rangos de calidad y padding, coordenadas y colores antes de procesar. Usar el mismo esquema para CLI y JSON. Admitir 0 para padding; rechazar valores desconocidos en opciones enumeradas.

Alternativa menos restrictiva: Mantener nombres de color y posiciones válidas. No reducir todos los colores a hex ni eliminar aliases de posición.

Compatibilidad: Compatible con entradas válidas; endurecimiento justificado para valores inválidos que se aceptaban accidentalmente.

Prueba de aceptación: 12abc, decimales y calidad fuera de rango fallan antes de escribir; padding 0 funciona; crop debe tener cuatro enteros válidos y encajar en la imagen.

Disposición: Corregir ahora.

### F-07 La configuración falla de forma silenciosa o incompleta

Estado: Confirmado. Severidad: Media. Área: Configuración.

Referencia: [src/config/precedence.js:19](../../src/config/precedence.js#L19).

canvas no se aplica desde JSON. Un nombre de preset inexistente usa valores globales/defaults. JSON inválido advierte y continúa con defaults. No hay --no-trim u otras anulaciones para booleanos heredados.

Impacto y usos afectados: Los presets no son una receta reproducible cuando hay un error o se necesita desactivar un valor global.

Cambio propuesto: Resolver y validar una única configuración efectiva antes de ejecutar. Aplicar canvas, rechazar presets inexistentes y JSON inválido, y ofrecer negaciones para booleanos configurables. Mostrar valores efectivos con --debug.

Alternativa menos restrictiva: Conservar archivos actuales y sus presets. No imponer un formato nuevo; admitir los nombres de claves heredados mediante aliases.

Compatibilidad: Compatible con configuraciones válidas; dejar de continuar ante JSON roto cambia sólo el manejo de errores.

Prueba de aceptación: canvas en JSON mantiene 400x300 al pedir sólo altura 300 sobre 400x200; preset inexistente y JSON inválido fallan; --no-trim anula trim:true.

Disposición: Corregir ahora.

### F-08 Crop y canvas se combinan usando dimensiones anteriores

Estado: Confirmado. Severidad: Media. Área: Transformaciones.

Referencia: [src/processors/image.js:249](../../src/processors/image.js#L249).

--crop 0,0,100,100 --canvas --width 200 --height 200 sobre una imagen 400x200 termina con extract_area y no produce salida. metadata conserva dimensiones de la entrada antes de aplicar extract; trim también puede modificar el área útil.

Impacto y usos afectados: Las herramientas individuales son útiles, pero combinar flags exige dividir el proceso manualmente.

Cambio propuesto: Materializar la etapa trim/crop antes de calcular canvas, o mantener dimensiones efectivas verificadas. Garantizar un orden único de transformaciones.

Alternativa menos restrictiva: No prohibir crop+canvas: es una combinación legítima para preparar imágenes con medidas exactas.

Compatibilidad: Compatible; cambia únicamente combinaciones que daban resultados incorrectos o fallaban.

Prueba de aceptación: Crop 100x100 seguido de canvas 200x200 produce 200x200 con el recorte centrado; añadir casos con trim y crecimiento/reducción en ejes distintos.

Disposición: Corregir ahora.

### F-09 La interfaz Android conserva nombres y notas de Titanium e iOS

Estado: Confirmado. Severidad: Media. Área: Branding.

Referencia: [src/processors/alloy-modern/post-gen-notes.js:76](../../src/processors/alloy-modern/post-gen-notes.js#L76).

brand --sdk android --notification --notes muestra tiapp.xml y rutas app/platform/android aunque la salida está en app/src/main/res. --ios-padding controla marketplace, y --marketplace genera también iTunesConnect.png.

Impacto y usos afectados: Quien genera branding Android recibe pasos que no corresponden a su proyecto. El número de opciones supera lo necesario para la tarea.

Cambio propuesto: Construir las notas a partir del SDK y las categorías realmente generadas. Añadir --artwork-padding como nombre claro y conservar --ios-padding como alias. Definir artwork por destino antes de retirar archivos que puedan tener consumidores.

Alternativa menos restrictiva: Conservar --sdk android explícito, como decidió v3, y no prometer SDKs sin implementación. Mantener aliases para evitar romper scripts.

Compatibilidad: Compatible para nuevas notas y alias. Retirar iTunesConnect de Android sería una ruptura evitable y debe posponerse o hacerse opt-in.

Prueba de aceptación: Cada comando muestra sólo archivos generados y rutas del SDK elegido; las instrucciones pueden copiarse a un proyecto Android estándar sin nombres Titanium.

Disposición: Corregir ahora.

### F-10 Dry-run no valida todos los insumos y staging no contiene el borrado

Estado: Confirmado. Severidad: Media. Área: Previsualización.

Referencia: [src/processors/alloy-modern/index.js:135](../../src/processors/alloy-modern/index.js#L135).

Un monochrome-master inexistente se acepta en dry-run. La limpieza recibe projectRoot y puede borrar allí aunque la generación vaya a un staging separado.

Impacto y usos afectados: Una previsualización exitosa no asegura que la ejecución tenga todos los insumos; el usuario puede confundir staging con aislamiento de los borrados.

Cambio propuesto: Validar existencia/formato de todos los masters en un preflight compartido. Mostrar rutas exactas y separar generación y limpieza como acciones distinguibles en el plan. Mantener dry-run sin escrituras.

Alternativa menos restrictiva: No convertir dry-run en una generación completa costosa. La decodificación necesaria debe tener límites y no escribir resultados.

Compatibilidad: Compatible con el objetivo del preview. Mantener el flag actual mientras se propone un comando de limpieza dedicado.

Prueba de aceptación: Master auxiliar ausente falla también en dry-run; el plan identifica claramente cada borrado fuera del staging y no escribe ni elimina archivos.

Disposición: Corregir ahora.

### F-11 Los errores dejan masters intermedios

Estado: Confirmado. Severidad: Media. Área: Temporales.

Referencia: [src/processors/alloy-modern/index.js:169](../../src/processors/alloy-modern/index.js#L169).

brand --in-place con un monochrome-master inexistente termina con exit 1 y deja _master_square.png y _master_tight.png en .ti-branding. La limpieza está al final del camino de éxito.

Impacto y usos afectados: Ensucia el proyecto y deja estado parcial que confunde los siguientes intentos.

Cambio propuesto: Usar try/finally con seguimiento de los temporales creados. Mantener intacto cualquier archivo previo del usuario. Aplicar la misma regla a temporales de conversiones fallidas.

Alternativa menos restrictiva: No borrar toda una carpeta preexistente para simplificar la limpieza.

Compatibilidad: Compatible; protege contenido existente y elimina sólo temporales propios.

Prueba de aceptación: Provocar un error tras preparar el master y comprobar que no quedan archivos nuevos; contenido previo en .ti-branding permanece.

Disposición: Corregir ahora.

### F-12 El paquete exporta una entrada que ejecuta el CLI

Estado: Confirmado. Severidad: Informativa. Área: API JavaScript.

Referencia: [package.json:5](../../package.json#L5).

main apunta a src/index.js. require del paquete ejecuta el parser y termina con error de fuente en lugar de devolver una API de procesamiento.

Impacto y usos afectados: Importadores Node pueden confundir el paquete con una biblioteca. El README describe un CLI, por lo que no se confirma un contrato público de biblioteca incumplido.

Cambio propuesto: Declarar que la interfaz pública es el CLI. Diseñar una API de biblioteca sólo si aparece ese uso, separando runner de funciones sin efectos al importar.

Alternativa menos restrictiva: No reescribir todo a una biblioteca ni agregar una API sin consumidores.

Compatibilidad: Aceptar el alcance CLI actual; cualquier API futura debe tener contrato y pruebas propios.

Prueba de aceptación: Comprobar que README/package metadata no anuncian una API importable hasta que exista.

Disposición: Aceptar conscientemente.

### F-13 Persisten rutas antiguas y duplicación de precedencia

Estado: Confirmado. Severidad: Media. Área: Arquitectura.

Referencia: [src/cli/parser.js:6](../../src/cli/parser.js#L6).

parser.js todavía requiere minimist, que no es dependencia directa, y duplica precedencia. Hay routers/defaults antiguos y generadores iOS no expuestos; el handler vuelve a resolver la precedencia dentro del procesador. Sinon no tiene usos en src/test.

Impacto y usos afectados: Facilita arreglar una ruta que el CLI ya no usa y aumenta la carga al actualizar o añadir flags.

Cambio propuesto: Concentrar parseo y normalización en la entrada activa. Retirar módulos obsoletos tras comprobar consumidores internos/publicados; hacer explícita la frontera con los generadores compartidos. Evaluar retirar Sinon.

Alternativa menos restrictiva: No eliminar generadores sólo porque no estén expuestos al CLI; verificar si son compartidos o tienen consumidores fuera del repo.

Compatibilidad: Posponer eliminaciones hasta comprobar consumidores. La unificación de precedencia debe acompañar F-05/F-07.

Prueba de aceptación: Un solo resolvedor de opciones alimenta a cada procesador; ninguna ruta activa depende de una dependencia transitiva accidental.

Disposición: Corregir en fase posterior.

### F-14 Los comandos de desarrollo prometen rutas inexistentes y borran rutas generales

Estado: Confirmado. Severidad: Media. Área: Pruebas y herramientas.

Referencia: [package.json:26](../../package.json#L26).

test:unit y test:integration referencian directorios ausentes; test:all falla por esa razón. clean incluye app/, output/, *-preset/ y la configuración raíz. Antes de la actualización tampoco existía configuración ESLint.

Impacto y usos afectados: Contribuidores pueden usar comandos que fallan o eliminan trabajo ajeno a los tests. La suite pasa, pero no cubre varios fallos reproducidos.

Cambio propuesto: Conservar el nuevo ESLint config. Alinear scripts con suites reales y hacer que fixtures/config/salidas vivan en una carpeta temporal propia. Eliminar la dependencia de clean sobre carpetas generales.

Alternativa menos restrictiva: No quitar los tests existentes ni ejecutar limpiezas más amplias para conseguir un árbol limpio.

Compatibilidad: Compatible para lint y aislamiento; aliases de scripts antiguos pueden apuntar a suites reales durante una transición.

Prueba de aceptación: test:all ejecuta pruebas existentes; ningún clean/test borra una app/ ajena ni una configuración del usuario.

Disposición: Corregir ahora.

### F-15 La ayuda y los completadores no comparten la misma definición

Estado: Confirmado. Severidad: Baja. Área: Autocompletado.

Referencia: [src/cli/completions.js:69](../../src/cli/completions.js#L69).

Fish describe brand como Titanium. Zsh no completa flags específicos al entrar a los subcomandos; Bash decide principalmente según la palabra anterior. jpg tampoco aparece en FORMATS.

Impacto y usos afectados: Las opciones más largas y específicas son precisamente las que necesitan completado para ser prácticas.

Cambio propuesto: Derivar listas y descripciones de la definición Commander, con contexto de subcomando y argumentos de opción para los tres shells.

Alternativa menos restrictiva: Mantener la instalación actual y los paths; no introducir otro sistema de plugins o un shell obligatorio.

Compatibilidad: Compatible.

Prueba de aceptación: Completar brand --sdk sugiere android, alloy muestra sus opciones y formato incluye jpg en los tres shells.

Disposición: Corregir ahora.

### F-16 La ejecución sin argumentos falla antes de mostrar ayuda

Estado: Confirmado. Severidad: Baja. Área: Descubrimiento.

Referencia: [src/index.js:14](../../src/index.js#L14).

Con config vacía, imgconvert sin argumentos devuelve error de fuente y exit 1. program.help se encuentra después de parse, pero la acción general ya terminó el proceso. El alias -w tampoco existe pese a que es esperable junto a -q/-f/-o.

Impacto y usos afectados: El primer contacto con el CLI es un error y la nomenclatura de dimensiones requiere memorizar una excepción.

Cambio propuesto: Resolver la ausencia total de argumentos antes del dispatch. Mostrar ayuda con exit 0. Añadir -w como alias compatible, manteniendo -h para ayuda y --height para altura.

Alternativa menos restrictiva: Conservar todos los nombres largos y la compatibilidad numérica de -h existente; no recuperar -h como altura permanente.

Compatibilidad: Compatible; el nuevo alias es aditivo.

Prueba de aceptación: Sin argumentos muestra ayuda y no crea archivos; -w 100 equivale a --width 100.

Disposición: Corregir ahora.

### F-17 Versiones antiguas y requisito de runtime incorrecto

Estado: Confirmado. Severidad: Alta. Área: Dependencias.

Referencia: [package.json:9](../../package.json#L9).

npm outdated detectó actualizaciones en las nueve dependencias directas. npm audit registró 11 paquetes afectados, siete de severidad alta. Los avisos de Sharp afectan bibliotecas que procesan los formatos aceptados por la herramienta.

Impacto y usos afectados: Procesamiento de imágenes no confiables y mantenimiento del entorno. La presencia de avisos no demuestra explotación en esta Mac.

Cambio propuesto: Actualizado con autorización: nueve versiones latest, Node >=22.13.0, imports default, ESLint flat config y overrides glob/minimatch. Audit final sin avisos.

Alternativa menos restrictiva: No ejecutar audit fix --force ni aceptar las degradaciones sugeridas automáticamente. Se probaron overrides concretos con sus consumidores.

Compatibilidad: Ruptura justificada y aprobada: se abandona soporte de runtimes anteriores. Flags y procesadores se conservan.

Prueba de aceptación: 158 pruebas con el árbol anterior y 158 con el nuevo; 31 pruebas en Node 22.13; lint/audit/outdated satisfactorios.

Disposición: Corregir ahora (aplicado).

### F-18 El lote no tiene un límite explícito de concurrencia

Estado: Riesgo condicionado. Severidad: Media. Área: Rendimiento.

Referencia: [src/processors/image.js:593](../../src/processors/image.js#L593).

Promise.all inicia una tarea por imagen y Alloy hace lo mismo antes de iterar sus escalas. No hay --concurrency ni una cola propia. No se midió agotamiento de memoria con una carpeta grande.

Impacto y usos afectados: Directorios grandes con imágenes de alta resolución pueden acumular memoria y tareas pendientes. El tamaño y la plataforma determinan el impacto.

Cambio propuesto: Medir lotes representativos y añadir una cola con concurrencia configurable si confirma presión de recursos. Publicar un valor por defecto medido.

Alternativa menos restrictiva: Conservar procesamiento paralelo; no imponer ejecución secuencial ni un límite de cantidad de archivos sin mediciones.

Compatibilidad: Compatible mediante una opción aditiva.

Prueba de aceptación: Comparar memoria máxima/tiempo de lotes pequeños y grandes; todas las imágenes deben procesarse sin crecimiento proporcional de tareas activas.

Disposición: Corregir en fase posterior.

## 3. Áreas especiales

### Seguridad

Los límites relevantes son los archivos de entrada, las rutas de salida, la limpieza y los codecs nativos. F-01 y F-02 tienen consecuencias reales sobre archivos. Las alertas de dependencias iniciales justificaban actualizar, pero no prueban que este equipo haya sido comprometido. No se propone autenticación, cuentas o allowlists de carpetas para una herramienta local.

### Base de datos

No aplica: no hay base de datos, migraciones ni modelos persistentes.

### Archivos y almacenamiento

Hay un temporal por conversión y manejo de EXDEV, lo que resuelve el caso de unidades distintas. Faltan prevención de colisiones, una política explícita de sobrescritura, reemplazo correcto y limpieza en finally. La limpieza de branding debe quedar distinguida de la generación en staging.

### Rendimiento

Existe paralelismo por imagen y codecs nativos. El riesgo de memoria queda condicionado a medición; la revisión no convierte una lectura de Promise.all en una afirmación de agotamiento demostrado.

### Calidad de código

Los módulos de CLI, configuración y procesamiento ofrecen una base para corregir los problemas sin reescribir el proyecto. La normalización duplicada y los caminos anteriores a v3 aumentan las posibilidades de que un cambio no alcance la ruta real.

### Frontend, build y assets

No hay interfaz web. Los assets Android fueron inspeccionados como archivos generados, sin compilar una aplicación consumidora. La presencia de XML/PNG no demuestra por sí sola que un manifest o un tema los use correctamente.

### Dependencias y compatibilidad

El usuario aprobó adoptar Node >=22.13 y actualizar todas las dependencias. Versiones instaladas:

| Paquete         | Anterior instalado | Actual  |
| --------------- | ------------------ | ------- |
| chalk           | 4.1.2              | 6.0.1   |
| commander       | 12.1.0             | 15.1.0  |
| fast-xml-parser | 4.5.6              | 5.12.0  |
| sharp           | 0.33.5             | 0.35.5  |
| update-notifier | 6.0.2              | 7.3.1   |
| chai            | 5.2.0              | 6.3.0   |
| eslint          | 8.57.1             | 10.14.0 |
| mocha           | 11.4.0             | 12.0.3  |
| sinon           | 17.0.1             | 22.1.0  |

Actualizar sólo los paquetes directos todavía dejaba cinco avisos moderados. Los overrides `glob:^14.0.4` y `minimatch:^11.0.5` resuelven el árbol de herramientas sin degradar Mocha o ESLint. Se deben retirar cuando sus consumidores adopten rangos corregidos; no son un permiso para forzar futuras versiones mayores sin pruebas.

La instalación se hizo sin ejecutar lifecycle scripts, y se comprobó la carga del binario precompilado de Sharp. Referencia de instalación consultada: [install-defaults.md](/Users/cesar/.agents/skills/npm-supply-chain/references/install-defaults.md). No se modificaron credenciales, publicación ni configuración de la cuenta npm.

### Pruebas

La suite completa pasó antes y después de la actualización: `158 passing (26s)` y `158 passing (23s)`. Las pruebas de ayuda, configuración y lector XML también pasaron en el mínimo Node 22.13: `31 passing (2s)`.

Se ejecutaron 23 escenarios aislados de CLI antes y después de la actualización, sin diferencias en dimensiones, destinos o códigos de salida entre ambos árboles. Además se hizo una prueba de plan de limpieza con plataformas contradictorias y comprobaciones de temporales/importación. La conversión nativa PNG a WebP con redimensionado también produjo las medidas esperadas en Node 22.13. Estas reproducciones revelan huecos que la suite actual no detecta; los fallos funcionales todavía necesitan pruebas de regresión propias antes de corregirse.

Comandos de verificación y resultados:

```text
# En copias temporales, primero con el árbol anterior y luego con el actualizado
node node_modules/mocha/bin/mocha.js 'test/*.test.js' --timeout 300000
158 passing (26s)
158 passing (23s)

# Con el binario oficial de Node 22.13.0 y PATH ajustado para sus procesos hijo
node node_modules/mocha/bin/mocha.js test/help.test.js test/config.test.js test/tiapp-reader.test.js --timeout 30000
31 passing (2s)

npm run lint
eslint src
# exit 0

npm audit --json
"vulnerabilities": {}
"total": 0

npm outdated --json
{}
```

El código aplicado se comparó byte por byte con la copia que pasó las 158 pruebas. Los cambios posteriores fueron documentación y ampliar el alcance de lint a todo src; no hubo nuevas modificaciones del procesador.

### Producción y despliegue

Las dependencias y sus adaptaciones están guardadas en el proyecto. Los cambios guardados siguen el flujo SFTP existente; no se verificaron las transferencias. No hubo npm publish, cambio de versión, tag ni push. La próxima publicación debe explicar el cambio de mínimo Node; no se debe presentar como compatible con Node 14/18/20.

## 4. Matriz de decisión

Las disposiciones de corrección pendientes son propuestas. F-17 y la configuración ESLint de F-14 se aplicaron dentro de la actualización autorizada; los demás cambios de comportamiento no se implementaron.

| ID   | Hallazgo                                                                        | Severidad   | Disposición propuesta      | Compatibilidad           | Casos afectados        | Justificación                                                                   |
| ---- | ------------------------------------------------------------------------------- | ----------- | -------------------------- | ------------------------ | ---------------------- | ------------------------------------------------------------------------------- |
| F-01 | Colisiones y sobrescritura silenciosa                                           | Alta        | Corregir ahora             | Ruptura justificada      | Archivos               | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-02 | La orientación iPhone decide eliminaciones Android                              | Alta        | Corregir ahora             | Compatible               | Limpieza               | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-03 | Los errores no producen un resultado fiable para scripts                        | Alta        | Corregir ahora             | Compatible               | Automatización         | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-04 | --replace no reemplaza la entrada                                               | Media       | Corregir ahora             | Compatible               | Salida                 | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-05 | Los parámetros públicos de Alloy no llegan completos al procesador              | Media       | Corregir ahora             | Compatible               | Alloy                  | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-06 | La validación acepta valores que contradicen la ayuda                           | Media       | Corregir ahora             | Compatible               | Validación             | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-07 | La configuración falla de forma silenciosa o incompleta                         | Media       | Corregir ahora             | Compatible               | Configuración          | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-08 | Crop y canvas se combinan usando dimensiones anteriores                         | Media       | Corregir ahora             | Compatible               | Transformaciones       | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-09 | La interfaz Android conserva nombres y notas de Titanium e iOS                  | Media       | Corregir ahora             | Compatible               | Branding               | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-10 | Dry-run no valida todos los insumos y staging no contiene el borrado            | Media       | Corregir ahora             | Compatible               | Previsualización       | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-11 | Los errores dejan masters intermedios                                           | Media       | Corregir ahora             | Compatible               | Temporales             | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-12 | El paquete exporta una entrada que ejecuta el CLI                               | Informativa | Aceptar conscientemente    | Compatible (alcance CLI) | API JavaScript         | No hay contrato público de biblioteca que justifique crear una API nueva.       |
| F-13 | Persisten rutas antiguas y duplicación de precedencia                           | Media       | Corregir en fase posterior | Compatible               | Arquitectura           | Comprobar consumidores antes de retirar módulos; unificar al corregir opciones. |
| F-14 | Los comandos de desarrollo prometen rutas inexistentes y borran rutas generales | Media       | Corregir ahora             | Compatible               | Pruebas y herramientas | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-15 | La ayuda y los completadores no comparten la misma definición                   | Baja        | Corregir ahora             | Compatible               | Autocompletado         | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-16 | La ejecución sin argumentos falla antes de mostrar ayuda                        | Baja        | Corregir ahora             | Compatible               | Descubrimiento         | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-17 | Versiones antiguas y requisito de runtime incorrecto                            | Alta        | Corregir ahora (aplicado)  | Ruptura justificada      | Dependencias           | Evita resultados incorrectos o hace verificable el contrato del comando.        |
| F-18 | El lote no tiene un límite explícito de concurrencia                            | Media       | Corregir en fase posterior | Compatible               | Rendimiento            | Medir el problema antes de elegir límites.                                      |

## 5. Plan de corrección recomendado

### Fase 1 Protección de archivos

Resolver F-01/F-02 antes de ampliar funciones. Precalcular destinos, detectar colisiones y separar la evidencia de orientación por plataforma. Mantener dry-run sin escrituras. La introducción de --overwrite necesita aviso de migración para scripts que reemplazan destinos existentes. Aceptación: ningún recurso Android activo aparece como descartable por una preferencia iPhone y ningún lote pierde salidas por nombres coincidentes.

### Fase 2 Integridad de resultados

Resolver F-03/F-04/F-06/F-08/F-10/F-11 en handlers, validación y procesadores. Centralizar errores y resultados, definir reemplazo sin borrado implícito y materializar las transformaciones antes de calcular canvas. Añadir reproducciones de éxito parcial, crop/canvas, temporales y valores inválidos. Mantener la capacidad de procesar las imágenes válidas de un lote con errores.

### Fase 3 Contrato de opciones

Resolver F-05/F-07/F-09/F-15/F-16. Una configuración efectiva debe alimentar el procesador sin resolver precedencia de nuevo. Incorporar selección de grupos Alloy, anulaciones booleanas y completado por contexto. Las notas de branding se derivan del SDK y de los archivos generados. Mantener aliases y rutas documentadas durante la transición.

Propuesta de uso, todavía no implementada:

```bash
# El uso habitual se conserva
imgconvert photos -f webp -q 80
imgconvert portrait.jpg --width 400 --height 400 --fit cover
imgconvert logo.png --canvas --width 1024 --height 1024
imgconvert brand logo.svg --sdk android --adaptive --notification

# Extensiones propuestas del contrato
imgconvert photos -f webp --overwrite
imgconvert photo.jpg --in-place
imgconvert alloy --group icons -o /work/app
imgconvert photo.png -p web --no-trim
```

No recomiendo añadir muchos subcomandos para cada transformación. La conversión general debe seguir permitiendo expresar una receta en una línea. La separación útil es entre transformar imágenes, escalar recursos Alloy, generar branding y realizar limpieza destructiva. La semántica de salida debe ser visible en el plan o debug, sin cambiar silenciosamente las rutas relativas actuales.

### Fase 4 Compatibilidad y dependencias

F-17 ya se aplicó. Mantener el mínimo Node aprobado, el lockfile y la configuración ESLint. Documentar el cambio de runtime en la próxima publicación. Retirar overrides sólo después de verificar que los rangos superiores corrigen los avisos y repetir las pruebas afectadas.

### Fase 5 Rendimiento y mantenimiento

Medir F-18 con imágenes representativas antes de elegir concurrencia. Resolver F-13 al comprobar consumidores de módulos antiguos y al unificar el contrato de opciones. F-12 se acepta conscientemente: no hay necesidad demostrada de una API JavaScript pública.

### Fase 6 Pruebas, documentación y rollback

Completar F-14 con aislamiento de fixtures y scripts reales. Cada corrección debe introducir su prueba de aceptación, actualizar ayuda/README y aplicar Humanizer a los textos nuevos. Usar suites acotadas por cambio; repetir la suite completa sólo cuando el alcance compartido lo justifique.

La actualización actual puede revertirse restaurando package.json, package-lock.json y los imports modificados, retirando eslint.config.cjs y ejecutando npm ci. Restaurar sólo el lockfile no basta: Chalk 6 y los imports anteriores son incompatibles. Los cambios de API propuestos deben poder revertirse por grupos de commits, sin borrar imágenes generadas por el usuario.

La revisión funcional termina con esta matriz pendiente de decisión. Sólo se modificaron dependencias, sus adaptaciones de carga, la configuración de lint y la documentación asociada a la actualización autorizada.

## Fuentes de compatibilidad y avisos

- [Chalk releases](https://github.com/chalk/chalk/releases): versiones y migración de módulos.
- [Commander releases](https://github.com/tj/commander.js/releases): cambios de versión y runtime.
- [Migración a ESLint 10](https://eslint.org/docs/latest/use/migrate-to-10.0.0): configuración y compatibilidad.
- [Sharp 0.35.5](https://sharp.pixelplumbing.com/changelog/v0.35.5/): actualización del procesador de imágenes.
- [Aviso de libvips heredado por Sharp](https://github.com/advisories/GHSA-f88m-g3jw-g9cj): fundamento de actualización, sin afirmar explotación.
- [Aviso de glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) y [aviso de minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249): overrides del árbol de desarrollo.
- Metadatos latest del registro oficial npm y salidas locales npm outdated/npm audit, consultados el 2026-11-08.

## Disposición final de las correcciones

Implementación terminada el 2026-11-08 en `fix/cli-audit`, sobre la actualización de dependencias pendiente. Se conservaron los cambios anteriores y los tres PNG ajenos a la tarea. Tras la entrega verificada, el usuario autorizó organizar el trabajo en commits semánticos y cerrar las notas de sesión. Las capturas de la raíz se excluyeron. No se crearon tags ni publicaciones; no se cambió la versión ni se hizo push. Los commits se registran en `docs/project/status.md`.

| Hallazgo | Disposición final | Evidencia mantenida |
| --- | --- | --- |
| F-01 | Corregido | Plan común rechaza destinos duplicados y sobrescritura no autorizada; detecta salidas sobre otra entrada. Pruebas de colisión, sentinel y carrera de creación. |
| F-02 | Corregido con limpieza conservadora | Orientaciones iOS/Android separadas. Se exige launcher explícito y orientación vertical en todas las actividades, sin manifest externo contradictorio. Iconos/splash heredados se conservan si no se demuestra que están sin uso. |
| F-03 | Corregido | `parseAsync`, errores sin traza salvo debug, resultados estructurados y estados 0/1/2. Los lotes conservan salidas válidas. |
| F-04 | Corregido | `--in-place`, `--replace` y `--replace-originals`; actualización propia o archivo hermano, sin borrar el original al cambiar formato/nombre. |
| F-05 | Corregido | Alloy acepta fuentes configuradas, selecciona `-p`/`--group`, respeta `-o` y planifica los grupos juntos. Se mantienen las ocho escalas y sus rutas. |
| F-06 | Corregido | Validación común CLI/JSON: enteros completos, rangos, colores, posiciones, crop y booleanos. Padding cero válido. |
| F-07 | Corregido | Precedencia centralizada con null no especificado, false/0 explícitos, canvas desde JSON, negaciones y aliases coherentes. JSON/presets malformados o inexistentes fallan. |
| F-08 | Corregido | Trim, crop, resize/canvas y codificación en ese orden. Las etapas que cambian dimensiones se materializan. Pruebas de medidas y alpha. |
| F-09 | Corregido | `--artwork-padding` con alias `--ios-padding`; notas Android basadas en categorías y archivos realmente producidos. Se conservan ambos archivos marketplace. |
| F-10 | Corregido | Dry-run decodifica los masters suministrados, no escribe y muestra rutas exactas de generación y un plan separado de borrado en el proyecto. |
| F-11 | Corregido | Temporales exclusivos junto al destino y scratch exclusivo para masters; limpieza en finally sin eliminar temporales preexistentes del usuario. |
| F-12 | Aceptado: contrato CLI | Se documenta que importar el paquete no constituye una API JavaScript pública. No se añadió una API. |
| F-13 | Corregido | Se elimina la precedencia duplicada y la dependencia accidental de minimist. Se conservan adapters y generadores internos compartidos; Sinon se retiró tras comprobar usos. |
| F-14 | Corregido | Runner aislado, temporales exclusivos, cleanup seguro y aliases de test que ejecutan la suite real. |
| F-15 | Corregido | Opciones/valores/descripciones se derivan recursivamente de Commander; contexto de subcomando y argumentos, jpg, grupos y SDK Android. |
| F-16 | Corregido | Sin argumentos muestra ayuda con estado 0; `-w` es alias de width y `-h` sigue siendo ayuda. |
| F-17 | Corregido y conservado | Se mantiene la actualización de dependencias y Node >=22.13. Audit final: cero vulnerabilidades. |
| F-18 | Medido y corregido | Cola compartida por entrada, variantes dentro de una tarea, concurrencia configurable y default min(4, CPU disponibles). Benchmark en JSON junto al informe. |

### Verificación final

La suite completa terminó con 202 pruebas aprobadas en Node 22.23.2. Se ejecutó después de las regresiones por etapa y se repitió porque la revisión independiente encontró correcciones adicionales: renombrado sobre otra entrada, permiso de sobrescritura por plataforma Alloy y presets con estructura inválida. Las tres reproducciones fallaron antes de sus correcciones y pasaron después. También se cubrieron el completado de `config init --force` y los candidatos de archivos en Bash.

En Node 22.13.0 terminaron 57 pruebas enfocadas: contrato de conversión/Alloy/branding, operaciones y cola, orientación Android, completado, configuración y ayuda. Se corrigió la expansión de selectores del runner para evitar APIs recientes de glob en ese runtime.

`npm run lint`, `git diff --check`, `npm audit` y `npm pack --dry-run` terminaron correctamente. El paquete conserva versión 3.0.0 e incluye los módulos nuevos, las guías enlazadas y LICENSE. Se validaron cinco ejemplos JSON estrictos, enlaces y anclas locales en seis documentos, y el enlace externo de soporte devolvió HTTP 200. Bash pasó pruebas ejecutadas de contexto; Bash y Zsh pasaron validación de sintaxis.

El [benchmark](concurrency-benchmark.json) usa doce PNG fotográficos de 2400x1600 convertidos a WebP de ancho 1200 y calidad 85. Cada medición ejecuta un proceso CLI nuevo. Con concurrencia 1/2/4 se obtuvieron 2,147/1,095/0,728 segundos y RSS máximo de 120832000/142884864/199704576 bytes. Es una muestra por ajuste; no mide todos los codecs ni garantiza tiempos en otras máquinas.

No se verificaron sesiones interactivas de Zsh/Fish, semántica de archivos Windows/Linux, builds móviles ni telemetría de transferencia SFTP. Fish no está instalado en esta sesión; su script se comprobó mediante las definiciones compartidas y pruebas estáticas de opciones y valores. Estas limitaciones de entorno no equivalen a hallazgos funcionales pendientes en los flujos CLI probados.

### Compatibilidad y decisiones

Los destinos existentes requieren `--overwrite`. `--in-place` autoriza solamente el propio archivo; cambiar nombre o formato conserva el original y crea un hermano. `output` e `inPlace` efectivos son incompatibles. Un null hereda el siguiente valor disponible. README contiene ejemplos de migración.

Se rechazan cadenas de renombrado que escriben sobre otra entrada, incluso con overwrite, para evitar que la cola lea una salida previa como si fuera el original. El usuario puede expresarlas con destinos separados o varios comandos. La limpieza Android conserva archivos ante evidencia incompleta; esto puede dejar recursos prescindibles, pero no convierte una preferencia iPhone en autorización para eliminarlos.
