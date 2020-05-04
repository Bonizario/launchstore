const User = require('../models/User');
const { formatCep, formatCpfCnpj } = require('../../lib/utils');

module.exports = {
  registerForm(req, res) {
    return res.render('user/register');
  },
  async show(req, res) {
    try {
      const { userId: id } = req.session;

      const user = await User.findOne({ where: {id} });

      if (!user) return res.render('user/register', {
        error: 'Utilisateur non trouvé',
      });

      user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj);
      user.cep = formatCep(user.cep);

      return res.render('user/index', { user });
    } catch (err) {
      console.error(err);
    }
  },
  async post(req, res) {
    try {
      const userId = await User.create(req.body);

      req.session.userId = userId;

      return res.redirect('/users');
    } catch (err) {
      console.error(err);
    }
  },
};
