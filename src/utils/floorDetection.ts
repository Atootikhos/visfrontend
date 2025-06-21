export const detectFloor = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch('https://vis-worker-backend.atootikhos.workers.dev/api/detect', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Try to parse error text, but fall back to status text if it fails
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = response.statusText;
      }
      throw new Error(errorText || 'Failed to detect floor.');
    }

    // The worker returns the image blob directly
    const imageBlob = await response.blob();
    // Create a URL for the blob to be used in the application
    return URL.createObjectURL(imageBlob);
  } catch (error) {
    console.error('Error detecting floor:', error);
    throw error;
  }
};

// Create a single worker instance to be reused.
const worker = new Worker(new URL('./floorDetection.worker.ts', import.meta.url), {
  type: 'module',
});

// Map to store pending requests with their resolve/reject callbacks.
const pendingRequests = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }>();

// Listen for messages from the worker.
worker.onmessage = (event: MessageEvent) => {
  const { type, id, payload } = event.data;
  const request = pendingRequests.get(id);

  if (request) {
    if (type === 'SUCCESS') {
      request.resolve(payload);
    } else if (type === 'ERROR') {
      request.reject(new Error(payload));
    }
    pendingRequests.delete(id);
  }
};

worker.onerror = (error: ErrorEvent) => {
  console.error('Unhandled worker error:', error);
  // Reject all pending requests if the worker crashes.
  for (const [id, request] of pendingRequests.entries()) {
    request.reject(new Error('Worker crashed or encountered a critical error.'));
    pendingRequests.delete(id);
  }
};

/**
 * Generates a unique ID for a request.
 * @returns A unique string identifier.
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Posts a message to the worker and returns a promise that resolves with the result.
 * @param type The type of the message to send ('DETECT' or 'APPLY_TEXTURE').
 * @param payload The data to send with the message.
 * @param transfer A list of transferable objects.
 * @returns A promise that resolves with the worker's response.
 */
const postRequest = <T>(type: string, payload: any, transfer: Transferable[] = []): Promise<T> => {
  return new Promise((resolve, reject) => {
    const requestId = generateRequestId();
    pendingRequests.set(requestId, { resolve, reject });
    console.log(`[MANAGER] ${type} called. Posting message to worker with requestId:`, requestId);
    worker.postMessage({ type, id: requestId, payload }, transfer);
  });
};

/**
 * Applies a texture to an image using the worker.
 * @param originalImage The original image as an ImageBitmap.
 * @param floorMask The floor mask as an ImageBitmap.
 * @param textureUrl The URL of the texture image.
 * @returns A promise that resolves with an ImageBitmap of the final textured image.
 */
export const applyTexture = async (
  originalImage: ImageBitmap,
  floorMask: ImageBitmap,
  textureUrl: string
): Promise<ImageBitmap> => {
  const response = await fetch(textureUrl);
  const blob = await response.blob();
  const textureImage = await createImageBitmap(blob);

  return postRequest<ImageBitmap>(
    'APPLY_TEXTURE',
    { originalImage, floorMask, textureImage },
    [originalImage, floorMask, textureImage]
  );
};
