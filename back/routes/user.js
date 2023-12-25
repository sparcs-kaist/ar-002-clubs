const express = require("express");
const router = express.Router();
const { Member, sequelize, ClubRepresentative } = require("../models");
const { Op } = require("sequelize");
const checkPermission = require("../utils/permission");
const searchPermission = require("../utils/permission");

router.post("/", async (req, res) => {
  const { uid, kaist_info, sid } = req.body;

  try {
    // 트랜잭션 시작
    const userData = {
      student_id: parseInt(kaist_info.ku_std_no),
      uid: uid,
      kaist_uid: kaist_info.kaist_uid,
      sid: sid,
      name: kaist_info.ku_kname,
      email: kaist_info.mail,
      department: kaist_info.ku_kaist_org_id,
    };
    req.session.user = userData;
    await req.session.save();
    await sequelize.transaction(async (t) => {
      const [member, created] = await Member.upsert(userData, {
        transaction: t,
        returning: true,
      });

      if (created) {
        res.status(201).json({ message: "새 멤버가 추가되었습니다.", member });
      } else {
        res
          .status(200)
          .json({ message: "멤버 정보가 업데이트 되었습니다.", member });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류" });
  }
});

router.get("/", async (req, res) => {
  const { student_id } = req.session.user;

  try {
    const member = await Member.findOne({
      where: { student_id },
    });
    if (!member) {
      res.status(404).json({ error: "멤버를 찾을 수 없습니다." });
    } else {
      res.status(200).json(member.dataValues);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 사용 예시
router.get("/permission_test", async (req, res) => {
  // 권한 확인
  const authorized = await checkPermission(req, res, [
    { club_rep: 3, club_id: 42 },
    { executive: 1 },
    { advisor: 0 },
  ]);
  if (!authorized) {
    return;
  }
  console.log(authorized);
  res.json(authorized);
  // 여기에 권한이 있는 경우의 로직 처리
});

router.post("/permission", async (req, res) => {
  const { permissions } = req.body;
  const authorized = await checkPermission(req, res, permissions);
  if (!authorized) {
    return;
  }
  res.json({ authorized });
});

router.get("/is_representitive", async (req, res) => {
  try {
    const authorized = await checkPermission(req, res, [
      { club_rep: 3 },
      { advisor: 0 },
    ]);
    if (!authorized) {
      return;
    }
    const clubRepPermission = authorized.find(
      (permission) => permission.club_rep !== undefined
    );
    if (clubRepPermission) {
      res.status(200).json({
        typeId: clubRepPermission.club_rep,
        clubId: clubRepPermission.club_id,
      });
    } else {
      res.status(200).json({ typeId: 0, clubId: 0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
