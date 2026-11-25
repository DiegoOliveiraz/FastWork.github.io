// Conteúdo das páginas institucionais do FastWork.
// Para criar uma nova página, adicione uma chave aqui e um link para
// institucional.html?pagina=<chave>. Nenhum HTML novo é necessário.
const PAGINAS_INSTITUCIONAIS = {
  "acessibilidade": {
    "titulo": "Acessibilidade",
    "chamada": "Inclusão",
    "cabecalho": "Acessibilidade",
    "resumo": "A página reúne orientações básicas para navegação mais clara, legibilidade e uso com leitores de tela.",
    "cartoes": [
      {
        "titulo": "Contraste",
        "texto": "As áreas principais usam fundo escuro e destaque azul para facilitar a leitura."
      },
      {
        "titulo": "Navegação",
        "texto": "A estrutura usa navbar e cartões simples para manter o caminho visual direto."
      },
      {
        "titulo": "Suporte",
        "texto": "Se encontrar barreiras de uso, a página de ajuda concentra o contato e os próximos passos."
      }
    ]
  },
  "em-breve": {
    "titulo": "Em Breve",
    "chamada": "Novidade",
    "cabecalho": "Em breve",
    "resumo": "Estamos preparando novas áreas, novos serviços e mais ferramentas para melhorar a experiência no FastWork.",
    "cartoes": [
      {
        "titulo": "Novas funções",
        "texto": "Mais recursos para cadastro, busca e organização das oportunidades.",
        "icone": "bi-stars"
      },
      {
        "titulo": "Mobile",
        "texto": "A navegação continua sendo pensada para funcionar bem em qualquer tela.",
        "icone": "bi-phone"
      },
      {
        "titulo": "Evolução",
        "texto": "A base atual foi simplificada para facilitar as próximas etapas do projeto.",
        "icone": "bi-rocket-takeoff"
      }
    ],
    "centralizado": true
  },
  "investidores": {
    "titulo": "Investidores",
    "chamada": "Crescimento",
    "cabecalho": "Investidores",
    "resumo": "Uma visão resumida do projeto para quem quer acompanhar evolução, expansão e oportunidades.",
    "cartoes": [
      {
        "titulo": "Produto",
        "texto": "A plataforma aproxima profissionais e contratantes com navegação clara e cadastro simples."
      },
      {
        "titulo": "Escala",
        "texto": "A estrutura atual facilita a expansão para novas áreas e novos perfis de usuário."
      },
      {
        "titulo": "Contato",
        "texto": "Use as páginas de ajuda e legal para conhecer o projeto antes de qualquer parceria."
      }
    ]
  },
  "politicas": {
    "titulo": "Políticas de Privacidade",
    "chamada": "Privacidade",
    "cabecalho": "Políticas de privacidade",
    "resumo": "Aqui está a visão resumida de como tratamos dados, uso interno e navegação na plataforma.",
    "cartoes": [
      {
        "titulo": "Coleta",
        "texto": "Coletamos apenas as informações necessárias para cadastro, acesso e funcionamento das páginas."
      },
      {
        "titulo": "Uso",
        "texto": "Os dados ajudam a identificar perfis, validar acesso e personalizar a experiência do usuário."
      },
      {
        "titulo": "Controle",
        "texto": "Você deve manter suas informações atualizadas e revisar as páginas de legal e segurança quando necessário."
      }
    ]
  },
  "seguranca": {
    "titulo": "Segurança e Privacidade",
    "chamada": "Proteção",
    "cabecalho": "Segurança e privacidade",
    "resumo": "Mantemos a navegação simples e reforçamos o cuidado com dados, acesso e integridade das informações.",
    "cartoes": [
      {
        "titulo": "Acesso",
        "texto": "Use credenciais fortes e não compartilhe sua senha com outras pessoas.",
        "icone": "bi-lock"
      },
      {
        "titulo": "Dados",
        "texto": "As informações cadastradas devem ser verdadeiras e atualizadas sempre que houver mudança.",
        "icone": "bi-shield-lock"
      },
      {
        "titulo": "Privacidade",
        "texto": "Evite divulgar informações sensíveis em perfis públicos ou campos não destinados a isso.",
        "icone": "bi-eye-slash"
      }
    ]
  },
  "publicidade": {
    "titulo": "Publicidade",
    "chamada": "Mídia",
    "cabecalho": "Publicidade",
    "resumo": "Divulgue vagas, serviços e campanhas com uma experiência visual simples e direta.",
    "cartoes": [
      {
        "titulo": "Anúncios",
        "texto": "Espaço para promover vagas e serviços para o público certo.",
        "icone": "bi-megaphone"
      },
      {
        "titulo": "Métricas",
        "texto": "Acompanhe o desempenho da divulgação de forma objetiva.",
        "icone": "bi-graph-up-arrow"
      },
      {
        "titulo": "Segmentação",
        "texto": "Alcance profissionais e empresas de acordo com o perfil desejado.",
        "icone": "bi-bullseye"
      }
    ]
  },
  "fornecedores": {
    "titulo": "Fornecedores",
    "chamada": "Rede",
    "cabecalho": "Fornecedores",
    "resumo": "Espaço para empresas parceiras e prestadores que apoiam o funcionamento da plataforma.",
    "cartoes": [
      {
        "titulo": "Parcerias",
        "texto": "Conecte serviços, materiais e suporte com foco em colaboração."
      },
      {
        "titulo": "Confiança",
        "texto": "Informações claras ajudam a manter uma relação mais transparente entre as partes."
      },
      {
        "titulo": "Expansão",
        "texto": "Novos parceiros podem ser incluídos sem alterar o fluxo principal da plataforma."
      }
    ]
  },
  "legal": {
    "titulo": "Legal",
    "chamada": "Documentação",
    "cabecalho": "Termos e informações legais",
    "resumo": "Esta página concentra orientações gerais sobre uso da plataforma, responsabilidades e acesso às políticas principais.",
    "cartoes": [
      {
        "titulo": "Uso da plataforma",
        "texto": "O conteúdo publicado no FastWork deve respeitar as regras básicas de convivência, segurança e boa fé."
      },
      {
        "titulo": "Responsabilidade",
        "texto": "Cada usuário é responsável pelos dados enviados, pelas interações e pela atualização do próprio cadastro."
      }
    ],
    "atalhos": [
      {
        "texto": "Políticas de privacidade",
        "pagina": "politicas"
      },
      {
        "texto": "Segurança e privacidade",
        "pagina": "seguranca"
      },
      {
        "texto": "Cookies",
        "pagina": "cookies"
      }
    ]
  },
  "cookies": {
    "titulo": "Cookies",
    "chamada": "Navegação",
    "cabecalho": "Uso de cookies",
    "resumo": "Os cookies ajudam a manter a sessão, lembrar preferências básicas e melhorar a experiência de uso.",
    "cartoes": [
      {
        "titulo": "Essenciais",
        "texto": "Mantêm acesso e navegação funcionando de forma consistente entre as páginas do FastWork."
      },
      {
        "titulo": "Preferências",
        "texto": "Podem registrar escolhas simples, como caminhos usados com mais frequência e contexto de sessão."
      }
    ]
  },
  "empregos": {
    "titulo": "Empregos",
    "chamada": "Oportunidades",
    "cabecalho": "Empregos",
    "resumo": "Confira as áreas mais buscadas e use esta página como ponto de entrada para novas vagas.",
    "cartoes": [
      {
        "titulo": "Construção",
        "texto": "Vagas para pedreiro, ajudante, acabamento e serviços relacionados.",
        "icone": "bi-hammer"
      },
      {
        "titulo": "Elétrica",
        "texto": "Oportunidades para eletricistas e profissionais de manutenção.",
        "icone": "bi-lightning-charge"
      },
      {
        "titulo": "Acabamento",
        "texto": "Pintura, marcenaria, reformas e outros serviços especializados.",
        "icone": "bi-brush"
      }
    ]
  },
  "ajuda": {
    "titulo": "Ajuda",
    "chamada": "Suporte",
    "cabecalho": "Como podemos ajudar?",
    "resumo": "Reunimos os caminhos mais rápidos para cadastrar, entrar, falar com a equipe e resolver dúvidas básicas.",
    "cartoes": [
      {
        "titulo": "Conta",
        "texto": "Use login, cadastro de profissional ou cadastro de empresa conforme o seu perfil.",
        "icone": "bi-person-badge"
      },
      {
        "titulo": "Contato",
        "texto": "Se algo não funcionar como esperado, fale com a equipe pelos canais oficiais do projeto.",
        "icone": "bi-chat-dots"
      },
      {
        "titulo": "Dúvidas comuns",
        "texto": "As páginas de política, legal e segurança reúnem as informações essenciais da plataforma.",
        "icone": "bi-question-circle"
      }
    ]
  },
  "nao-encontrada": {
    "titulo": "Página não encontrada",
    "chamada": "Erro 404",
    "cabecalho": "Página não encontrada",
    "resumo": "O endereço acessado não existe. Use o menu para voltar ao início ou à ajuda.",
    "cartoes": []
  }
};
