const { formatPrice, date } = require('../../lib/utils');
const Category = require('../models/Category');
const Product = require('../models/Product');
const File = require('../models/File');

module.exports = {
  async create(req, res) {
    try {
      const results = await Category.all();

      const categories = results.rows;

      return res.render('products/create', { categories });
    } catch (err) {
      console.error(err);
    }
  },
  async post(req, res) {
    const keys = Object.keys(req.body);

    for (let key of keys) {
      if (req.body[key] == '')
        return res.send('Veuillez entrer tous les champs !');
    }

    if (req.files.length == 0)
      return res.send('Veuillez insérer au moins une image !');

    try {
      const results = await Product.create(req.body);
      const productId = results.rows[0].id;

      const filesPromise = req.files.map(file =>
        File.create({ ...file, product_id: productId })
      );
      await Promise.all(filesPromise);

      return res.redirect(`products/${productId}/edit`);
    } catch (err) {
      console.error(err);
    }
  },
  async show(req, res) {
    try {
      let results = await Product.find(req.params.id);
      const product = results.rows[0];

      if (!product) return res.send('Produit non trouvé !');

      const { dayAndMonth, hourAndMinutes } = date(product.updated_at);

      product.published = {
        dayAndMonth,
        hourAndMinutes,
      };

      product.oldPrice = formatPrice(product.old_price);
      product.price = formatPrice(product.price);

      results = await Product.files(product.id);
      const files = results.rows.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`,
      }));

      return res.render('products/show', { product, files });
    } catch(err) {
      console.error(err);
    }
  },
  async edit(req, res) {
    try {
      let results = await Product.find(req.params.id);
      const product = results.rows[0];

      if (!product) return res.send('Produit non trouvé !');

      product.oldPrice = formatPrice(product.old_price);
      product.price = formatPrice(product.price);

      /* get categories */
      results = await Category.all();
      const categories = results.rows;

      /* get images */
      results = await Product.files(product.id);
      let files = results.rows;
      files = files.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`,
      }));

      return res.render('products/edit', { product, categories, files });
    } catch(err) {
      console.error(err);
    }
  },
  async put(req, res) {
    const keys = Object.keys(req.body);

    for (let key of keys) {
      if (req.body[key] == '' && key != 'removed_files')
        return res.send('Veuillez entrer tous les champs !');
    }

    try {
      if (req.files.length != 0) {
        const newFilesPromise = req.files.map(file =>
          File.create({ ...file, product_id: req.body.id })
        );

        await Promise.all(newFilesPromise);
      }

      if (req.body.removed_files) {
        const removedFiles = req.body.removed_files.split(',');
        const lastIndex = removedFiles.length - 1;
        removedFiles.splice(lastIndex, 1);

        const removedFilesPromise = removedFiles.map(id => File.delete(id));
        await Promise.all(removedFilesPromise);
      }

      req.body.price = req.body.price.replace(/\D/g, '');

      if (req.body.old_price != req.body.price) {
        const oldProduct = await Product.find(req.body.id);

        req.body.old_price = oldProduct.rows[0].price;
      }

      await Product.update(req.body);

      return res.redirect(`/products/${req.body.id}`);
    } catch(err) {
      console.error(err);
    }
  },
  async delete(req, res) {
    try {
      await Product.delete(req.body.id);

      return res.redirect('/products/create');
    } catch(err) {
      console.error(err);
    }
  },
};
