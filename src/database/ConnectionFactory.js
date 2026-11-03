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
