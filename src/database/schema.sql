REATE TABLE usuarios (
  id_usuario      SERIAL PRIMARY KEY,
  nm_usuario      VARCHAR(150) NOT NULL,
  ds_email        VARCHAR(150) NOT NULL UNIQUE,
  ds_senha        VARCHAR(255) NOT NULL,
  ds_telefone     VARCHAR(20),
  tp_usuario      VARCHAR(20)  NOT NULL CHECK (tp_usuario IN ('profissional', 'empresa')),
  st_ativo        BOOLEAN      NOT NULL DEFAULT true,
  dt_criacao      TIMESTAMP    NOT NULL DEFAULT now(),
  dt_atualizacao  TIMESTAMP
);

CREATE TABLE profissionais (
  id_profissional     SERIAL PRIMARY KEY,
  id_usuario          INTEGER NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  ds_logradouro       VARCHAR(200),
  ds_cidade           VARCHAR(100),
  ds_estado           CHAR(2),
  ds_cep              VARCHAR(10),
  ds_profissao        VARCHAR(100),
  ds_resumo           TEXT,
  ds_linkedin         VARCHAR(255),
  nr_experiencia      INTEGER,
  ds_habilidades      TEXT,
  st_aceite_termos    BOOLEAN NOT NULL DEFAULT false,
  st_disponibilidade  BOOLEAN NOT NULL DEFAULT true,
  dt_criacao          TIMESTAMP NOT NULL DEFAULT now(),
  dt_atualizacao      TIMESTAMP
);

CREATE TABLE empresas (
  id_empresa        SERIAL PRIMARY KEY,
  id_usuario        INTEGER NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  ds_cnpj           VARCHAR(18) NOT NULL UNIQUE,
  nm_fantasia       VARCHAR(150),
  nm_razao_social   VARCHAR(150),
  ds_setor          VARCHAR(100),
  ds_site           VARCHAR(255),
  ds_endereco       VARCHAR(200),
  ds_cidade         VARCHAR(100),
  ds_estado         CHAR(2),
  ds_descricao      TEXT,
  st_aceite_termos  BOOLEAN NOT NULL DEFAULT false,
  st_verificada     BOOLEAN NOT NULL DEFAULT false,
  dt_criacao        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE categorias (
  id_categorias  SERIAL PRIMARY KEY,
  nm_categoria   VARCHAR(100) NOT NULL,
  ds_icone       VARCHAR(100),
  st_ativo       BOOLEAN NOT NULL DEFAULT true,
  dt_criacao     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE vagas (
  id_vaga          SERIAL PRIMARY KEY,
  id_empresa       INTEGER NOT NULL REFERENCES empresas(id_empresa) ON DELETE CASCADE,
  id_categoria     INTEGER REFERENCES categorias(id_categorias),
  nm_cargo         VARCHAR(150) NOT NULL,
  ds_descricao     TEXT,
  ds_requisitos    TEXT,
  tp_contrato      VARCHAR(20) CHECK (tp_contrato IN ('CLT', 'PJ', 'freelance', 'estagio')),
  tp_modalidade    VARCHAR(20) CHECK (tp_modalidade IN ('presencial', 'remoto', 'hibrido')),
  vl_salario       NUMERIC(10,2),
  ds_cidade        VARCHAR(100),
  ds_estado        CHAR(2),
  st_vaga          VARCHAR(20) NOT NULL DEFAULT 'aberta' CHECK (st_vaga IN ('aberta', 'fechada', 'pausada')),
  dt_criacao       TIMESTAMP NOT NULL DEFAULT now(),
  dt_publicacao    TIMESTAMP,
  dt_encerramento  TIMESTAMP
);

CREATE TABLE candidaturas (
  id_candidatura         SERIAL PRIMARY KEY,
  id_profissional        INTEGER NOT NULL REFERENCES profissionais(id_profissional) ON DELETE CASCADE,
  id_vaga                INTEGER NOT NULL REFERENCES vagas(id_vaga) ON DELETE CASCADE,
  st_candidatura         VARCHAR(20) NOT NULL DEFAULT 'pendente'
                           CHECK (st_candidatura IN ('pendente', 'em_analise', 'aprovada', 'rejeitada')),
  ds_carta_apresentacao  TEXT,
  dt_candidatura         TIMESTAMP NOT NULL DEFAULT now(),
  dt_atualizacao         TIMESTAMP,
  UNIQUE (id_profissional, id_vaga) 
);

CREATE TABLE prof_categoria (
  id_profissional  INTEGER NOT NULL REFERENCES profissionais(id_profissional) ON DELETE CASCADE,
  id_categorias    INTEGER NOT NULL REFERENCES categorias(id_categorias) ON DELETE CASCADE,
  PRIMARY KEY (id_profissional, id_categorias)
);

CREATE INDEX idx_vagas_empresa      ON vagas (id_empresa);
CREATE INDEX idx_vagas_categoria    ON vagas (id_categoria);
CREATE INDEX idx_vagas_status       ON vagas (st_vaga);
CREATE INDEX idx_candidaturas_vaga  ON candidaturas (id_vaga);
CREATE INDEX idx_candidaturas_prof  ON candidaturas (id_profissional)