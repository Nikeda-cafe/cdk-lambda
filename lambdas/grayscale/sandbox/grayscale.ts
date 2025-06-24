
import Jimp from "jimp";
import path from "path";

const REPOSITORY_TOP = path.resolve(__dirname, "../../../");

async function main() {
  const imagePath = path.join(REPOSITORY_TOP, 'images/react.png');
  const image = await Jimp.read(imagePath);

  image.grayscale(); // Convert to grayscale
  image.write('grayscale.png'); // Save the image
}
main()