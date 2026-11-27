-- ════════════════════════════════════════════════════════════════════════════════
-- 002_bd2_vagas.sql  ·  BD2 (triggers, stored procedure, functions, views, índices)
-- ════════════════════════════════════════════════════════════════════════════════
--
-- ONDE COLOCAR: Neon Console → seu projeto → SQL Editor → cole o arquivo TODO → Run.
--   (ou: psql "$DATABASE_URL" -f src/database/migrations/002_bd2_vagas.sql)
--
-- É OPCIONAL: o sistema de vagas funciona sem rodar este arquivo. Ele existe para a
-- entrega de BD2 e pode ser executado várias vezes (usa IF NOT EXISTS / OR REPLACE).
-- Execute DEPOIS do schema.sql (tabelas usuarios, empresas, profissionais, vagas, candidaturas).
--
-- Cada seção diz: ONDE (o que cria) · USADO POR (que parte do código se relaciona).
-- ════════════════════════════════════════════════════════════════════════════════


-- ── 1. HISTÓRICO DE CANDIDATURAS (tabela nova) ──────────────────────────────────
-- ONDE:      cria a tabela candidaturas_historico.
-- USADO POR: trigger trg_candidatura_historico (seção 3). Nenhuma rota do app lê esta tabela
--            ainda; consulte pelo SQL Editor ou crie a rota quando quiser exibir a linha do tempo.
CREATE TABLE IF NOT EXISTS candidaturas_historico (
  id_historico    SERIAL PRIMARY KEY,
  id_candidatura  INTEGER     NOT NULL REFERENCES candidaturas(id_candidatura) ON DELETE CASCADE,
  st_anterior     VARCHAR(20),
  st_novo         VARCHAR(20) NOT NULL,
  dt_mudanca      TIMESTAMP   NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS idx_historico_candidatura ON candidaturas_historico (id_candidatura);

-- A tabela vagas não tem dt_atualizacao (candidaturas e profissionais têm).
ALTER TABLE vagas ADD COLUMN IF NOT EXISTS dt_atualizacao TIMESTAMP;


-- ── 2. TRIGGER FUNCTIONS ─────────────────────────────────────────────────────────
-- ONDE:      funções chamadas pelos triggers da seção 3.
-- USADO POR: automático, em todo INSERT/UPDATE (inclusive os feitos pelas transações de
--            src/repositories/candidaturaRepository.js).

-- 2.1 Carimba dt_atualizacao (em UTC, igual ao que o código grava).
CREATE OR REPLACE FUNCTION fn_trg_atualiza_dt() RETURNS trigger AS $$
BEGIN
  NEW.dt_atualizacao := (now() AT TIME ZONE 'UTC');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.2 Registra toda mudança de status de uma candidatura.
CREATE OR REPLACE FUNCTION fn_trg_candidatura_historico() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO candidaturas_historico (id_candidatura, st_anterior, st_novo)
    VALUES (NEW.id_candidatura, NULL, NEW.st_candidatura);
  ELSIF NEW.st_candidatura IS DISTINCT FROM OLD.st_candidatura THEN
    INSERT INTO candidaturas_historico (id_candidatura, st_anterior, st_novo)
    VALUES (NEW.id_candidatura, OLD.st_candidatura, NEW.st_candidatura);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.3 Defesa em profundidade: o banco recusa candidatura em vaga que não está aberta,
--     mesmo se alguém inserir direto no SQL. O app já checa isso antes (responde 409);
--     se o trigger disparar, o app traduz o erro P0001 também em 409.
CREATE OR REPLACE FUNCTION fn_trg_bloqueia_candidatura_vaga_inativa() RETURNS trigger AS $$
DECLARE
  v vagas%ROWTYPE;
  agora TIMESTAMP := (now() AT TIME ZONE 'UTC');
BEGIN
  SELECT * INTO v FROM vagas WHERE id_vaga = NEW.id_vaga;
  IF v.st_vaga <> 'aberta'
     OR (v.dt_publicacao IS NOT NULL AND v.dt_publicacao > agora)
     OR (v.dt_encerramento IS NOT NULL AND v.dt_encerramento <= agora) THEN
    RAISE EXCEPTION 'Vaga % não está aberta para candidaturas', NEW.id_vaga;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── 3. TRIGGERS ──────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_vagas_atualiza_dt ON vagas;
CREATE TRIGGER trg_vagas_atualiza_dt
  BEFORE UPDATE ON vagas
  FOR EACH ROW EXECUTE FUNCTION fn_trg_atualiza_dt();

DROP TRIGGER IF EXISTS trg_candidaturas_atualiza_dt ON candidaturas;
CREATE TRIGGER trg_candidaturas_atualiza_dt
  BEFORE UPDATE ON candidaturas
  FOR EACH ROW EXECUTE FUNCTION fn_trg_atualiza_dt();

DROP TRIGGER IF EXISTS trg_candidatura_historico ON candidaturas;
CREATE TRIGGER trg_candidatura_historico
  AFTER INSERT OR UPDATE OF st_candidatura ON candidaturas
  FOR EACH ROW EXECUTE FUNCTION fn_trg_candidatura_historico();

DROP TRIGGER IF EXISTS trg_bloqueia_candidatura_vaga_inativa ON candidaturas;
CREATE TRIGGER trg_bloqueia_candidatura_vaga_inativa
  BEFORE INSERT ON candidaturas
  FOR EACH ROW EXECUTE FUNCTION fn_trg_bloqueia_candidatura_vaga_inativa();


-- ── 4. STORED PROCEDURE e FUNCTION ───────────────────────────────────────────────
-- 4.1 STORED PROCEDURE: encerrar vaga (mesma regra da transação do app, dentro do banco).
-- ONDE:      uso manual:  CALL sp_encerrar_vaga(<id_vaga>, <id_empresa>, 0);
-- USADO POR: equivale a candidaturaRepository.encerrarVaga(). Para o app chamar a procedure,
--            troque o corpo desse método por: await q("CALL sp_encerrar_vaga($1, $2, 0)", [...]).
--            (Hoje o app faz os mesmos passos em JavaScript, dentro de BEGIN/COMMIT.)
CREATE OR REPLACE PROCEDURE sp_encerrar_vaga(
  IN    p_id_vaga    INTEGER,
  IN    p_id_empresa INTEGER,
  INOUT p_rejeitadas INTEGER DEFAULT 0
) AS $$
DECLARE
  v vagas%ROWTYPE;
  agora TIMESTAMP := (now() AT TIME ZONE 'UTC');
BEGIN
  SELECT * INTO v FROM vagas WHERE id_vaga = p_id_vaga FOR UPDATE;   -- trava a linha da vaga
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vaga % não encontrada', p_id_vaga;
  END IF;
  IF v.id_empresa <> p_id_empresa THEN
    RAISE EXCEPTION 'A vaga % não pertence à empresa %', p_id_vaga, p_id_empresa;
  END IF;
  IF v.st_vaga = 'fechada' THEN
    RAISE EXCEPTION 'A vaga % já está encerrada', p_id_vaga;
  END IF;

  UPDATE vagas
     SET st_vaga = 'fechada',
         dt_encerramento = LEAST(COALESCE(dt_encerramento, agora), agora)
   WHERE id_vaga = p_id_vaga;

  UPDATE candidaturas
     SET st_candidatura = 'rejeitada'
   WHERE id_vaga = p_id_vaga AND st_candidatura IN ('pendente', 'em_analise');
  GET DIAGNOSTICS p_rejeitadas = ROW_COUNT;
END;
$$ LANGUAGE plpgsql;

-- 4.2 FUNCTION: ranking de candidatos de uma vaga (window function RANK).
-- ONDE:      uso manual:  SELECT * FROM fn_ranking_candidatos(<id_vaga>);
-- USADO POR: equivale à consulta de candidaturaRepository.listarPorVaga().
CREATE OR REPLACE FUNCTION fn_ranking_candidatos(p_id_vaga INTEGER)
RETURNS TABLE (
  posicao INTEGER, id_candidatura INTEGER, nm_usuario VARCHAR, ds_profissao VARCHAR,
  nr_experiencia INTEGER, st_candidatura VARCHAR
) AS $$
  SELECT RANK() OVER (ORDER BY COALESCE(p.nr_experiencia, 0) DESC)::INTEGER,
         c.id_candidatura, u.nm_usuario, p.ds_profissao, p.nr_experiencia, c.st_candidatura
    FROM candidaturas c
    JOIN profissionais p ON p.id_profissional = c.id_profissional
    JOIN usuarios u      ON u.id_usuario = p.id_usuario
   WHERE c.id_vaga = p_id_vaga AND u.st_ativo = true
   ORDER BY 1, c.dt_candidatura;
$$ LANGUAGE sql STABLE;


-- ── 5. VIEWS ─────────────────────────────────────────────────────────────────────
-- 5.1 Vagas com a contagem de candidaturas por status.
-- USADO POR: equivale a vagaRepository.listarDaEmpresa(). Para o app usar a view, troque a
--            consulta por: SELECT * FROM vw_vagas_resumo WHERE id_empresa = $1
CREATE OR REPLACE VIEW vw_vagas_resumo AS
SELECT v.id_vaga, v.id_empresa, v.nm_cargo, v.st_vaga,
       v.dt_publicacao, v.dt_encerramento,
       COUNT(c.id_candidatura)::INTEGER                                              AS total_candidaturas,
       (COUNT(c.id_candidatura) FILTER (WHERE c.st_candidatura = 'pendente'))::INTEGER   AS pendentes,
       (COUNT(c.id_candidatura) FILTER (WHERE c.st_candidatura = 'em_analise'))::INTEGER AS em_analise,
       (COUNT(c.id_candidatura) FILTER (WHERE c.st_candidatura = 'aprovada'))::INTEGER   AS aprovadas,
       (COUNT(c.id_candidatura) FILTER (WHERE c.st_candidatura = 'rejeitada'))::INTEGER  AS rejeitadas
  FROM vagas v
  LEFT JOIN candidaturas c ON c.id_vaga = v.id_vaga
 GROUP BY v.id_vaga;

-- 5.2 Vagas abertas x profissionais disponíveis por profissão.
-- USADO POR: equivale a relatorioRepository.demandaOferta().
CREATE OR REPLACE VIEW vw_demanda_oferta_profissao AS
WITH demanda AS (
  SELECT lower(btrim(nm_cargo)) AS profissao, COUNT(*)::INTEGER AS vagas_abertas
    FROM vagas
   WHERE st_vaga = 'aberta'
     AND (dt_publicacao IS NULL OR dt_publicacao <= (now() AT TIME ZONE 'UTC'))
     AND (dt_encerramento IS NULL OR dt_encerramento > (now() AT TIME ZONE 'UTC'))
   GROUP BY 1
), oferta AS (
  SELECT lower(btrim(p.ds_profissao)) AS profissao, COUNT(*)::INTEGER AS profissionais_disponiveis
    FROM profissionais p JOIN usuarios u ON u.id_usuario = p.id_usuario
   WHERE u.st_ativo = true AND p.st_disponibilidade = true AND p.ds_profissao IS NOT NULL
   GROUP BY 1
)
SELECT COALESCE(d.profissao, o.profissao)          AS profissao,
       COALESCE(d.vagas_abertas, 0)                AS vagas_abertas,
       COALESCE(o.profissionais_disponiveis, 0)    AS profissionais_disponiveis
  FROM demanda d FULL JOIN oferta o ON o.profissao = d.profissao;


-- ── 6. ÍNDICES ───────────────────────────────────────────────────────────────────
-- ONDE:      aceleram as consultas acima e os filtros da lista de vagas (src/repositories/*).
CREATE INDEX IF NOT EXISTS idx_candidaturas_vaga_status ON candidaturas (id_vaga, st_candidatura);
CREATE INDEX IF NOT EXISTS idx_vagas_cargo ON vagas (lower(btrim(nm_cargo)));
CREATE INDEX IF NOT EXISTS idx_prof_profissao ON profissionais (lower(btrim(ds_profissao)));


-- ── 7. (OPCIONAL, NÃO EXECUTA) PAPEL REAL DE ADMINISTRADOR ───────────────────────
-- Hoje o "administrador das vagas" é a própria conta de EMPRESA (cada empresa gerencia as suas).
-- Se um dia quiser um administrador global, o banco precisa aceitar esse tipo de conta:
--
--   ALTER TABLE usuarios DROP CONSTRAINT usuarios_tp_usuario_check;
--   ALTER TABLE usuarios ADD  CONSTRAINT usuarios_tp_usuario_check
--     CHECK (tp_usuario IN ('profissional', 'empresa', 'admin'));
--
-- e o código precisaria de: login de admin, exigirTipo('admin') nas rotas e uma empresa
-- escolhida na hora de criar a vaga (vagas.id_empresa é obrigatório).


-- ── 8. (OPCIONAL, NÃO EXECUTA) COMO DESFAZER TUDO ────────────────────────────────
--   DROP VIEW IF EXISTS vw_demanda_oferta_profissao, vw_vagas_resumo;
--   DROP FUNCTION IF EXISTS fn_ranking_candidatos(INTEGER);
--   DROP PROCEDURE IF EXISTS sp_encerrar_vaga(INTEGER, INTEGER, INTEGER);
--   DROP TRIGGER IF EXISTS trg_bloqueia_candidatura_vaga_inativa ON candidaturas;
--   DROP TRIGGER IF EXISTS trg_candidatura_historico ON candidaturas;
--   DROP TRIGGER IF EXISTS trg_candidaturas_atualiza_dt ON candidaturas;
--   DROP TRIGGER IF EXISTS trg_vagas_atualiza_dt ON vagas;
--   DROP FUNCTION IF EXISTS fn_trg_bloqueia_candidatura_vaga_inativa(), fn_trg_candidatura_historico(), fn_trg_atualiza_dt();
--   DROP TABLE IF EXISTS candidaturas_historico;
--   ALTER TABLE vagas DROP COLUMN IF EXISTS dt_atualizacao;
