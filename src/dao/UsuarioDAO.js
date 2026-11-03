import { ConnectionFactory } from "../database/ConnectionFactory.js";
import { Usuario } from "../model/Usuario.js";

export class UsuarioDAO {
  constructor() {
    this.connectionFactory = new ConnectionFactory();
  }

  // Método para criar a tabela Usuário:
  createTable() {
    this.withConnection((connection) => {
      connection.exec(`
        CREATE TABLE IF NOT EXISTS usuario (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome VARCHAR(256) NOT NULL,
          nascimento TEXT
        )
      `);
      console.log("Tabela 'usuario' criada ou já existe!");
    });
  }

  // Método para inseriri um registro na tabela Usuário:
  create(usuario) {
    return this.withConnection((connection) => {
      connection
        .prepare("INSERT INTO usuario (nome, nascimento) VALUES (?, ?)")
        .run(usuario.nome, usuario.nascimento);

      usuario.id = this.readLastInsertedId(connection);
      console.log(`
        USUÁRIO GRAVADO NO BANCO DE DADOS: \n
        ID: ${usuario.id}\n
        NOME: ${usuario.nome}\n
        DATA DE NASCIMENTO: ${usuario.nascimento}
      `);
      return usuario;
    });
  }

  // Método para ler a chave primária do último registro inserido na tabela Usuário:
  readLastInsertedId(connection) {
    const row = connection.prepare("SELECT last_insert_rowid() AS id").get();
    if (!row || typeof row.id !== "number") {
      throw new Error("Não foi possível recuperar o identificador gerado.");
    }
    return row.id;
  }
  
  // Método para listar todos os usuários; usado pela rota GET /usuarios.
  readAll() {
    return this.withConnection((connection) => {
      const rows = connection
        .prepare("SELECT id, nome, nascimento FROM usuario ORDER BY id")
        .all();
      return rows.map((row) => this.mapRowToUsuario(row));
    });
  }
  
  // Método para ler um registro inserido na tabela Usuário:
  read(id) {
    return this.withConnection((connection) => {
      const row = connection
        .prepare("SELECT id, nome, nascimento FROM usuario WHERE id = ?")
        .get(id);

      if (!row) {
        return null;
      }

      return this.mapRowToUsuario(row);
    });
  }

  // Método para atualizar/modificar um registro inserido na tabela Usuário:
  update(usuario) {
    return this.withConnection((connection) => {
      const result = connection
        .prepare("UPDATE usuario SET nome = ?, nascimento = ? WHERE id = ?")
        .run(usuario.nome, usuario.nascimento, usuario.id);
      return result.changes > 0;
    });
  }

  // Método para excluir um registro inserido na tabela Usuário:
  delete(usuario) {
    this.withConnection((connection) => {
      connection.prepare("DELETE FROM usuario WHERE id = ?").run(usuario.id);
      console.log(`O usuario ${usuario.nome} foi removido do BD.`);
    });
  }

  mapRowToUsuario(row) {
    if (
      typeof row.id !== "number" ||
      typeof row.nome !== "string" ||
      (typeof row.nascimento !== "string" && row.nascimento !== null)
    ) {
      throw new Error("O banco retornou um registro de usuário inválido.");
    }

    return new Usuario(row.id, row.nome, row.nascimento);
  }

  withConnection(operation) {
    const connection = this.connectionFactory.createConnection();
    try {
      return operation(connection);
    } finally {
      connection.close();
    }
  }
}
