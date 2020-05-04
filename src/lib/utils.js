module.exports = {
  date(timestamp) {
    const date = new Date(timestamp);
    /* UTC was needed, but now we can configure no-timezone in the postgresql db */
    const year = date.getUTCFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hour = date.getHours();
    const minutes = date.getMinutes();

    let hourAndMinutes;
    if (minutes < 10) hourAndMinutes = `${hour}h0${minutes}`;
    else hourAndMinutes = `${hour}h${minutes}`;

    return {
      day,
      month,
      year,
      hour,
      minutes,
      hourAndMinutes,
      dayAndMonth: `${day}/${month}`,
      iso: `${year}-${month}-${day}`,
      birthday: `${day}/${month}`,
      format: `${day}/${month}/${year}`,
    };
  },
  formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price / 100);
  },
  formatCpfCnpj(value) {
    value = value.replace(/\D/g, '');

    if (value.length > 14) value = value.slice(0, -1);

    if (value.length > 11) {
      value = value.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d)/,
        '$1.$2.$3/$4-$5'
      );
    } else {
      value = value.replace(
        /(\d{3})(\d{3})(\d{3})(\d)/,
        '$1.$2.$3-$4');
    }

    return value;
  },
  formatCep(value) {
    value = value.replace(/\D/g, '');

    if (value.length > 8) value = value.slice(0, -1);

    value = value.replace(/(\d{5})(\d)/, '$1-$2');

    return value;
  },
};
