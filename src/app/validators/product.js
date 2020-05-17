module.exports = {
  async post(req, res, next) {
    const keys = Object.keys(req.body);

    for (let key of keys) {
      if (req.body[key] == '')
        return res.send('Veuillez entrer tous les champs !');
    }

    if (!req.files || req.files.length == 0)
      return res.send('Veuillez insérer au moins une image !');

    next();
  },
  async put(req, res, next) {
    const keys = Object.keys(req.body);

    for (let key of keys) {
      if (req.body[key] == '')
        return res.send('Veuillez entrer tous les champs !');
    }

    if (!req.files || req.files.length == 0)
      return res.send('Veuillez insérer au moins une image !');

    next();
  },
};
