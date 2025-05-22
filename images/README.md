# Imágenes de prueba

Este directorio contiene imágenes mínimas para pruebas.

Durante la ejecución de los tests, se crean archivos JPG y PNG mínimos válidos para realizar las pruebas.

Estos archivos son temporales y se limpian después de que los tests se completan.

## ¿Por qué no incluir las imágenes en el repositorio?

1. **Tamaño del repositorio**: Mantiene el repositorio pequeño al no incluir archivos binarios innecesarios.
2. **Simplicidad**: Evita problemas de licencias o derechos de autor con imágenes.
3. **Portabilidad**: Garantiza que las pruebas funcionen en cualquier entorno sin dependencias externas.

## Generación de imágenes

Las imágenes se generan automáticamente en el archivo `integration.test.js` con el tamaño mínimo posible para ser reconocidas como archivos de imagen válidos por las bibliotecas utilizadas.
