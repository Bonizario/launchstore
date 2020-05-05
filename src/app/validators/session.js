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
};
