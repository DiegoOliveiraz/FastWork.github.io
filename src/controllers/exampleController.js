// Exemplo de Controller
// Este arquivo contém a lógica de negócio

export const homeController = (req, res) => {
  // Lógica aqui
  console.log('Página inicial acessada');
  // Passar dados para a view se necessário
};

export const loginController = (req, res) => {
  const { email, senha } = req.body;
  
  // Validação
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  // Aqui você acessaria o Model para buscar dados
  // const usuario = Usuario.findByEmail(email);

  res.status(200).json({ mensagem: 'Login realizado' });
};

export const dashboardController = (req, res) => {
  // Buscar dados do Model
  // const dados = Model.getDados();
  
  res.status(200).json({ mensagem: 'Dashboard carregado' });
};
