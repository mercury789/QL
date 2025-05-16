import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// получаем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sort(mode) {
  const folderPath = path.join(__dirname, 'video', mode);

  try {
    const files = await fs.readdir(folderPath);
    const mp4Files = files.filter(file => file.endsWith('.mp4'));

    mp4Files.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.match(/\d+/)?.[0] || 0);
      return numA - numB || a.localeCompare(b);
    });

    for (let index = 0; index < mp4Files.length; index++) {
      const file = mp4Files[index];
      const oldPath = path.join(folderPath, file);
      const tempPath = path.join(folderPath, `temp_${index + 1}.mp4`);
      await fs.rename(oldPath, tempPath);
      console.log(`${file} -> temp_${index + 1}.mp4`);
    }

    for (let index = 0; index < mp4Files.length; index++) {
      const tempPath = path.join(folderPath, `temp_${index + 1}.mp4`);
      const newPath = path.join(folderPath, `${index + 1}.mp4`);
      const stats = await fs.stat(tempPath);
      if (stats.isFile()) {
        await fs.rename(tempPath, newPath);
        console.log(`temp_${index + 1}.mp4 -> ${index + 1}.mp4`);
      }
    }

    return mp4Files.length;
  } catch (err) {
    console.error(`Ошибка обработки папки ${mode}:`, err);
    throw err;
  }
}

async function processAllModes() {
  const modes = ['general', 'absolute', 'lose', 'upgrade', 'finance'];
  const videoCounts = {};

  try {
    for (const mode of modes) {
      const count = await sort(mode);
      videoCounts[mode] = count;
    }
    console.log('Сортировка завершена.');

    const fileContent = `export const videos = {\n${Object.entries(videoCounts)
      .map(([key, value]) => `  ${key}: ${value}`)
      .join(',\n')},\n};\n`;

    await fs.writeFile(path.join(__dirname, 'videos.js'), fileContent);
    console.log('Файл videos.js успешно обновлен:');
    console.log(fileContent);
  } catch (err) {
    console.error('Процесс прерван из-за ошибки:', err);
  }
}

processAllModes().catch(err => console.error('Критическая ошибка:', err));
