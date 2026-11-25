import { z } from "zod";

const textoOpcional = (max) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(max).optional(),
);

const emailSchema = z.string().trim().max(150).email().transform((email) => email.toLowerCase());
const senhaSchema = z.string()
  .min(8)
  .max(72)
  .refine((senha) => Buffer.byteLength(senha, "utf8") <= 72);

const telefoneSchema = z.string()
  .trim()
  .max(20)
  .regex(/^[+\d\s().-]+$/)
  .refine((telefone) => {
    const quantidadeDigitos = telefone.replace(/\D/g, "").length;
    return quantidadeDigitos >= 10 && quantidadeDigitos <= 13;
  });

const ufSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().regex(/^[a-z]{2}$/i).transform((uf) => uf.toUpperCase()).optional(),
);

const cepSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(10).regex(/^\d{5}-?\d{3}$/).optional(),
);

const urlOpcional = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(255).url().optional(),
);

const camposUsuario = z.object({
  nm_usuario: z.string().trim().min(1).max(150),
  ds_email: emailSchema,
  ds_senha: senhaSchema,
  ds_telefone: telefoneSchema,
});

export const loginSchema = z.object({
  ds_email: emailSchema,
  ds_senha: senhaSchema,
});

const camposProfissional = z.object({
  ds_logradouro: textoOpcional(200),
  ds_cidade: textoOpcional(100),
  ds_estado: ufSchema,
  ds_cep: cepSchema,
  ds_profissao: textoOpcional(100),
  ds_resumo: textoOpcional(10000),
  ds_linkedin: urlOpcional,
  nr_experiencia: z.number().int().min(0).max(2147483647).optional(),
  ds_habilidades: textoOpcional(10000),
  st_aceite_termos: z.boolean().optional(),
  st_disponibilidade: z.boolean().optional(),
});

export const profissionalCadastroSchema = camposUsuario.merge(camposProfissional);
export const usuarioCadastroSchema = profissionalCadastroSchema;

export const usuarioAtualizacaoSchema = z.object({
  nm_usuario: camposUsuario.shape.nm_usuario.optional(),
  ds_email: emailSchema.optional(),
  ds_senha: senhaSchema.optional(),
  ds_telefone: telefoneSchema.optional(),
}).merge(camposProfissional.partial());

const camposEmpresa = z.object({
  ds_cnpj: z.string().trim().min(1).max(18),
  nm_fantasia: textoOpcional(150),
  nm_razao_social: textoOpcional(150),
  ds_setor: textoOpcional(100),
  ds_site: urlOpcional,
  ds_endereco: textoOpcional(200),
  ds_cidade: textoOpcional(100),
  ds_estado: ufSchema,
  ds_descricao: textoOpcional(10000),
  st_aceite_termos: z.boolean().optional(),
});

export const empresaCadastroSchema = camposUsuario.merge(camposEmpresa);

export const empresaAtualizacaoSchema = z.object({
  nm_usuario: camposUsuario.shape.nm_usuario.optional(),
  ds_email: emailSchema.optional(),
  ds_senha: senhaSchema.optional(),
  ds_telefone: telefoneSchema.optional(),
}).merge(camposEmpresa.omit({ ds_cnpj: true }).partial());
