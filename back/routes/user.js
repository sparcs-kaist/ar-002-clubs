const express = require('express');
const router = express.Router();
const { Member, sequelize } = require('../models');

router.post('/', async (req, res) => {
    const {
        uid,
        kaist_info,
        sid
    } = req.body;

    try {
        // 트랜잭션 시작
        const userData = {
            student_id: parseInt(kaist_info.ku_std_no),
            uid : uid,
            kaist_uid: kaist_info.kaist_uid,
            sid: sid,
            name: kaist_info.ku_kname,
            email: kaist_info.mail,
            department: kaist_info.ku_kaist_org_id
        };
        req.session.user = {
            student_id: parseInt(kaist_info.ku_std_no),
            uid : uid,
            kaist_uid: kaist_info.kaist_uid,
            sid: sid,
            name: kaist_info.ku_kname,
            email: kaist_info.mail,
            department: kaist_info.ku_kaist_org_id
        };
        await req.session.save();
        console.log("session");
        console.log(req.session);
        await sequelize.transaction(async (t) => {
            const [member, created] = await Member.upsert(userData, { transaction: t, returning: true });

            if (created) {
                res.status(201).json({ message: '새 멤버가 추가되었습니다.', member });
            } else {
                res.status(200).json({ message: '멤버 정보가 업데이트 되었습니다.', member });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 오류' });
    }
});

router.get('/:student_id', async (req, res) => {
    console.log("get");
    console.log(req.session);
    const { student_id } = req.params;
    
    try {
        const member = await Member.findOne({
            where: { student_id }
        });
        // console.log(member.dataValues);
        if (!member) {
            res.status(404).json({ error: '멤버를 찾을 수 없습니다.' });
        } else {
            res.status(200).json(member.dataValues);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 오류' });
    }
});

module.exports = router;
