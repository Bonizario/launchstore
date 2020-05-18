const User = require('../models/User');
const Order = require('../models/Order');
const LoadProductService = require('../services/LoadProductService');
const mailer = require('../../lib/mailer');
const EmailTemplate = require('../services/EmailTemplate');
const Cart = require('../../lib/cart');
const { formatPrice, date } = require('../../lib/utils');

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
    let orders = await Order.findAll({
      where: { buyer_id: req.session.userId },
    });

    const getOrdersPromise = orders.map(async order => {
      order.product = await LoadProductService.load('products', {
        where: { id: order.product_id },
      });

      order.buyer = await User.findOne({
        where: { id: order.buyer_id },
      });

      order.seller = await User.findOne({
        where: { id: order.seller_id },
      });

      order.formattedPrice = formatPrice(order.price);
      order.formattedTotal = formatPrice(order.total);

      const statuses = {
        open: 'Ouvert',
        sold: 'Vendu',
        canceled: 'Annulé',
      };

      order.formattedStatus = statuses[order.status];

      const updatedAt = date(order.updated_at);
      order.formattedUpdatedAt = `${order.formattedStatus} le ${updatedAt.dayAndMonth}/${updatedAt.year} à ${updatedAt.hourAndMinutes}`;

      return order;
    });

    orders = await Promise.all(getOrdersPromise);

    return res.render('orders/index', { orders });
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
};
