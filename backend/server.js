require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

function computeTontineSummary(tontineId) {
  const tontine = db.prepare('SELECT * FROM tontines WHERE id = ?').get(tontineId);
  if (!tontine) return null;

  const members = db.prepare(`
    SELECT m.*,
      COALESCE(SUM(p.amount), 0) AS total_paid,
      COUNT(p.id) AS payments_count,
      MAX(p.payment_date) AS last_payment_date
    FROM members m
    LEFT JOIN payments p ON p.member_id = m.id AND p.tontine_id = m.tontine_id
    WHERE m.tontine_id = ?
    GROUP BY m.id
    ORDER BY COALESCE(m.position, 999999), m.id
  `).all(tontineId);

  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(amount), 0) AS total_collected,
      COUNT(*) AS payments_count
    FROM payments
    WHERE tontine_id = ?
  `).get(tontineId);

  const nextBeneficiary = members.find((member) => {
    const alreadyBeneficiary = db.prepare(`
      SELECT 1 FROM payout_rounds
      WHERE tontine_id = ? AND beneficiary_member_id = ? AND status = 'paid'
      LIMIT 1
    `).get(tontineId, member.id);
    return !alreadyBeneficiary;
  }) || null;

  const payoutHistory = db.prepare(`
    SELECT pr.*, m.full_name AS beneficiary_name
    FROM payout_rounds pr
    LEFT JOIN members m ON m.id = pr.beneficiary_member_id
    WHERE pr.tontine_id = ?
    ORDER BY pr.id DESC
  `).all(tontineId);

  const recentPayments = db.prepare(`
    SELECT p.*, m.full_name AS member_name
    FROM payments p
    JOIN members m ON m.id = p.member_id
    WHERE p.tontine_id = ?
    ORDER BY date(p.payment_date) DESC, p.id DESC
    LIMIT 20
  `).all(tontineId);

  return {
    tontine,
    members,
    totals,
    nextBeneficiary,
    payoutHistory,
    recentPayments,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'SamaTontine API is running.' });
});

app.get('/api/tontines', (_req, res) => {
  const tontines = db.prepare(`
    SELECT t.*,
      COUNT(DISTINCT m.id) AS members_count,
      COALESCE(SUM(p.amount), 0) AS total_collected
    FROM tontines t
    LEFT JOIN members m ON m.tontine_id = t.id
    LEFT JOIN payments p ON p.tontine_id = t.id
    GROUP BY t.id
    ORDER BY t.id DESC
  `).all();

  res.json(tontines);
});

app.post('/api/tontines', (req, res) => {
  const { name, amount, frequency, startDate, description, members = [] } = req.body;

  if (!name || !amount || !frequency) {
    return res.status(400).json({ message: 'Nom, montant et fréquence sont obligatoires.' });
  }

  const insertTontine = db.prepare(`
    INSERT INTO tontines (name, amount, frequency, start_date, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMember = db.prepare(`
    INSERT INTO members (tontine_id, full_name, phone, email, role, position)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    const result = insertTontine.run(name, amount, frequency, startDate || null, description || null);
    const tontineId = result.lastInsertRowid;

    members.forEach((member, index) => {
      if (member.fullName && member.phone) {
        insertMember.run(
          tontineId,
          member.fullName,
          member.phone,
          member.email || null,
          index === 0 ? 'admin' : 'member',
          index + 1
        );
      }
    });

    return tontineId;
  });

  const tontineId = transaction();
  const summary = computeTontineSummary(tontineId);
  res.status(201).json(summary);
});

app.get('/api/tontines/:id', (req, res) => {
  const summary = computeTontineSummary(req.params.id);
  if (!summary) return res.status(404).json({ message: 'Tontine introuvable.' });
  res.json(summary);
});

app.post('/api/tontines/:id/members', (req, res) => {
  const tontineId = Number(req.params.id);
  const tontine = db.prepare('SELECT * FROM tontines WHERE id = ?').get(tontineId);
  if (!tontine) return res.status(404).json({ message: 'Tontine introuvable.' });

  const { fullName, phone, email } = req.body;
  if (!fullName || !phone) {
    return res.status(400).json({ message: 'Nom et téléphone sont obligatoires.' });
  }

  const currentCount = db.prepare('SELECT COUNT(*) as count FROM members WHERE tontine_id = ?').get(tontineId).count;

  const result = db.prepare(`
    INSERT INTO members (tontine_id, full_name, phone, email, role, position)
    VALUES (?, ?, ?, ?, 'member', ?)
  `).run(tontineId, fullName, phone, email || null, currentCount + 1);

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(member);
});

app.post('/api/tontines/:id/payments', (req, res) => {
  const tontineId = Number(req.params.id);
  const tontine = db.prepare('SELECT * FROM tontines WHERE id = ?').get(tontineId);
  if (!tontine) return res.status(404).json({ message: 'Tontine introuvable.' });

  const { memberId, amount, paymentDate, note } = req.body;
  if (!memberId || !amount || !paymentDate) {
    return res.status(400).json({ message: 'Membre, montant et date sont obligatoires.' });
  }

  const member = db.prepare('SELECT * FROM members WHERE id = ? AND tontine_id = ?').get(memberId, tontineId);
  if (!member) return res.status(404).json({ message: 'Membre introuvable.' });

  const result = db.prepare(`
    INSERT INTO payments (tontine_id, member_id, amount, payment_date, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(tontineId, memberId, amount, paymentDate, note || null);

  const payment = db.prepare(`
    SELECT p.*, m.full_name AS member_name
    FROM payments p
    JOIN members m ON m.id = p.member_id
    WHERE p.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(payment);
});

app.post('/api/tontines/:id/payouts', (req, res) => {
  const tontineId = Number(req.params.id);
  const { beneficiaryMemberId, roundLabel, amount, payoutDate, status } = req.body;

  if (!beneficiaryMemberId || !roundLabel || !amount || !payoutDate) {
    return res.status(400).json({ message: 'Bénéficiaire, tour, montant et date sont obligatoires.' });
  }

  const member = db.prepare('SELECT * FROM members WHERE id = ? AND tontine_id = ?').get(beneficiaryMemberId, tontineId);
  if (!member) return res.status(404).json({ message: 'Bénéficiaire introuvable.' });

  const result = db.prepare(`
    INSERT INTO payout_rounds (tontine_id, beneficiary_member_id, round_label, amount, payout_date, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(tontineId, beneficiaryMemberId, roundLabel, amount, payoutDate, status || 'paid');

  const payout = db.prepare(`
    SELECT pr.*, m.full_name AS beneficiary_name
    FROM payout_rounds pr
    LEFT JOIN members m ON m.id = pr.beneficiary_member_id
    WHERE pr.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(payout);
});

app.delete('/api/payments/:paymentId', (req, res) => {
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.paymentId);
  if (!payment) return res.status(404).json({ message: 'Paiement introuvable.' });
  db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.paymentId);
  res.json({ message: 'Paiement supprimé.' });
});

app.listen(PORT, () => {
  console.log(`SamaTontine backend listening on http://localhost:${PORT}`);
});
