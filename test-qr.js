const QRCode = require('qrcode');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function testQR() {
  console.log('🧪 Probando generación de QR...');
  
  // 1. Generar QR
  const url = 'http://localhost:5173/verificar/TEST-123';
  const qrDataURL = await QRCode.toDataURL(url);
  
  console.log('✅ QR generado');
  console.log('   Longitud:', qrDataURL.length);
  console.log('   Inicio:', qrDataURL.substring(0, 50));
  
  // 2. Extraer base64
  const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
  console.log('✅ Base64 extraído');
  console.log('   Longitud:', base64Data.length);
  
  // 3. Convertir a Buffer
  const qrImageBytes = Buffer.from(base64Data, 'base64');
  console.log('✅ Buffer creado');
  console.log('   Tamaño:', qrImageBytes.length, 'bytes');
  
  // 4. Crear PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  
  try {
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const qrDims = qrImage.scale(0.5);
    
    page.drawImage(qrImage, {
      x: 50,
      y: 200,
      width: qrDims.width,
      height: qrDims.height,
    });
    
    console.log('✅ QR insertado en PDF');
    console.log('   Dimensiones:', qrDims.width, 'x', qrDims.height);
    
  } catch (error) {
    console.error('❌ Error al insertar QR:', error.message);
    throw error;
  }
  
  // 5. Guardar PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('/tmp/test-qr-manual.pdf', pdfBytes);
  
  console.log('✅ PDF guardado: /tmp/test-qr-manual.pdf');
  console.log('   Tamaño:', pdfBytes.length, 'bytes');
}

testQR().catch(console.error);
