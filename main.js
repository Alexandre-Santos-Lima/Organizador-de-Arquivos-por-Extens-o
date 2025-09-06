// ---
// Projeto: Organizador de Arquivos por Extensão (CLI)
// Descrição: Este script Node.js varre um diretório especificado e move os arquivos
//            para subpastas com base em suas extensões (ex: .jpg, .png -> /imagens).
// Bibliotecas necessárias: Nenhuma. Utiliza apenas os módulos 'fs' e 'path' nativos do Node.js.
// Como executar: node main.js <caminho_do_diretorio>
// Exemplo: node main.js ./minha_pasta_baguncada
// ---

// Importa os módulos necessários do Node.js
// fs.promises para operações de arquivo assíncronas (mais moderno que callbacks)
// path para manipular caminhos de arquivo de forma segura em diferentes sistemas operacionais
const fs = require('fs').promises;
const path = require('path');

// Mapeamento de categorias de pastas para extensões de arquivo
// Facilmente extensível para novos tipos de arquivo
const FOLDER_MAPPING = {
  imagens: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
  documentos: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.rtf'],
  videos: ['.mp4', '.mkv', '.avi', '.mov', '.wmv'],
  audios: ['.mp3', '.wav', '.aac', '.flac'],
  arquivos_comprimidos: ['.zip', '.rar', '.7z', '.tar', '.gz'],
  codigo: ['.js', '.html', '.css', '.py', '.java', '.c', '.cpp', '.json', '.xml'],
};

/**
 * Encontra a pasta de destino para um arquivo com base em sua extensão.
 * @param {string} fileExtension - A extensão do arquivo (ex: '.jpg').
 * @returns {string} O nome da pasta de destino.
 */
function getDestinationFolder(fileExtension) {
  for (const folder in FOLDER_MAPPING) {
    if (FOLDER_MAPPING[folder].includes(fileExtension)) {
      return folder;
    }
  }
  // Se nenhuma categoria for encontrada, retorna 'outros'
  return 'outros';
}

/**
 * Função principal que organiza o diretório.
 * @param {string} directoryPath - O caminho para o diretório a ser organizado.
 */
async function organizeDirectory(directoryPath) {
  console.log(`Iniciando organização do diretório: ${directoryPath}`);

  try {
    // Lê todos os arquivos e pastas no diretório especificado
    const items = await fs.readdir(directoryPath);

    for (const item of items) {
      const itemPath = path.join(directoryPath, item);
      const itemStats = await fs.stat(itemPath);

      // Ignora subdiretórios e o próprio script para evitar auto-organização
      if (itemStats.isDirectory() || item === 'main.js') {
        continue;
      }

      // Obtém a extensão do arquivo em minúsculas
      const fileExtension = path.extname(item).toLowerCase();
      if (!fileExtension) continue; // Ignora arquivos sem extensão

      // Determina a pasta de destino
      const destinationFolder = getDestinationFolder(fileExtension);
      const destinationPath = path.join(directoryPath, destinationFolder);

      // Cria a pasta de destino se ela não existir
      // O { recursive: true } evita erros se a pasta já existir
      await fs.mkdir(destinationPath, { recursive: true });

      // Move o arquivo para a nova pasta
      const newFilePath = path.join(destinationPath, item);
      await fs.rename(itemPath, newFilePath);

      console.log(`Movido: ${item} -> ${destinationFolder}/`);
    }

    console.log('\nOrganização concluída com sucesso!');
  } catch (error) {
    console.error(`\nOcorreu um erro: ${error.message}`);
    if (error.code === 'ENOENT') {
        console.error('Verifique se o caminho do diretório está correto.');
    }
  }
}

// Ponto de entrada do script (IIFE - Immediately Invoked Function Expression)
// para permitir o uso de async/await no nível superior
(async () => {
  // Pega o caminho do diretório a partir dos argumentos da linha de comando
  // process.argv[0] é 'node', process.argv[1] é 'main.js'
  const targetDirectory = process.argv[2];

  if (!targetDirectory) {
    console.error('ERRO: Por favor, forneça o caminho para o diretório que deseja organizar.');
    console.error('Uso: node main.js <caminho_do_diretorio>');
    process.exit(1); // Encerra o script com um código de erro
  }

  // Converte caminhos relativos (como '.') para um caminho absoluto
  const absolutePath = path.resolve(targetDirectory);
  
  await organizeDirectory(absolutePath);
})();