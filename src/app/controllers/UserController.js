const User = require('../models/User');
const { formatCep, formatCpfCnpj } = require('../../lib/utils');

module.exports = {
  registerForm(req, res) {
    return res.render('user/register');
  },
  async show(req, res) {
    try {
      const { user } = req;

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
  async update(req, res) {
    try {
      let { name, email, cpf_cnpj, cep, address } = req.body;
      cpf_cnpj = cpf_cnpj.replace(/\D/g, '');
      cep = cep.replace(/\D/g, '');

      await User.update(user.id, {
        name,
        email,
        cpf_cnpj,
        cep,
        address,
      });

      return res.render('user/index', {
        success: 'Mise à jour réussie',
      });
    } catch (err) {
      console.error(err);
      return res.render('user/index', {
        error: "Une erreur inattendue s'est produite",
      });
    }
  },
};
