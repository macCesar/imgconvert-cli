# Guía de Pruebas para imgconvert-cli

## Instalación de dependencias

Antes de ejecutar las pruebas, asegúrate de instalar todas las dependencias:

```bash
npm install
```

## Ejecución de pruebas

### Error común: "Please provide a source file or folder"

Si al ejecutar las pruebas obtienes este error, es porque Node está tratando de ejecutar la aplicación real en lugar de solo las pruebas. Esto puede solucionarse de dos formas:

1. **Opción 1**: Establecer NODE_ENV como "test" antes de ejecutar:

```bash
NODE_ENV=test npm test
```

2. **Opción 2**: Modificar el script de test en package.json para incluir esta variable de entorno:

```json
"scripts": {
  "test": "NODE_ENV=test mocha test/*.test.js"
}
```

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar un archivo de prueba específico

Si deseas ejecutar solo un archivo de prueba específico, puedes usar:

```bash
# Para utils.test.js (las pruebas más sencillas)
NODE_ENV=test npx mocha test/utils.test.js

# Para process.test.js (pruebas de procesamiento de imágenes)
NODE_ENV=test npx mocha test/process.test.js

# Para cli.test.js (pruebas de línea de comandos)
NODE_ENV=test npx mocha test/cli.test.js

# Para integration.test.js (pruebas de integración)
NODE_ENV=test npx mocha test/integration.test.js
```

## Errores comunes en las pruebas

Las pruebas pueden fallar por varios motivos:

1. **Errores de path.dirname recibiendo undefined**: Las pruebas que usan proxyquire pueden fallar si no proporcionas stubs adecuados para todos los métodos de path.

2. **Errores en el procesamiento de imágenes**: Las pruebas de integración que procesan imágenes reales pueden fallar si no tienes las imágenes de prueba o si sharp no está configurado correctamente.

3. **Errores de asignación en utils.test.js**: Si las propiedades como utils.args o utils.config no están configuradas correctamente.

## Cómo corregir los errores más comunes

1. **Para problemas con path.dirname**:
   - Asegúrate de que tus stubs de path manejen correctamente los valores undefined.

2. **Para errores de imágenes en pruebas de integración**:
   - Comenta temporalmente estas pruebas o crea manualmente las imágenes de prueba.

3. **Para errores de utils.getEffectiveQuality**:
   - Verifica que las propiedades del módulo (args, presets, config) estén configuradas correctamente antes de cada prueba.

## Estructura de pruebas

El proyecto contiene los siguientes archivos de prueba:

1. **utils.test.js**: Prueba las funciones utilitarias básicas como `normalizeOutputSubfolder` y `getEffectiveQuality`.

2. **process.test.js**: Prueba las funciones principales de procesamiento de imágenes como `processImage` y `processImageWithScaling`.  

3. **cli.test.js**: Prueba la interfaz de línea de comandos, incluyendo el análisis de argumentos y la aplicación de configuraciones.

4. **integration.test.js**: Pruebas de integración que ejecutan el CLI completo con diferentes argumentos.

## Preparación del entorno de prueba

Para las pruebas de integración, se crean automáticamente archivos de imagen de prueba mínimos en el directorio temporal `test/test-images`. Estos archivos se eliminan después de ejecutar las pruebas.

## Depuración de pruebas

Para ver más información durante la ejecución de pruebas, puedes usar la opción `--verbose`:

```bash
npx mocha test/process.test.js --verbose
```

## Añadir nuevas pruebas

Al añadir nuevas pruebas:

1. Identifica el archivo apropiado según lo que quieras probar
2. Usa la estructura existente como guía
3. Asegúrate de que las pruebas sean independientes y no afecten otras pruebas

## Consejos

- Las pruebas de utils son las más sencillas para empezar a comprender la estructura
- Las pruebas de process son más complejas pero muestran cómo probar el procesamiento de imágenes
- Las pruebas de integración son las más completas pero lentas
