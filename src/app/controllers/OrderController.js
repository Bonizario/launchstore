const User = require('../models/User');
const LoadProductService = require('../services/LoadProductService');

const mailer = require('../../lib/mailer');

const email = (seller, product, buyer) => `
  <style>* { font-family: sans-serif; } header { text-align: center; margin-bottom: 12px; padding: 16px; }</style>
  <header style="background-color: #000;">
    <h1 style="color: #fff; font-size: 36px; line-height: 46px; margin: 0;">
      Launchstore
    </h1>
    <h2 style="color: #fd9621; text-transform: uppercase; font-size: 14px; line-height: 16px; letter-spacing: 2px; margin: 0;">
      Acheter et vendre
    </h2>
  </header>
  <h2>Salut ${seller.name},</h2>
  <p>Vous avez une nouvelle demande d'achat pour votre produit</p>
  <p>Produit: ${product.name}</p>
  <p>Prix: ${product.formattedPrice}</p>
  <p><br /><br /></p>
  <h3>Données d'acheteur</h3>
  <p>Nom complet: ${buyer.name}</p>
  <p>Email: ${buyer.email}</p>
  <p>Adresse: ${buyer.address} | CEP: ${buyer.cep.slice(0, 5)}-${buyer.cep.slice(5, 8)}</p>
  <p><br /><br /></p>
  <p><strong>Contacter l'acheteur pour finaliser la vente !</strong></p>
  <p><br /><br /></p>
  <p>Cordialement, l'équipe Launchstore</p>
`;

module.exports = {
  async post(req, res) {
    try {
      const product = await LoadProductService.load('product', {
        where: {
          id: req.body.id,
        },
      });

      const seller = await User.findOne({ where: { id: product.user_id } });

      const buyer = await User.findOne({ where: { id: req.session.userId } })

      await mailer.sendMail({
        to: seller.email,
        from: 'no-reply@launchstore.com.br',
        subject: 'Novo pedido de compra',
        html: email(seller, product, buyer),
      });

      return res.render('orders/success');
    } catch (err) {
      console.error(err);
      return res.render('orders/error');
    }
  },
};
