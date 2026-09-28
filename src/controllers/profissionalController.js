import profissionalRepository from '../repositories/profissionalRepository.js';

export async function listarProfissionais(req, res) {
  try {
    const page = Number.parseInt(req.query.page ?? '1', 10);
    const limit = Number.parseInt(req.query.limit ?? '10', 10);

    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        ok: false,
        erro: 'O parâmetro page deve ser um número maior que zero',
      });
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        ok: false,
        erro: 'O parâmetro limit deve estar entre 1 e 100',
      });
    }

    const profissao = req.query.profissao
      ? String(req.query.profissao).trim()
      : null;

    const cidade = req.query.cidade
      ? String(req.query.cidade).trim()
      : null;

    let disponivel = null;

    if (req.query.disponivel !== undefined) {
      if (req.query.disponivel === 'true') {
        disponivel = true;
      } else if (req.query.disponivel === 'false') {
        disponivel = false;
      } else {
        return res.status(400).json({
          ok: false,
          erro: 'O parâmetro disponivel deve ser true ou false',
        });
      }
    }

    const offset = (page - 1) * limit;

    const resultado = await profissionalRepository.readPaginated({
      profissao: profissao || null,
      cidade: cidade || null,
      disponivel,
      limit,
      offset,
    });

    res.json({
      ok: true,
      profissionais: resultado.profissionais,
      paginacao: {
        pagina: page,
        limite: limit,
        total: resultado.total,
        totalPaginas: Math.ceil(resultado.total / limit),
      },
    });
  } catch (erro) {
    console.error('Erro ao listar profissionais:', erro);

    res.status(500).json({
      ok: false,
      erro: 'Erro interno ao listar profissionais',
    });
  }
}