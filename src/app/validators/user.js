const User = require('../models/User');
const { compare } = require('bcryptjs');

function checkAllFields(body) {
  const keys = Object.keys(body);

  for (let key of keys) {
    if (body[key] == '')
      return {
        user: body,
        error: 'Veuillez entrer tous les champs',
      };
  }
}

module.exports = {
  async post(req, res, next) {
    try {
      const fillAllFields = checkAllFields(req.body);
      if (fillAllFields)
        return res.render('user/register', fillAllFields);

      let { email, cpf_cnpj, password, passwordRepeat } = req.body;

      cpf_cnpj = cpf_cnpj.replace(/\D/g, '');

      const user = await User.findOne({
        where: { email },
        or: { cpf_cnpj },
      });

      if (user)
        return res.render('user/register', {
          user: req.body,
          error: 'Utilisateur déjà enregistré',
        });

      if (password != passwordRepeat)
        return res.render('user/register', {
          user: req.body,
          error: 'Non concordance des mots de passe',
        });

      next();
    } catch (err) {
      console.error(err);
    }

  },
  async show(req, res, next) {
    try {
      const { userId: id } = req.session;

      const user = await User.findOne({ where: { id } });

      if (!user)
      return res.render('user/register', {
        error: 'Utilisateur non trouvé',
      });

      req.user = user; // passing user to the next middleware
      next();
    } catch (err) {
      console.error(err);
    }
  },
  async update(req, res, next) {
    try {
      const fillAllFields = checkAllFields(req.body);
      if (fillAllFields)
        return res.render('user/index', fillAllFields);

      const { id, password } = req.body;
      if (!password)
        return res.render('user/index', {
          user: req.body,
          error:
          'Veuillez entrer votre mot de passe pour mettre à jour vos informations',
        });

      const user = await User.findOne({ where: { id } });

      const passed = await compare(password, user.password);

      if (!passed)
        return res.render('user/index', {
          user: req.body,
          error: 'Mot de passe invalide',
        });

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
    }
  },
};
