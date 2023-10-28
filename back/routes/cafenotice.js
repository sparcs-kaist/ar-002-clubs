const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { CafeNotice } = require('../models');
const iconv = require('iconv-lite');
const moment = require('moment');
const urlPrefix = 'https://cafe.naver.com/kaistclubs';
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3 });

async function scrapeAndSave() {
  try {
    const response = await axios.get('https://cafe.naver.com/kaistclubs/ArticleList.nhn?search.clubid=26985838&search.menuid=1&search.boardtype=L', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134'
    },
    timeout: 5000,  // 5초 후에 요청 타임아웃
    responseType: 'arraybuffer'  // Make sure the raw data is returned
  });

    // Convert from EUC-KR to UTF-8
    const html = iconv.decode(response.data, 'EUC-KR');

    const $ = cheerio.load(html);

    const posts = [];
    const rows = $('tr');
    for (let i = 0; i < rows.length; i++) {
      const element = rows[i];

      const titleElement = $(element).find('.article');
      let title = titleElement.text();
      title = title.replace(/\s+/g, ' ').trim();
      const link = urlPrefix + titleElement.attr('href');

      let author = $(element).find('.td_name .p-nick a').text();
      author = author.replace(/\s+/g, ' ').trim();

      let date = $(element).find('.td_date').text();
      date = date.replace(/\s+/g, ' ').trim();

      // 시간만 제공되는 경우 오늘 날짜로 설정
      if (date.includes(':')) {
        date = moment().format('YYYY.MM.DD.');
      } else {
        // 연도만 추출
        const year = date.split('.')[0];
        // 2023년 이전의 데이터를 건너뛰기
        if (parseInt(year, 10) < 2023) {
            continue;
        }
      }

      if (title && author && date && link) {
        await CafeNotice.findOrCreate({
            where: { link: link },
            defaults: {
                title: title,
                author: author,
                date: date,
                link: link
            }
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
}

scrapeAndSave();
const scrapeInterval = 600000;
setInterval(() => scrapeAndSave(), scrapeInterval);  // Set up periodic scraping

router.get('/', async (req, res) => {
  const pageOffset = parseInt(req.query.pageOffset, 10) || 1;  // Default to 1 if pageOffset is not provided
  const itemCount = parseInt(req.query.itemCount, 10) || 10;  // Default to 10 if itemCount is not provided

  // Ensure pageOffset and itemCount are positive
  if (pageOffset <= 0 || itemCount <= 0) {
      res.status(400).send('pageOffset and itemCount must be positive integers');
      return;
  }

  const offset = (pageOffset - 1) * itemCount;
  const limit = itemCount;

  try {
      const [posts, totalPosts] = await Promise.all([
          CafeNotice.findAll({
              order: [['date', 'DESC']],  // Order by date descending
              offset: offset,
              limit: limit
          }),
          CafeNotice.count()  // Get total count of posts
      ]);

      res.json({ posts, totalPosts });  // Return posts and totalPosts in the response
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
});

module.exports = router;
