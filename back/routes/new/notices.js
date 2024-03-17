const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { CafeNotice } = require("../../models");

router.get("/", async (req, res) => {
  const pageOffset = parseInt(req.query.pageOffset, 10) || 1; // Default to 1 if not provided
  const itemCount = parseInt(req.query.itemCount, 10) || 10; // Default to 10 if not provided

  // Ensure pageOffset and itemCount are positive integers
  if (pageOffset <= 0 || itemCount <= 0) {
    return res
      .status(400)
      .send("pageOffset and itemCount must be positive integers");
  }

  const offset = (pageOffset - 1) * itemCount;
  const limit = itemCount;

  try {
    const [notices, totalNotices] = await Promise.all([
      CafeNotice.findAll({
        attributes: ["id", "title", "author", "date", "link"], // Select specific attributes
        order: [["date", "DESC"]], // Order by date in descending order
        offset: offset,
        limit: limit,
      }),
      CafeNotice.count(), // Count total notices for pagination info
    ]);

    const formattedNotices = notices.map((notice) => ({
      id: notice.id,
      title: notice.title,
      author: notice.author,
      date: notice.date,
      link: notice.link,
    }));

    res.json(formattedNotices);
  } catch (error) {
    console.error("Error in GET /notices route:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/notice/:id", async (req, res) => {
  const noticeId = parseInt(req.params.id, 10); // Convert the id parameter to an integer

  // Check if the noticeId is a positive integer
  if (!noticeId || noticeId <= 0) {
    res
      .status(400)
      .send("Invalid notice ID. The ID must be a positive integer.");
    return;
  }

  try {
    const notice = await CafeNotice.findByPk(noticeId, {
      attributes: ["id", "title", "author", "date", "link"], // Assuming 'content' is part of your model
    });

    if (!notice) {
      res.status(404).send("Notice not found.");
      return;
    }

    res.json({ ...notice, content: "이것은 테스트 입니다." }); // Return the notice details in the response
  } catch (error) {
    console.error("Error in GET /notices/notice/:id route:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
