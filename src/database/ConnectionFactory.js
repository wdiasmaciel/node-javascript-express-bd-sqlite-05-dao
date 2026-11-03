import { DatabaseSync } from "node:sqlite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * import.meta.url é uma metapropriedade disponível nos 
 * módulos JavaScript. Ela contém a URL do módulo atual.
 * No Windows, seu valor seria semelhante a:
 * file:///C:/Users/.../node-typescript-api-crud-com-express-sqlite-e-padrao-dao/src/database/ConnectionFactory.js
 * Depois, dirname(...) obtém somente o diretório desse arquivo:
 * C:/Users/.../node-typescript-api-crud-com-express-sqlite-e-padrao-dao/src/database
 */
const defaultDatabasePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "./", // O banco de dados será criado no diretório corrente.
  "teste.db", // Nome do arquivo do banco de dados.
);

export class ConnectionFactory {

  /*
   * ??: usa o caminho padrão apenas quando SQLITE_DB_PATH é null ou undefined. 
   * ||: também usa o padrão quando o valor é vazio (""), 0 ou false.
   * Como variáveis de ambiente são strings, a diferença prática aqui é quando 
   * SQLITE_DB_PATH existe, mas está vazia:
   * ??: mantém "" como caminho.
   * ||: trata "" como não configurada e usa defaultDatabasePath.
   * Se um valor vazio deve significar “usar o padrão”, use ||. 
   * Se prefere detectar e reportar uma configuração vazia como inválida, mantenha ?? 
   * e valide-a explicitamente.
   */
  constructor() {
    this.databasePath = process.env.SQLITE_DB_PATH ?? defaultDatabasePath;
  }

  createConnection() {
    try {
      const connection = new DatabaseSync(this.databasePath);
      console.log("Conexão com SQLite estabelecida!");
      return connection;
    } catch (error) {
      console.error("Não foi possível estabelecer conexão com SQLite!");
      throw error;
    }
  }
}

/*
 * O || avalia os valores "falsy":
 * null
 * undefined
 * ""
 * 0
 * false
 * NaN
 * 0n.
 * No código, por ser uma variável de ambiente, 
 * process.env.SQLITE_DB_PATH será tipicamente 
 * uma string:
 * this.databasePath = process.env.SQLITE_DB_PATH || defaultDatabasePath;
 * Assim, uma string vazia ("") usa defaultDatabasePath. 
 * Diferentemente de ??, que mantém "":
 * this.databasePath = process.env.SQLITE_DB_PATH ?? defaultDatabasePath;
 * 
 * Deixe || se uma variável vazia ("") deve ser tratada como 
 * não configurada:
 * this.databasePath = process.env.SQLITE_DB_PATH || defaultDatabasePath;
 * Troque por ?? se você quer aceitar somente null ou undefined 
 * como ausência:
 * this.databasePath = process.env.SQLITE_DB_PATH ?? defaultDatabasePath;
 * Neste caso, uma string vazia será mantida como caminho e poderá 
 * causar erro ao abrir o banco. Como process.env tipicamente usa 
 * apenas strings, strings vazias devem ser validadas ou tratadas 
 * com ||:
 * const configuredPath = process.env.SQLITE_DB_PATH?.trim();
 * this.databasePath = configuredPath || defaultDatabasePath;
 * 
 * Para o comportamento mais esperado de uma variável de ambiente 
 * opcional, mantenha ||.
 */