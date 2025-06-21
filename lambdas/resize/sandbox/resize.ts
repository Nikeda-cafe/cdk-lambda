
import Jimp from "jimp";
import path from "path";

const REPOSITORY_TOP = path.resolve(__dirname, '../../../');

async function main() {
  const imagePath = path.join(REPOSITORY_TOP, 'images/react.png');
  console.log(`Processing image: ${imagePath}`);

  const image = await Jimp.read(imagePath);
  image.resize(256, 256); // Resize to 256x256 pixels
  image.write('resaized.png'); // Save the resized image
}
main()
