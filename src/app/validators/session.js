const User = require('../models/User');
const { compare } = require('bcryptjs');

module.exports = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user)
        return res.render('session/login', {
          user: req.body,
          error: 'Utilisateur non enregistré',
        });

      const passed = await compare(password, user.password);

      if (!passed)
        return res.render('session/login', {
          user: req.body,
          error: 'Mot de passe invalide',
        });

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
    }
  },
  async forgot(req, res, next) {
    try {
      const { email } = req.body;
      let user = await User.findOne({ where: { email } });

      if (!user)
        return res.render('session/forgot-password', {
          user: req.body,
          error: 'E-mail non enregistré',
        });

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
    }
  },
  async reset(req, res, next) {
    try {
      const { email, password, token, passwordRepeat } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user)
        return res.render('session/password-reset', {
          user: req.body,
          token,
          error: 'Utilisateur non enregistré',
        });

      if (password != passwordRepeat)
        return res.render('session/password-reset', {
          user: req.body,
          token,
          error: 'Non concordance des mots de passe',
        });

      if (token != user.reset_token)
        return res.render('session/password-reset', {
          user: req.body,
          token,
          error: "Le jeton n'est pas valide ! Veuillez demander une nouvelle réinitialisation du mot de passe",
        });

      let now = new Date();
      now = now.setHours(now.getHours);
      if (now > user.reset_token_expires)
        return res.render('session/password-reset', {
          user: req.body,
          token,
          error: 'Le jeton a expiré ! Veuillez demander une nouvelle réinitialisation du mot de passe',
        });

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
    }
  },
};
