import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO, decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system/legacy";

export type ClassificationResult = {
  className: string;
  probability: number;
  isTopResult: boolean;
};

const labels: string[] = require("../assets/models/classification/labels.json").labels;
const modelJson = require("../assets/models/classification/model.json");
const modelWeights = require("../assets/models/classification/model.weights.bin");

let modelPromise: Promise<tf.LayersModel> | null = null;

function loadClassificationModel(): Promise<tf.LayersModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      await tf.ready();
      return tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
    })().catch((error: unknown) => {
      modelPromise = null;
      throw error;
    });
  }

  return modelPromise;
}

export async function classifyImage(
  imageUri: string
): Promise<ClassificationResult[]> {
  if (!imageUri.trim()) {
    throw new Error("An image URI is required to classify an image.");
  }

  const model = await loadClassificationModel();
  const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const imageBytes = tf.util.encodeString(imageBase64, "base64");
  const input = tf.tidy(() =>
    tf.image.resizeBilinear(decodeJpeg(imageBytes), [224, 224])
      .div(255)
      .expandDims(0)
  );

  let prediction: tf.Tensor | undefined;

  try {
    const modelOutput = model.predict(input);
    if (Array.isArray(modelOutput)) {
      modelOutput.forEach((tensor) => tensor.dispose());
      throw new Error("The classification model returned multiple outputs.");
    }

    prediction = modelOutput;
    if (
      prediction.shape.length !== 2 ||
      prediction.shape[0] !== 1 ||
      prediction.shape[1] !== labels.length
    ) {
      throw new Error("The classification model output does not match its labels.");
    }

    const probabilities = Array.from(await prediction.data());
    const topResultIndex = probabilities.indexOf(Math.max(...probabilities));

    return labels.map((className, index) => ({
      className,
      probability: probabilities[index],
      isTopResult: index === topResultIndex,
    }));
  } finally {
    input.dispose();
    prediction?.dispose();
  }
}
