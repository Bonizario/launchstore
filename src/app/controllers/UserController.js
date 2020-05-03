const User = require('../models/User');

module.exports = {
  registerForm(req, res) {
    return res.render('user/register');
  },
  async post(req, res) {
    const keys = Object.keys(req.body);

    for (let key of keys) {
      if (req.body[key] == '')
        return res.send('Veuillez entrer tous les champs !');
    }

    // checking if user exists (unique email, cpf_cnpj)
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

      return res.send('passou :d');
    } catch (err) {
      console.error(err);
    }
  },
};
