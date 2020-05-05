const crypto = require('crypto');
const User = require('../models/User');
const mailer = require('../../lib/mailer');

module.exports = {
  loginForm(req, res) {
    return res.render('session/login');
  },
  login(req, res) {
    req.session.userId = req.user.id;
    return res.redirect('/users');
  },
  logout(req, res) {
    req.session.destroy();
    return res.redirect('/');
  },
  forgotForm(req, res) {
    return res.render('session/forgot-password');
  },
  async forgot(req, res) {
    try {
      const user = req.user;

      const token = crypto.randomBytes(20).toString('hex');

      let now = new Date();
      now = now.setHours(now.getHours() + 1);

      await User.update(user.id, {
        reset_token: token,
        reset_token_expires: now,
      });

      await mailer.sendMail({
        to: user.email,
        from: 'no-reply@launchstore.com.br',
        subject: 'Recuperação de senha',
        html: `<h2>Vous avez perdu vos clés ?</h2>
        <p>Pas de soucis, cliquez sur le lien ci-dessous pour récupérer votre mot de passe</p>
        <p>
        <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
        RÉCUPÉRER VOTRE MOT DE PASSE
        </a>
        </p>
        `,
      });

      return res.render('session/forgot-password', {
        success: 'Vérifiez votre adresse e-mail pour réinitialiser votre mot de passe'
      });
    } catch (err) {
      console.error(err);
      return res.render('session/forgot-password', {
        error: 'Erreur inattendue, essayez à nouveau dans quelques minutes',
      });
    }
  },
};
