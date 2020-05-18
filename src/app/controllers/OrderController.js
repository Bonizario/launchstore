const User = require('../models/User');
const Order = require('../models/Order');
const LoadProductService = require('../services/LoadProductService');
const LoadOrderService = require('../services/LoadOrderService');
const mailer = require('../../lib/mailer');
const EmailTemplate = require('../services/EmailTemplate');
const Cart = require('../../lib/cart');

const email = (seller, product, buyer) =>
  EmailTemplate.header() +
  `
  <h2>Salut ${seller.name},</h2>
  <p>Vous avez une nouvelle demande d'achat pour votre produit</p>
  <p>Produit: ${product.name}</p>
  <p>Prix: ${product.formattedPrice}</p>
  <p><br /><br /></p>
  <h3>Données d'acheteur</h3>
  <p>Nom complet: ${buyer.name}</p>
  <p>Email: ${buyer.email}</p>
  <p>Adresse: ${buyer.address} | CEP: ${buyer.cep.slice(
    0,
    5
  )}-${buyer.cep.slice(5, 8)}</p>
  <p><br /><br /></p>
  <p><strong>Contacter l'acheteur pour finaliser la vente !</strong></p>
  <p><br /><br /></p>
  <p>Cordialement, l'équipe Launchstore</p>
`;

module.exports = {
  async index(req, res) {
    try {
      const orders = await LoadOrderService.load('orders', {
        where: { buyer_id: req.session.userId },
      });

      return res.render('orders/index', { orders });
    } catch (err) {
      console.error(err);
    }
  },
  async sales(req, res) {
    try {
      const sales = await LoadOrderService.load('orders', {
        where: { seller_id: req.session.userId },
      });

      return res.render('orders/sales', { sales });
    } catch (err) {
      console.error(err);
    }
  },
  async show(req, res) {
    try {
      const order = await LoadOrderService.load('order', {
        where: { id: req.params.id },
      });

      return res.render('orders/details', { order });
    } catch (err) {
      console.error(err);
    }
  },
  async post(req, res) {
    try {
      const cart = Cart.init(req.session.cart);

      const buyer_id = req.session.userId;

      const filteredItems = cart.items.filter(
        item => item.product.user_id != buyer_id
      );

      const createOrdersPromise = filteredItems.map(async item => {
        let { product, price: total, quantity } = item;
        const { price, id: product_id, user_id: seller_id } = product;
        const status = 'open';

        const order = await Order.create({
          seller_id,
          buyer_id,
          product_id,
          price,
          total,
          quantity,
          status,
        });

        product = await LoadProductService.load('product', {
          where: {
            id: product_id,
          },
        });

        const seller = await User.findOne({
          where: { id: seller_id },
        });

        const buyer = await User.findOne({ where: { id: buyer_id } });

        await mailer.sendMail({
          to: seller.email,
          from: 'no-reply@launchstore.com.br',
          subject: 'Novo pedido de compra',
          html: email(seller, product, buyer),
        });

        return order;
      });

      await Promise.all(createOrdersPromise);

      delete req.session.cart;
      Cart.init();

      return res.render('orders/success');
    } catch (err) {
      console.error(err);
      return res.render('orders/error');
    }
  },
  async update(req, res) {
    try {
      const { id, action } = req.params;

      const acceptedActions = ['close', 'cancel'];
      if (!acceptedActions.includes(action))
        return res.render('orders/sales', { error:'Vous ne pouvez pas faire cette action !' });

      const order = await Order.findOne({ where: { id } });
      if (!order) return res.render('orders/sales', { error:'Demande non trouvé !' });

      if (order.status != 'open')
        return res.render('orders/sales', { error:'Vous ne pouvez pas faire cette action !' });

      const statuses = {
        close: 'sold',
        cancel: 'canceled',
      };

      order.status = statuses[action];

      await Order.update(id, {
        status: order.status,
      });

      return res.redirect('/orders/sales');
    } catch (err) {
      console.error(err);
    }
  },
};
