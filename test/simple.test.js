const { expect } = require('chai');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Pruebas del CLI imgconvert', function () {
  this.timeout(120000);

  const testDir = path.join(__dirname, 'temp-test');
  const imagesDir = path.join(__dirname, '..', 'images');

  before(() => {
    // Limpiar y crear directorio de prueba
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    // Copiar imágenes reales al directorio de prueba
    ['image.jpg', 'image.png'].forEach(img => {
      const src = path.join(imagesDir, img);
      const dest = path.join(testDir, img);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copiado: ${img}`);
      }
    });
  });

  after(() => {
    console.log(`\n📁 Archivos de prueba en: ${testDir}`);
  });

  it('debería mostrar la versión', () => {
    const result = execSync('node index.js -v', { encoding: 'utf8' });
    expect(result).to.include('1.1.4');
  });

  it('debería procesar image.png a WebP', () => {
    const result = execSync(`node index.js "${path.join(testDir, 'image.png')}" -f webp -e prod`, {
      encoding: 'utf8'
    });

    console.log('PNG a WebP:', result);
    expect(result).to.include('Processed files: 1');

    const outputFile = path.join(testDir, 'compressed', 'image.webp');
    expect(fs.existsSync(outputFile)).to.be.true;
  });

  it('debería procesar image.jpg a WebP', () => {
    const result = execSync(`node index.js "${path.join(testDir, 'image.jpg')}" -f webp -e prod`, {
      encoding: 'utf8'
    });

    console.log('JPG a WebP:', result);
    expect(result).to.include('Processed files: 1');

    const outputFile = path.join(testDir, 'compressed', 'image.webp');
    expect(fs.existsSync(outputFile)).to.be.true;
  });

  it('debería redimensionar image.jpg', () => {
    const outputDir = path.join(testDir, 'resized');

    const result = execSync(`node index.js "${path.join(testDir, 'image.jpg')}" -w 200 -h 150 -o "${outputDir}" -e prod`, {
      encoding: 'utf8'
    });

    console.log('Redimensionar:', result);
    expect(result).to.include('Processed files: 1');
  });

  it('debería procesar con formato "all"', () => {
    const outputDir = path.join(testDir, 'all-formats');

    const result = execSync(`node index.js "${path.join(testDir, 'image.jpg')}" -f all -o "${outputDir}" -e prod`, {
      encoding: 'utf8'
    });

    console.log('Formato ALL:', result);
    expect(result).to.include('Processed files: 1');
  });

  it('debería funcionar con preset alloy', () => {
    if (fs.existsSync('app/assets')) {
      fs.rmSync('app/assets', { recursive: true, force: true });
    }

    const result = execSync(`node index.js "${path.join(testDir, 'image.png')}" -p alloy -e prod`, {
      encoding: 'utf8'
    });

    console.log('Preset Alloy:', result);
    expect(result).to.include('Processed files: 2');

    // Verificar que se crearon archivos Android e iPhone
    expect(fs.existsSync('app/assets/android')).to.be.true;
    expect(fs.existsSync('app/assets/iphone')).to.be.true;
  });

  it('debería comparar diferentes calidades', () => {
    const altaDir = path.join(testDir, 'alta');
    const bajaDir = path.join(testDir, 'baja');

    // Alta calidad
    execSync(`node index.js "${path.join(testDir, 'image.jpg')}" -f webp -q 95 -o "${altaDir}" -e prod`);

    // Baja calidad  
    execSync(`node index.js "${path.join(testDir, 'image.jpg')}" -f webp -q 30 -o "${bajaDir}" -e prod`);

    const altaFile = path.join(altaDir, 'image.webp');
    const bajaFile = path.join(bajaDir, 'image.webp');

    expect(fs.existsSync(altaFile)).to.be.true;
    expect(fs.existsSync(bajaFile)).to.be.true;

    const altaSize = fs.statSync(altaFile).size;
    const bajaSize = fs.statSync(bajaFile).size;

    console.log(`Alta: ${altaSize} bytes, Baja: ${bajaSize} bytes`);
    expect(bajaSize).to.be.lessThan(altaSize);
  });
});
