const crypto = require('crypto');
const { hash } = require('bcryptjs');
const User = require('../models/User');
const mailer = require('../../lib/mailer');
const EmailTemplate = require('../services/EmailTemplate');

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
        html: EmailTemplate.header() + `
          <h2>Vous avez perdu votre mot de passe ?</h2>
          <p>Pas de soucis, cliquez sur le lien ci-dessous pour récupérer votre mot de passe</p>
          <p>
          <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank" style="color: #fd9621; font-weight: 700;">
          RÉCUPÉRER VOTRE MOT DE PASSE
          </a>
          </p>
        `,
      });

      return res.render('session/forgot-password', {
        success:
          'Vérifiez votre adresse e-mail pour réinitialiser votre mot de passe',
      });
    } catch (err) {
      console.error(err);
      return res.render('session/forgot-password', {
        error: 'Erreur inattendue, essayez à nouveau dans quelques minutes',
      });
    }
  },
  resetForm(req, res) {
    return res.render('session/password-reset', { token: req.query.token });
  },
  async reset(req, res) {
    try {
      const user = req.user;
      const { password } = req.body;
      const newPassword = await hash(password, 8);
      await User.update(user.id, {
        password: newPassword,
        reset_token: '',
        reset_token_expires: '',
      });

      return res.render('session/login', {
        user: req.body,
        success: 'Votre mot de passe a été changé avec succès !',
      });
    } catch (err) {
      const { token } = req.body;
      console.error(err);
      return res.render('session/password-reset', {
        user: req.body,
        token,
        error: 'Erreur inattendue, essayez à nouveau dans quelques minutes',
      });
    }
  },
};
