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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  },
};
