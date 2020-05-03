const User = require('../models/User');

module.exports = {
  async post(req, res, next) {
    const keys = Object.keys(req.body);

    for (let key of keys) {
      if (req.body[key] == '')
        return res.send('Veuillez entrer tous les champs !');
    }

    let { email, cpf_cnpj, password, passwordRepeat } = req.body;

    cpf_cnpj = cpf_cnpj.replace(/\D/g, '');

    try {
      const user = await User.findOne({
        where: { email },
        or: { cpf_cnpj },
      });

      if (user) return res.send('Utilisateur existant !');

      if (password != passwordRepeat)
        return res.send('Non concordance des mots de passe !');

    } catch (err) {
      console.error(err);
    }

    next();
  }
};
