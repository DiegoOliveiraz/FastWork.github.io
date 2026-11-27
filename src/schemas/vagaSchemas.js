import { z } from "zod";

const vazioParaUndefined = (valor) =>
  typeof valor === "string" && valor.trim() === "" ? undefined : valor;

const textoOpcional = (max) =>
  z.preprocess(vazioParaUndefined, z.string().trim().max(max).optional());

// Datas chegam do navegador em ISO 8601 UTC ("2026-12-01T11:00:00.000Z").
const dataOpcional = z.preprocess(vazioParaUndefined, z.iso.datetime().optional());

const ufOpcional = z.preprocess(
  vazioParaUndefined,
  z.string().trim().regex(/^[a-z]{2}$/i).transform((uf) => uf.toUpperCase()).optional(),
);

const salarioOpcional = z.preprocess(
  (valor) => (valor === "" || valor === null ? undefined : valor),
  z.number().min(0).max(99999999.99).optional(),
);

const camposEditaveis = {
  ds_descricao: textoOpcional(5000),
  ds_requisitos: textoOpcional(5000),
  tp_contrato: z.preprocess(vazioParaUndefined, z.enum(["CLT", "PJ", "freelance", "estagio"]).optional()),
  tp_modalidade: z.preprocess(vazioParaUndefined, z.enum(["presencial", "remoto", "hibrido"]).optional()),
  vl_salario: salarioOpcional,
  ds_cidade: textoOpcional(100),
  ds_estado: ufOpcional,
  dt_publicacao: dataOpcional,
  dt_encerramento: dataOpcional,
};

function validarPeriodo(dados, ctx) {
  if (dados.dt_publicacao && dados.dt_encerramento
    && new Date(dados.dt_encerramento) <= new Date(dados.dt_publicacao)) {
    ctx.addIssue({ code: "custom", path: ["dt_encerramento"], message: "Encerramento deve ser depois da abertura" });
  }
}

export const vagaCriacaoSchema = z
  .object({
    // nm_cargo guarda o TIPO da vaga (pedreiro, eletricista...). É ele que define quem pode se candidatar.
    nm_cargo: z.string().trim().min(2).max(150),
    ...camposEditaveis,
  })
  .superRefine(validarPeriodo);

// O tipo (nm_cargo) não muda depois de criada: candidaturas já feitas dependem dele.
export const vagaAtualizacaoSchema = z.object(camposEditaveis).superRefine(validarPeriodo);

export const candidaturaSchema = z.object({
  ds_carta_apresentacao: textoOpcional(2000),
});
