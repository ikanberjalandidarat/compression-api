// src/compression/model.js
import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { pipeline } from 'stream';

// Image compression using TensorFlow.js
export async function imageCompression(imageBuffer) {
  try {
    // Convert image to tensor
    const image = await sharp(imageBuffer)
      .resize(800, null, { // Resize to max width of 800px
        withoutEnlargement: true,
        fit: 'inside'
      })
      .toBuffer();

    // Convert to tensor
    const tensor = tf.node.decodeImage(image);
    
    // Normalize the pixel values
    const normalized = tensor.div(255);
    
    // Apply compression using autoencoder
    const compressed = await compressWithAutoencoder(normalized);
    
    // Convert back to buffer
    const processedBuffer = await tf.node.encodePng(compressed.mul(255));
    
    return processedBuffer;
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
}

// Video compression using FFmpeg
export async function videoCompression(videoBuffer) {
  try {
    const tempInput = '/tmp/input.mp4';
    const tempOutput = '/tmp/output.mp4';
    
    // Write buffer to temporary file
    await promisify(pipeline)(
      videoBuffer,
      createWriteStream(tempInput)
    );

    // Compress video using FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .output(tempOutput)
        .videoCodec('libx264')
        .size('1280x?') // 720p
        .videoBitrate('1000k')
        .audioCodec('aac')
        .audioBitrate('128k')
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Read compressed video back to buffer
    const compressedBuffer = await readFile(tempOutput);
    
    // Clean up temp files
    await unlink(tempInput);
    await unlink(tempOutput);
    
    return compressedBuffer;
  } catch (error) {
    throw new Error(`Video compression failed: ${error.message}`);
  }
}

// Autoencoder model for image compression
async function compressWithAutoencoder(tensor) {
  // Load or create the model
  const model = await tf.loadLayersModel('file://./models/autoencoder/model.json') || createAutoencoder();
  
  return model.predict(tensor.expandDims());
}

// Create autoencoder model
function createAutoencoder() {
  const model = tf.sequential();
  
  // Encoder
  model.add(tf.layers.conv2d({
    inputShape: [null, null, 3],
    filters: 16,
    kernelSize: 3,
    activation: 'relu',
    padding: 'same'
  }));
  
  // Decoder
  model.add(tf.layers.conv2d({
    filters: 3,
    kernelSize: 3,
    activation: 'sigmoid',
    padding: 'same'
  }));
  
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
  });
  
  return model;
}
