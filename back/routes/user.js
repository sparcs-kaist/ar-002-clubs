const express = require("express");
const router = express.Router();
const { Member, sequelize, ClubRepresentative } = require("../models");
const { Op } = require("sequelize");
const checkPermission = require("../utils/permission");
const Client = require("../utils/sparcssso");

const clientId = process.env.SSO_CLIENT_ID;
const secretKey = process.env.SSO_SECRET_KEY;
const client = new Client(clientId, secretKey);

router.post("/", async (req, res) => {
  const { code, state } = req.body;
  const userInfo = await client.getUserInfo(code, state);

  try {
    const DEVUID = process.env.REACT_APP_DEVUID;

    if (userInfo.kaist_info) {
      userInfo.kaist_info = JSON.parse(userInfo.kaist_info);
    }

    if (userInfo.uid === DEVUID) {
      userInfo.kaist_info = {
        kaist_uid: process.env.REACT_APP_kaist_uid,
        mail: process.env.REACT_APP_mail,
        ku_sex: process.env.REACT_APP_ku_sex,
        ku_acad_prog_code: process.env.REACT_APP_ku_acad_prog_code,
        ku_kaist_org_id: process.env.REACT_APP_ku_kaist_org_id,
        ku_kname: process.env.REACT_APP_ku_kname,
        ku_person_type: process.env.REACT_APP_ku_person_type,
        ku_person_type_kor: process.env.REACT_APP_ku_person_type_kor,
        ku_psft_user_status_kor: process.env.REACT_APP_ku_psft_user_status_kor,
        ku_born_date: process.env.REACT_APP_ku_born_date,
        ku_std_no: process.env.REACT_APP_ku_std_no,
        ku_psft_user_status: process.env.REACT_APP_ku_psft_user_status,
        employeeType: process.env.REACT_APP_employeeType,
        givenname: process.env.REACT_APP_givenname,
        displayname: process.env.REACT_APP_displayname,
        sn: process.env.REACT_APP_sn,
      };
    }

    const { uid, kaist_info, sid } = userInfo;
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
  try {
    const { student_id } = req.session.user;

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
    const result = [];

    // club_rep 권한 확인
    authorized.forEach((permission) => {
      if (permission.club_rep !== undefined) {
        result.push({
          typeId: permission.club_rep,
          clubId: permission.club_id,
        });
      }
      if (permission.advisor !== undefined) {
        result.push({
          typeId: 4,
          clubId: permission.advisor,
        });
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류" });
  }
});

router.get("/is_executive", async (req, res) => {
  try {
    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
    if (!authorized) {
      return;
    }

    // club_rep 권한 확인
    authorized.forEach((permission) => {
      if (permission.executive !== undefined) {
        return res.status(200).json({ result: permission.executive });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: 0 });
  }
});

module.exports = router;
