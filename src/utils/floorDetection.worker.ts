// src/utils/floorDetection.worker.ts

const applyTexture = async (
  originalImage: ImageBitmap,
  floorMask: ImageBitmap,
  textureImage: ImageBitmap
): Promise<ImageBitmap> => {
  const { width, height } = originalImage;

  // Main canvas for the final result
  const mainCanvas = new OffscreenCanvas(width, height);
  const mainCtx = mainCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

  // Temp canvas for creating the clipped texture
  const tempCanvas = new OffscreenCanvas(width, height);
  const tempCtx = tempCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;

  // Step 1: Create a pattern from the texture image on the temp canvas
  // Step 1: Create a scaled-up version of the texture to make it appear larger.
  const scaleFactor = 4;
  const scaledWidth = textureImage.width * scaleFactor;
  const scaledHeight = textureImage.height * scaleFactor;

  const scaledTextureCanvas = new OffscreenCanvas(scaledWidth, scaledHeight);
  const scaledTextureCtx = scaledTextureCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  scaledTextureCtx.drawImage(textureImage, 0, 0, scaledWidth, scaledHeight);

  // Step 2: Create a pattern from the *scaled* texture image
  const pattern = tempCtx.createPattern(scaledTextureCanvas, 'repeat');
  if (pattern) {
    tempCtx.fillStyle = pattern;
    tempCtx.fillRect(0, 0, width, height);
  }

  // Step 2: Use 'destination-in' to clip the texture.
  // This operation keeps the parts of the texture that overlap with the mask.
  tempCtx.globalCompositeOperation = 'destination-in';
  tempCtx.drawImage(floorMask, 0, 0);

  // Step 3: Draw the original image onto the main canvas.
  mainCtx.drawImage(originalImage, 0, 0);

  // Step 4: Draw the clipped texture (from the temp canvas) on top of the original image.
  mainCtx.drawImage(tempCanvas, 0, 0);

  return mainCanvas.transferToImageBitmap();
};

self.onmessage = async (event: MessageEvent) => {
  console.log('[WORKER] Received message:', event.data);
  const { type, id, payload } = event.data;

  try {
    let result: ImageBitmap;
    if (type === 'APPLY_TEXTURE') {
      console.log('[WORKER] APPLY_TEXTURE case started.');
      const { originalImage, floorMask, textureImage } = payload;
      result = await applyTexture(originalImage, floorMask, textureImage);
    } else {
      throw new Error(`Unknown message type: ${type}`);
    }
    self.postMessage({ type: 'SUCCESS', id, payload: result }, [result] as any);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred in the worker.';
    self.postMessage({ type: 'ERROR', id, payload: message });
  }
};