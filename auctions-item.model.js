const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const auctionsItem = new Schema({
  //Снаружи карточки
  // Титулка, название
  name: {
    type: String,
  },
  //Ссылка на лот
  lotReference: {
    type: String,
  },
  //Область
  region: {
    type: String,
  },
  //Номер лоту
  lotNumber: {
    type: Number,
    unique: true
  },
  //Початкова ціна
  startingPrice: {
    type: Number,
  },
  //Гарантійний внесок
  guaranteeFee: {
    type: Number,
  },
  //Стан аукціона
  auctionStatus: {
    type: String,
  },
  //Дата початку:
  startDate: {
    type: String,
  },
  //Изменения в карточке
  changes: {
    type: Array,
    default: []
  },

  //Внутри карточки
  //Дата проведення аукціону
  dateOfAuction: {
    type: String,
  },
  //Дата закінчення торгів:
  endDateOfBidding: {
    type: String,
  },
  //Дата закінчення подання заявок:
  endDateForSubmissionOfApplications: {
    type: String,
  },
  //Крок аукціону:
  stepOfAuction: {
    type: Number,
  },
  //Місцезнаходження майна
  locationOfProperty: {
    type: String,
  },
  //Дата публікації
  dateOfPublication: {
    type: String,
  },

  //Табы
  //Таб 1 - Характеристика лоту
  //Кадастровий номер земельної ділянки
  cadastralNumberOfTheLandPlot: {
    type: String,
  },
  //Кадастровий номер земельної ділянки (ссылка)
  cadastralNumberOfTheLandPlotUrl: {
    type: String,
  },
  //Цільове призначення земельної ділянки
  targetPurposeOfTheLandPlot: {
    type: String,
  },
  //Містобудівні потреби (види використання)
  townNeeds: {
    type: String,
  },
  //Тип договору
  typeOfContract: {
    type: String,
  },
  //Умови договру, який укладається за результатами торгів
  termsOfContract: {
    type: String,
  },
  //Площа земельної ділянки, га.
  landArea: {
    type: Number,
  },
  //Нормативно грошова оцінка земельної ділянки, грн
  normativeMonetaryValuationOfLand: {
    type: Number,
  },
  //Витрати на підготовку лота, грн
  costsOfLotPreparation: {
    type: Number,
  },
  //Реквізити для сплати гарантійного внеску:
  detailsForPaymentOfGuaranteeFee: {
    type: String,
  },
    
  //Таб 2 - Інформація про лот
  //Категорія
  сategory: {
    type: String,
  },

  //Таб 3 - Вкладення
  //Ссылка на загрузку файлов
  downloadFileUrl: {
    type: String,
  },

  //Таб 4 - Заявки на участь у торгах
  //Список учасників (количество)
  listOfParticipants: {
    type: Number,
  },
});

mongoose.model('auctions-items', auctionsItem);