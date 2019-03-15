const puppeteer = require("puppeteer");
const { TimeoutError } = require("puppeteer/Errors");

const moment = require("moment");

const mongoose = require("mongoose");

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect("mongodb://localhost/land-setam-db").then(() => console.log("Connected successfully..."));
require("./auctions-item.model");

const AuctionsItem = mongoose.model("auctions-items");


/* Начало */
async function doStringWithoutSpaces(selector, container) {
  return await container.$eval(selector, node => node.textContent.replace(/\s+/g, " ").trim());
}

async function doStringToNumber(selector, container) {
  return await container.$eval(selector, node => parseFloat(node.textContent.split(" ").join("")));
}

async function doISOString(string) {
  return moment().toISOString(string);
}

async function randomDelay() {
  const milliseconds = 10000;
  return Math.floor(Math.random() * milliseconds);
}


async function run() {
  // const browser = await puppeteer.launch({ headless: false }); //show Chromium
  const browser = await puppeteer.launch();
  const pageFirst = await browser.newPage();
  const pageSecond = await browser.newPage();

  await pageFirst.bringToFront();

  const url = "https://land.setam.net.ua/zemlya";
  await pageFirst.goto(url);

  await pageFirst.waitFor(3000);
  await pageFirst.waitForSelector(".tab-content");

  //Количество страниц сайте которые будем парсить по очереди или последняя доступная страница на сайте
  const siteTotalPages = await pageFirst.$eval("#upcoming .pagination-box ul li:nth-child(8) a", node => parseInt(node.textContent));
  console.log("siteTotalPages ===>", siteTotalPages);

  // How many pages
  for (let i = 1, j = 1; i <= siteTotalPages; i++) {
    console.log(`\n\n////////// Page: ${i} //////////\n\n`);

    // ждее рандомно
    await pageFirst.waitFor( await randomDelay() );

    //Количество карточек на странице
    const auctionsItems = await pageFirst.$$("#upcoming .list-group .auctions-item");
   
    //Собераем все карточки на странице
    for (let auctionsItem of auctionsItems) {
      const lotNumberParsed = await doStringToNumber(".list-group .anotation-item .info-item .number-item span", auctionsItem);

      //Проверка
      const auctionsItemCandidate = await AuctionsItem.findOne({lotNumber: lotNumberParsed});
      
      if (auctionsItemCandidate) {
        //Уже есть
        console.log(`\n//////Такой обьект уже есть в базе///${auctionsItemCandidate.lotNumber}\n`);
        if (auctionsItemCandidate.name !== nameParsed) {
        }
        if (auctionsItemCandidate.lotReference !== lotReferenceParsed) {
        }
        if (auctionsItemCandidate.region === regionParsed) {
          await AuctionsItem.findOneAndUpdate(
            {_id: auctionsItemCandidate._id},
            {changes: {region: 'maks'}},
            {new: true, upsert: true},
            (err, result) => console.log("Changes result", result)
          );
          await AuctionsItem.findOneAndUpdate(
            {_id: auctionsItemCandidate._id},
            {region: regionParsed}, {new: true, upsert: true},
            (err, result) => console.log("Result", result)
          );
          console.log(`\n//////AuctionsItem Обновлен///`);
        }
        if (auctionsItemCandidate.lotNumber !== lotNumberParsed) {
        }
        if (auctionsItemCandidate.startingPrice !== startingPriceParsed) {
        }
        if (auctionsItemCandidate.guaranteeFee !== guaranteeFeeParsed) {
        }
        if (auctionsItemCandidate.auctionStatus !== auctionStatusParsed) {
        }
        if (auctionsItemCandidate.startDate !== startDateParsed) {
        }
      }
      else {
        //Создаю
        console.log(`\n//////Создаю///${auctionsItemCandidate}\n`);
        const auctionItem = new AuctionsItem();

        const nameParsed = await doStringWithoutSpaces(".list-group .title-item a h3", auctionsItem);
        const lotReferenceParsed = await auctionsItem.$eval(".list-group .title-item a", node => node.href);
        const regionParsed = await doStringWithoutSpaces(".list-group .anotation-item .info-item .region-item span", auctionsItem);
      
        const startingPriceParsed = await doStringToNumber(".list-group .anotation-item .info-item .start-price-item span span", auctionsItem);
        const guaranteeFeeParsed = await doStringToNumber(".list-group .anotation-item .info-item .payment-item span span", auctionsItem);
        const auctionStatusParsed = await doStringWithoutSpaces(".list-group .anotation-item .info-item .condition-item span", auctionsItem);
        const startDateParsed = await doISOString( await doStringWithoutSpaces(".list-group .anotation-item .info-item-date div span", auctionsItem)); 

        //Забиваем все в базу
        auctionItem.name = nameParsed;
        auctionItem.lotReference = lotReferenceParsed;
        auctionItem.region = regionParsed;
        auctionItem.lotNumber = lotNumberParsed;
        auctionItem.startingPrice = startingPriceParsed;
        auctionItem.guaranteeFee = guaranteeFeeParsed;
        auctionItem.auctionStatus = auctionStatusParsed;
        auctionItem.startDate = startDateParsed;    

        //Создаю ссылки по которым будем ходить, с каждым проходом массив будет обнуляться
        const auctionsItemLink = await auctionsItem.$eval("#upcoming .list-group .title-item a", node => node.href);
        console.log("Ссылка карточки по которой мы перешли\n", auctionsItemLink);

        await pageSecond.bringToFront();

        await pageSecond.goto(auctionsItemLink);

        await pageSecond.waitFor( await randomDelay() );
      
        const dateOfAuctionParsed = await doISOString( await doStringWithoutSpaces("#main-inner .panel-body .first-box .info-box div:nth-child(3) span", pageSecond));
        const endDateOfBiddingParsed = await doISOString( await doStringWithoutSpaces("#auctionDateEnd", pageSecond));
        const endDateForSubmissionOfApplicationsParsed = await doISOString( await doStringWithoutSpaces("#main-inner .panel-body .first-box .info-box div:nth-child(5) span", pageSecond));
        const stepOfAuctionParsed = await doStringToNumber("#main-inner .panel-body .first-box .info-box div:nth-child(8) span span", pageSecond);
        const locationOfPropertyParsed = await doStringWithoutSpaces("#main-inner .panel-body .first-box .info-box div:nth-child(10) span p", pageSecond)
        const dateOfPublicationParsed = await doISOString( await doStringWithoutSpaces("#main-inner .panel-body .first-box .info-box div:nth-child(11) span", pageSecond));

        //Забиваем все в базу
        auctionItem.dateOfAuction = dateOfAuctionParsed;
        auctionItem.endDateOfBidding = endDateOfBiddingParsed;
        auctionItem.endDateForSubmissionOfApplications = endDateForSubmissionOfApplicationsParsed;
        auctionItem.stepOfAuction = stepOfAuctionParsed;
        auctionItem.locationOfProperty = locationOfPropertyParsed;
        auctionItem.dateOfPublication = dateOfPublicationParsed;

        console.log("Теперь обьект такой\n", auctionItem);

        //табы
        // Первый таб
        console.log("\nСобераем первый таб\n");
        await pageSecond.waitFor( await randomDelay() );
        const cadastralNumberOfTheLandPlotParsed = await doStringWithoutSpaces("#Feature-lot div:nth-child(1) .lot-edit-box a", pageSecond);
        const cadastralNumberOfTheLandPlotUrlParsed = await pageSecond.$eval("#Feature-lot div:nth-child(1) .lot-edit-box a", node => node.href);
        const targetPurposeOfTheLandPlotParsed = await doStringWithoutSpaces("#Feature-lot > div:nth-child(2) > span.user-field-value.lot-edit-box", pageSecond);
        const townNeedsParsed = await doStringWithoutSpaces("#Feature-lot > div:nth-child(3) > span.user-field-value.lot-edit-box", pageSecond);
        const typeOfContractParsed = await doStringWithoutSpaces("#Feature-lot > div:nth-child(4) > span.user-field-value.lot-edit-box", pageSecond);
        const termsOfContractParsed = await doStringWithoutSpaces("#Feature-lot > div:nth-child(5) > span.user-field-value.lot-edit-box", pageSecond);
        const landAreaParsed = await doStringToNumber("#Feature-lot > div:nth-child(6) > span.user-field-value.lot-edit-box", pageSecond);
        const normativeMonetaryValuationOfLandParsed = await doStringToNumber("#Feature-lot > div:nth-child(7) > span.user-field-value.lot-edit-box", pageSecond);
        const costsOfLotPreparationParsed = await doStringToNumber("#Feature-lot > div:nth-child(8) > span.user-field-value.lot-edit-box", pageSecond);
        const detailsForPaymentOfGuaranteeFeeParsed = await doStringWithoutSpaces("#Feature-lot > p.m-t", pageSecond);

        //Забиваем все в базу
        auctionItem.cadastralNumberOfTheLandPlot = cadastralNumberOfTheLandPlotParsed;
        auctionItem.cadastralNumberOfTheLandPlotUrl = cadastralNumberOfTheLandPlotUrlParsed;
        auctionItem.targetPurposeOfTheLandPlot = targetPurposeOfTheLandPlotParsed;
        auctionItem.townNeeds = townNeedsParsed;
        auctionItem.typeOfContract = typeOfContractParsed;
        auctionItem.termsOfContract = termsOfContractParsed;
        auctionItem.landArea = landAreaParsed;
        auctionItem.normativeMonetaryValuationOfLand = normativeMonetaryValuationOfLandParsed;
        auctionItem.costsOfLotPreparation = costsOfLotPreparationParsed;
        auctionItem.detailsForPaymentOfGuaranteeFee = detailsForPaymentOfGuaranteeFeeParsed;

        console.log("\nСобрали первый таб\n", auctionItem);


        // Второй таб
        await pageSecond.waitFor( await randomDelay() );
        await pageSecond.focus('a[href="#additional-nformation"]');
        await pageSecond.click('a[href="#additional-nformation"]');
        await pageSecond.waitFor( await randomDelay() );
        console.log("\nСобераем второй таб\n");

        const сategoryParsed = await doStringWithoutSpaces("#additional-nformation", pageSecond);
        console.log("\nсategoryParsed\n", сategoryParsed);
        // #additional-nformation > b:nth-child(3)

        //Забиваем все в базу
        auctionItem.сategory = сategoryParsed.substring(42);

        console.log("\nСобрали второй таб\n", auctionItem);

        // Третий таб
        await pageSecond.waitFor( await randomDelay() );
        await pageSecond.focus('a[href="#include"]');
        await pageSecond.click('a[href="#include"]');
        await pageSecond.waitFor( await randomDelay() );
    
        console.log("\nСобераем третий таб\n");

        const downloadFileUrlParsed = await pageSecond.$eval("#include > div > a.download", node => node.href);

        //Забиваем все в базу
        auctionItem.downloadFileUrl = downloadFileUrlParsed;

        console.log("\nСобрали третий таб\n", auctionItem);

        // Четвертый таб
        await pageSecond.waitFor( await randomDelay() );
        await pageSecond.focus('a[href="#application"]');
        await pageSecond.click('a[href="#application"]');
        await pageSecond.waitFor( await randomDelay() );
      
        const listOfParticipantsParsed = await pageSecond.$$eval("#application ul li", nodes => nodes.length);
        console.log("\nlistOfParticipantsParsed\n", listOfParticipantsParsed);
        console.log("\nСобераем четвертый таб\n");

        //Забиваем все в базу
        auctionItem.listOfParticipants = listOfParticipantsParsed;

        console.log("\nСобрали четвертый таб\n", auctionItem);
        console.log("\nИтог нашего обьекта\n", auctionItem);

        // await AuctionsItem.update();
        await auctionItem.save().then(item => console.log("\nСохранили обьект в базу\n\n".toUpperCase(), item));

        await pageSecond.waitFor( await randomDelay() );
        // await pageFirst.bringToFront();

      }
    }

    if (i < siteTotalPages) {
      // await pageFirst.bringToFront();
      await pageFirst.click(`a[href="/zemlya/page/${++j}"]`);
    }
  }
  // await browser.close();
  console.log(`\n////////// Browser closed! //////////\n\n`);
}
run();
