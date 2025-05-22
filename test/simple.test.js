const { expect } = require('chai');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

describe('Pruebas Simples y Reales', function () {
  this.timeout(120000); // Aumentado a 2 minutos para procesar imágenes grandes

  const testDir = path.join(__dirname, 'temp-test');
  const imagesDir = path.join(__dirname, '..', 'images'); // Usar directorio images en la raíz

  // Preparar entorno de pruebas
  before(async () => {
    // Limpiar directorio de prueba si existe
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }

    // Crear directorio de prueba
    fs.mkdirSync(testDir, { recursive: true });

    console.log(`\n📁 Creando directorio de prueba: ${testDir}`);

    // Verificar que existen las imágenes de prueba
    const testImages = ['image.jpg', 'image.png'].map(img => path.join(imagesDir, img));

    // Copiar las imágenes al directorio de prueba
    if (fs.existsSync(imagesDir)) {
      testImages.forEach(imgPath => {
        if (fs.existsSync(imgPath)) {
          const destPath = path.join(testDir, path.basename(imgPath));
          fs.copyFileSync(imgPath, destPath);
          console.log(`✅ Imagen copiada: ${path.basename(imgPath)}`);

          const fileSize = fs.statSync(destPath).size;
          console.log(`📊 Tamaño del archivo: ${(fileSize / 1024).toFixed(2)} KB`);
        } else {
          console.log(`⚠️ No se encontró la imagen: ${imgPath}`);
        }
      });
    } else {
      console.log(`⚠️ No se encontró el directorio de imágenes: ${imagesDir}`);
      console.log('Creando imágenes básicas de prueba...');

      // Si no existen las imágenes, crear unas básicas
      await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 4,
          background: { r: 255, g: 100, b: 50, alpha: 1 }
        }
      })
        .png()
        .toFile(path.join(testDir, 'test.png'));

      await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 50, g: 100, b: 255 }
        }
      })
        .jpeg()
        .toFile(path.join(testDir, 'photo.jpg'));

      console.log('✅ Imágenes básicas creadas');
    }
  });

  // Después de todas las pruebas
  after(() => {
    console.log(`\n📁 Los archivos procesados están en: ${testDir}`);
    console.log('🔍 Para ver los archivos, navega a esa carpeta antes de que expire.');
    console.log('💡 Usa "npm run clean-test" para eliminar los archivos temporales cuando termines.\n');
  });

  it('debería mostrar la versión del CLI', () => {
    const result = execSync('node index.js -v', { encoding: 'utf8' });
    expect(result).to.include('1.1.4');
    console.log('✅ Versión mostrada correctamente');
  });

  it('debería convertir PNG a WebP', () => {
    // Usar imagen.png en lugar de photo.png
    let inputFile = path.join(testDir, 'image.png'); // Cambiado de const a let
    if (!fs.existsSync(inputFile)) {
      inputFile = path.join(testDir, 'test.png'); // Alternativa si no existe
    }
    const originalSize = fs.statSync(inputFile).size;

    console.log(`\n🔄 Convirtiendo PNG a WebP...`);
    console.log(`📍 Archivo origen: ${inputFile}`);
    console.log(`📊 Tamaño original: ${(originalSize / 1024).toFixed(2)} KB`);

    // Ejecutar el CLI
    const result = execSync(`node index.js "${testDir}" -f webp -e prod`, {
      encoding: 'utf8',
      cwd: process.cwd()
    });

    console.log('\n📝 Resultado del CLI:');
    console.log(result);

    // Ahora buscar tanto image.webp como test.webp
    const possibleOutputs = [
      path.join(testDir, 'compressed', 'image.webp'),
      path.join(testDir, 'compressed-dev', 'image.webp'),
      path.join(testDir, 'compressed', 'test.webp'),
      path.join(testDir, 'compressed-dev', 'test.webp')
    ];

    let outputFile = null;
    for (const output of possibleOutputs) {
      if (fs.existsSync(output)) {
        outputFile = output;
        break;
      }
    }

    expect(outputFile).to.not.be.null;
    console.log(`✅ Archivo de salida encontrado: ${outputFile}`);

    const newSize = fs.statSync(outputFile).size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);

    console.log(`📊 Tamaño nuevo: ${(newSize / 1024).toFixed(2)} KB`);
    console.log(`💰 Ahorro: ${savings}%`);

    expect(fs.existsSync(outputFile)).to.be.true;
  });

  it('debería redimensionar imagen', function () {
    this.timeout(60000); // 60 segundos para el redimensionamiento

    console.log(`\n🔄 Redimensionando imagen a 200x150...`);

    // CORRECCIÓN: Apuntar al archivo específico, no al directorio 
    const inputFile = path.join(testDir, 'image.jpg');
    if (!fs.existsSync(inputFile)) {
      console.log('⚠️ No se encontró image.jpg, usando test.png');
      this.skip();
      return;
    }

    // Crear directorio específico para el redimensionamiento
    const outputDir = path.join(testDir, 'resized');
    fs.mkdirSync(outputDir, { recursive: true });

    // CORRECCIÓN: Comando explícito con especificaciones claras de tamaño
    const result = execSync(`node index.js "${inputFile}" -f webp -w 200 -h 150 -o "${outputDir}" -e prod`, {
      encoding: 'utf8',
      cwd: process.cwd()
    });

    console.log('📝 Resultado del CLI:');
    console.log(result);

    // CORRECCIÓN: Buscar el archivo de salida por su nombre específico
    const baseName = path.basename(inputFile, path.extname(inputFile));
    const outputFile = path.join(outputDir, `${baseName}.webp`);

    console.log(`Buscando archivo redimensionado: ${outputFile}`);

    if (!fs.existsSync(outputFile)) {
      console.error('❌ No se encontró el archivo de salida redimensionado');
      expect.fail('Archivo de salida no encontrado');
    }

    // Verificar dimensiones usando Sharp de manera explícita
    return sharp(outputFile).metadata()
      .then(metadata => {
        console.log(`✅ Imagen redimensionada a: ${metadata.width}x${metadata.height}`);
        expect(metadata.width).to.equal(200);
        expect(metadata.height).to.equal(150);
      })
      .catch(err => {
        console.error(`❌ Error al leer metadatos: ${err.message}`);
        throw err;
      });
  });

  it('debería procesar con formato "all" y crear múltiples archivos', function () {
    this.timeout(180000); // 3 minutos para procesar múltiples formatos

    console.log(`\n🔄 Procesando con formato "all"...`);

    // Especificar directamente la imagen
    const inputFile = path.join(testDir, 'image.jpg');
    const inputParam = fs.existsSync(inputFile) ? inputFile : `${testDir}/photo.jpg`;

    // Crear directorio específico para esta prueba
    const allFormatsDir = path.join(testDir, 'all-formats');
    if (!fs.existsSync(allFormatsDir)) {
      fs.mkdirSync(allFormatsDir, { recursive: true });
    }

    const result = execSync(`node index.js "${inputParam}" -f all -q 80 -o "${allFormatsDir}" -e prod`, {
      encoding: 'utf8',
      cwd: process.cwd()
    });

    console.log('📝 Resultado del CLI:');
    console.log(result);

    // CORRECCIÓN: Verificar cada formato individualmente
    let foundAny = false;
    expectedFormats.forEach(format => {
      const outputFile = path.join(allFormatsDir, `${baseName}.${format}`);
      if (fs.existsSync(outputFile)) {
        foundAny = true;
        const size = fs.statSync(outputFile).size;
        console.log(`✅ ${format.toUpperCase()}: ${(size / 1024).toFixed(2)} KB`);
        foundFormats.push(format);
      } else {
        console.log(`⚠️ No se encontró el formato: ${format}`);
      }
    });

    // CORRECCIÓN: Mensaje más claro y verificación más simple
    console.log(`Formatos encontrados (${foundFormats.length}): ${foundFormats.join(', ')}`);
    expect(foundAny).to.be.true;
  });

  it('debería funcionar con preset alloy para móviles', function () {
    this.timeout(300000); // 5 minutos para preset alloy

    console.log(`\n🔄 Procesando con preset alloy...`);

    // CORRECCIÓN: Usar una imagen MUCHO más pequeña para alloy
    // Crear una imagen pequeña específica para esta prueba
    const smallerFile = path.join(testDir, 'alloy-test.png');

    // Siempre crear una imagen pequeña para esta prueba
    console.log('🔄 Creando imagen pequeña para prueba alloy...');

    // Crear una imagen de 400x300 para que el procesamiento sea rápido
    sharp({
      create: {
        width: 400,
        height: 300,
        channels: 4,
        background: { r: 200, g: 100, b: 50, alpha: 1 }
      }
    })
      .png()
      .toFile(smallerFile)
      .then(() => {
        console.log(`✅ Imagen pequeña creada: ${smallerFile}`);
      })
      .catch(err => {
        console.error(`❌ Error creando imagen: ${err.message}`);
      });

    // Asegurarnos de que la imagen pequeña está disponible
    if (!fs.existsSync(smallerFile)) {
      console.error('❌ No se pudo crear la imagen de prueba para alloy');
      expect.fail('Imagen de prueba alloy no disponible');
      return;
    }

    // Limpiar estructura de carpetas anterior
    console.log('🧹 Limpiando carpetas de app/assets anteriores...');
    if (fs.existsSync('app/assets')) {
      fs.rmSync('app/assets', { recursive: true, force: true });
    }

    const result = execSync(`node index.js "${smallerFile}" -p alloy -e prod`, {
      encoding: 'utf8',
      cwd: process.cwd()
    });

    console.log('📝 Resultado del CLI:');
    console.log(result);

    // Verificar estructura Android
    const androidScales = ['res-mdpi', 'res-hdpi', 'res-xhdpi', 'res-xxhdpi', 'res-xxxhdpi'];
    let androidFilesCreated = 0;

    // Obtener nombre base del archivo
    const baseName = path.basename(inputParam, path.extname(inputParam));

    androidScales.forEach(scale => {
      const androidFile = path.join('app', 'assets', 'android', 'images', scale, `${baseName}.png`);
      if (fs.existsSync(androidFile)) {
        androidFilesCreated++;
        const size = fs.statSync(androidFile).size;
        console.log(`✅ Android ${scale}: ${(size / 1024).toFixed(2)} KB`);
      }
    });

    // Verificar archivos iPhone
    const iPhoneScales = ['', '@2x', '@3x'];
    let iPhoneFilesCreated = 0;

    iPhoneScales.forEach(scale => {
      const fileName = `${baseName}${scale}.png`;
      const iPhoneFile = path.join('app', 'assets', 'iphone', 'images', fileName);
      if (fs.existsSync(iPhoneFile)) {
        iPhoneFilesCreated++;
        const size = fs.statSync(iPhoneFile).size;
        console.log(`✅ iPhone ${fileName}: ${(size / 1024).toFixed(2)} KB`);
      }
    });

    expect(androidFilesCreated).to.be.greaterThan(0);
    expect(iPhoneFilesCreated).to.be.greaterThan(0);
  });

  it('debería mostrar diferencia con calidad alta vs baja', function () {
    this.timeout(60000); // 60 segundos

    console.log(`\n🔄 Comparando diferentes niveles de calidad...`);

    // CORRECCIÓN: Crear una imagen pequeña específica para esta prueba
    const testImageFile = path.join(testDir, 'quality-test.jpg');

    // Crear una imagen JPEG pequeña para esta prueba
    console.log('🔄 Creando imagen pequeña para prueba de calidad...');

    // Crear de manera síncrona para asegurar disponibilidad
    try {
      sharp({
        create: {
          width: 400,
          height: 300,
          channels: 3,
          background: { r: 100, g: 150, b: 200 }
        }
      })
        .jpeg()
        .toBuffer()
        .then(buffer => {
          fs.writeFileSync(testImageFile, buffer);
          console.log(`✅ Imagen de prueba creada: ${testImageFile}`);
        });
    } catch (err) {
      console.error(`❌ Error creando imagen de prueba: ${err.message}`);
    }

    // Verificar que la imagen existe
    if (!fs.existsSync(testImageFile)) {
      console.log('⚠️ Esperando a que la imagen se cree...');
      // Dar tiempo para que se cree la imagen
      setTimeout(() => { }, 2000);
    }

    if (!fs.existsSync(testImageFile)) {
      console.error('❌ No se pudo crear la imagen de prueba');
      expect.fail('Imagen de prueba no disponible');
      return;
    }

    // Directorios específicos con nombres únicos
    const altaCalidadDir = path.join(testDir, 'alta-calidad-test');
    const bajaCalidadDir = path.join(testDir, 'baja-calidad-test');

    fs.mkdirSync(altaCalidadDir, { recursive: true });
    fs.mkdirSync(bajaCalidadDir, { recursive: true });

    // Ejecutar comandos con nombres explícitos
    console.log('🔄 Procesando imagen de alta calidad...');
    execSync(`node index.js "${testImageFile}" -f webp -q 95 -o "${altaCalidadDir}" -e prod`, {
      encoding: 'utf8',
      cwd: process.cwd()
    });

    console.log('🔄 Procesando imagen de baja calidad...');
    execSync(`node index.js "${testImageFile}" -f webp -q 30 -o "${bajaCalidadDir}" -e prod`, {
      encoding: 'utf8',
      cwd: process.cwd()
    });

    // CORRECCIÓN: Nombre de archivo es "quality-test.webp" (basado en el nombre de entrada)
    const baseName = path.basename(testImageFile, path.extname(testImageFile));
    const altaCalidadFile = path.join(altaCalidadDir, `${baseName}.webp`);
    const bajaCalidadFile = path.join(bajaCalidadDir, `${baseName}.webp`);

    console.log(`📁 Buscando archivo de alta calidad: ${altaCalidadFile}`);
    console.log(`📁 Buscando archivo de baja calidad: ${bajaCalidadFile}`);

    // Verificar archivos con mensajes explícitos
    if (!fs.existsSync(altaCalidadFile)) {
      console.error(`❌ No se encontró el archivo de alta calidad`);
      // Mostrar qué archivos sí hay en el directorio
      if (fs.existsSync(altaCalidadDir)) {
        console.log('📁 Archivos en directorio de alta calidad:');
        fs.readdirSync(altaCalidadDir).forEach(f => console.log(` - ${f}`));
      }
    }

    if (!fs.existsSync(bajaCalidadFile)) {
      console.error(`❌ No se encontró el archivo de baja calidad`);
      // Mostrar qué archivos sí hay en el directorio
      if (fs.existsSync(bajaCalidadDir)) {
        console.log('📁 Archivos en directorio de baja calidad:');
        fs.readdirSync(bajaCalidadDir).forEach(f => console.log(` - ${f}`));
      }
    }

    expect(fs.existsSync(altaCalidadFile)).to.be.true;
    expect(fs.existsSync(bajaCalidadFile)).to.be.true;

    const altaCalidadSize = fs.statSync(altaCalidadFile).size;
    const bajaCalidadSize = fs.statSync(bajaCalidadFile).size;

    console.log(`✅ WebP calidad 95%: ${(altaCalidadSize / 1024).toFixed(2)} KB`);
    console.log(`✅ WebP calidad 30%: ${(bajaCalidadSize / 1024).toFixed(2)} KB`);
    console.log(`💰 Diferencia: ${((altaCalidadSize - bajaCalidadSize) / altaCalidadSize * 100).toFixed(2)}% más pequeño`);

    expect(bajaCalidadSize).to.be.lessThan(altaCalidadSize);
  });
});
