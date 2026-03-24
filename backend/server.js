require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function mapTontineRow(row) {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount || 0),
    frequency: row.frequency,
    start_date: row.start_date,
    description: row.description,
    members_count: Number(row.members_count || 0),
    total_collected: Number(row.total_collected || 0),
  };
}

/**
 * GET /api/tontines
 * Liste des tontines pour la sidebar / liste
 */
app.get('/api/tontines', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        t.id,
        t.name,
        t.amount,
        t.frequency,
        t.start_date,
        t.description,
        COUNT(DISTINCT m.id) AS members_count,
        COALESCE(SUM(p.amount), 0) AS total_collected
      FROM tontines t
      LEFT JOIN members m ON m.tontine_id = t.id
      LEFT JOIN payments p ON p.tontine_id = t.id
      GROUP BY t.id
      ORDER BY t.id DESC
      `
    );

    res.json(result.rows.map(mapTontineRow));
  } catch (error) {
    console.error('GET /api/tontines error:', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des tontines.' });
  }
});

/**
 * Fonction utilitaire dashboard
 */
async function buildDashboard(tontineId) {
  const tontineResult = await pool.query(
    `
    SELECT
      t.id,
      t.name,
      t.amount,
      t.frequency,
      t.start_date,
      t.description
    FROM tontines t
    WHERE t.id = $1
    `,
    [tontineId]
  );

  if (tontineResult.rows.length === 0) {
    return null;
  }

  const tontine = tontineResult.rows[0];

  const membersResult = await pool.query(
    `
    SELECT
      m.id,
      m.full_name,
      m.phone,
      m.email,
      m.position,
      COALESCE(SUM(p.amount), 0) AS total_paid,
      COUNT(p.id) AS payments_count
    FROM members m
    LEFT JOIN payments p ON p.member_id = m.id
    WHERE m.tontine_id = $1
    GROUP BY m.id
    ORDER BY m.position ASC, m.id ASC
    `,
    [tontineId]
  );

  const totalsResult = await pool.query(
    `
    SELECT
      COALESCE(SUM(amount), 0) AS total_collected,
      COUNT(*) AS payments_count
    FROM payments
    WHERE tontine_id = $1
    `,
    [tontineId]
  );

  const recentPaymentsResult = await pool.query(
    `
    SELECT
      p.id,
      p.amount,
      p.payment_date,
      p.note,
      m.full_name AS member_name
    FROM payments p
    JOIN members m ON m.id = p.member_id
    WHERE p.tontine_id = $1
    ORDER BY p.payment_date DESC, p.id DESC
    LIMIT 10
    `,
    [tontineId]
  );

  const payoutHistoryResult = await pool.query(
    `
    SELECT
      po.id,
      po.round_label,
      po.amount,
      po.payout_date,
      po.status,
      m.full_name AS beneficiary_name
    FROM payouts po
    JOIN members m ON m.id = po.beneficiary_member_id
    WHERE po.tontine_id = $1
    ORDER BY po.payout_date DESC, po.id DESC
    LIMIT 10
    `,
    [tontineId]
  );

  const nextBeneficiaryResult = await pool.query(
    `
    SELECT
      m.id,
      m.full_name,
      m.phone,
      m.email,
      m.position
    FROM members m
    WHERE m.tontine_id = $1
      AND m.id NOT IN (
        SELECT beneficiary_member_id
        FROM payouts
        WHERE tontine_id = $1
      )
    ORDER BY m.position ASC, m.id ASC
    LIMIT 1
    `,
    [tontineId]
  );

  const allMembersOrderedResult = await pool.query(
    `
    SELECT id, full_name, phone, email, position
    FROM members
    WHERE tontine_id = $1
    ORDER BY position ASC, id ASC
    `,
    [tontineId]
  );

  const nextBeneficiary =
    nextBeneficiaryResult.rows[0] || allMembersOrderedResult.rows[0] || null;

  return {
    tontine: {
      id: tontine.id,
      name: tontine.name,
      amount: Number(tontine.amount || 0),
      frequency: tontine.frequency,
      start_date: tontine.start_date,
      description: tontine.description,
    },
    members: membersResult.rows.map((m) => ({
      ...m,
      total_paid: Number(m.total_paid || 0),
      payments_count: Number(m.payments_count || 0),
      position: Number(m.position || 0),
    })),
    totals: {
      total_collected: Number(totalsResult.rows[0]?.total_collected || 0),
      payments_count: Number(totalsResult.rows[0]?.payments_count || 0),
    },
    recentPayments: recentPaymentsResult.rows.map((p) => ({
      ...p,
      amount: Number(p.amount || 0),
    })),
    payoutHistory: payoutHistoryResult.rows.map((p) => ({
      ...p,
      amount: Number(p.amount || 0),
    })),
    nextBeneficiary,
  };
}

/**
 * GET /api/tontines/:id
 * Dashboard complet d’une tontine
 */
app.get('/api/tontines/:id', async (req, res) => {
  try {
    const tontineId = Number(req.params.id);
    const dashboard = await buildDashboard(tontineId);

    if (!dashboard) {
      return res.status(404).json({ message: 'Tontine introuvable.' });
    }

    res.json(dashboard);
  } catch (error) {
    console.error('GET /api/tontines/:id error:', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement du dashboard.' });
  }
});

/**
 * POST /api/tontines
 * Création d’une tontine + membres initiaux
 */
app.post('/api/tontines', async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, amount, frequency, startDate, description, members } = req.body;

    if (!name || !amount || !frequency) {
      return res.status(400).json({ message: 'Nom, montant et fréquence sont obligatoires.' });
    }

    await client.query('BEGIN');

    const tontineInsert = await client.query(
      `
      INSERT INTO tontines (name, amount, frequency, start_date, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [name, Number(amount), frequency, startDate || null, description || null]
    );

    const tontineId = tontineInsert.rows[0].id;

    const validMembers = Array.isArray(members)
      ? members.filter((m) => m.fullName && m.fullName.trim())
      : [];

    for (let i = 0; i < validMembers.length; i++) {
      const member = validMembers[i];

      await client.query(
        `
        INSERT INTO members (tontine_id, full_name, phone, email, position)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          tontineId,
          member.fullName.trim(),
          member.phone || '',
          member.email || null,
          i + 1,
        ]
      );
    }

    await client.query('COMMIT');

    const dashboard = await buildDashboard(tontineId);
    res.status(201).json(dashboard);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('POST /api/tontines error:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la tontine.' });
  } finally {
    client.release();
  }
});

/**
 * POST /api/tontines/:id/members
 * Ajouter un membre après création
 */
app.post('/api/tontines/:id/members', async (req, res) => {
  try {
    const tontineId = Number(req.params.id);
    const { fullName, phone, email } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Le nom complet est obligatoire.' });
    }

    const positionResult = await pool.query(
      `
      SELECT COALESCE(MAX(position), 0) + 1 AS next_position
      FROM members
      WHERE tontine_id = $1
      `,
      [tontineId]
    );

    const nextPosition = Number(positionResult.rows[0].next_position || 1);

    await pool.query(
      `
      INSERT INTO members (tontine_id, full_name, phone, email, position)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [tontineId, fullName.trim(), phone || '', email || null, nextPosition]
    );

    const dashboard = await buildDashboard(tontineId);
    res.status(201).json(dashboard);
  } catch (error) {
    console.error('POST /api/tontines/:id/members error:', error);
    res.status(500).json({ message: 'Erreur lors de l’ajout du membre.' });
  }
});

/**
 * POST /api/tontines/:id/payments
 * Ajouter un paiement
 */
app.post('/api/tontines/:id/payments', async (req, res) => {
  try {
    const tontineId = Number(req.params.id);
    const { memberId, amount, paymentDate, note } = req.body;

    if (!memberId || !amount || !paymentDate) {
      return res.status(400).json({ message: 'Membre, montant et date sont obligatoires.' });
    }

    await pool.query(
      `
      INSERT INTO payments (tontine_id, member_id, amount, payment_date, note)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [tontineId, Number(memberId), Number(amount), paymentDate, note || null]
    );

    const dashboard = await buildDashboard(tontineId);
    res.status(201).json(dashboard);
  } catch (error) {
    console.error('POST /api/tontines/:id/payments error:', error);
    res.status(500).json({ message: 'Erreur lors de l’enregistrement du paiement.' });
  }
});

/**
 * POST /api/tontines/:id/payouts
 * Enregistrer une redistribution
 */
app.post('/api/tontines/:id/payouts', async (req, res) => {
  try {
    const tontineId = Number(req.params.id);
    const { beneficiaryMemberId, roundLabel, amount, payoutDate, status } = req.body;

    if (!beneficiaryMemberId || !roundLabel || !amount || !payoutDate) {
      return res.status(400).json({ message: 'Bénéficiaire, tour, montant et date sont obligatoires.' });
    }

    await pool.query(
      `
      INSERT INTO payouts (tontine_id, beneficiary_member_id, round_label, amount, payout_date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        tontineId,
        Number(beneficiaryMemberId),
        roundLabel,
        Number(amount),
        payoutDate,
        status || 'paid',
      ]
    );

    const dashboard = await buildDashboard(tontineId);
    res.status(201).json(dashboard);
  } catch (error) {
    console.error('POST /api/tontines/:id/payouts error:', error);
    res.status(500).json({ message: 'Erreur lors de l’enregistrement du tour.' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'DB non disponible' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/", (req, res) => {
  res.send("Backend OK");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});
/**
 * DELETE /api/tontines/:id
 * Supprimer une tontine et toutes ses données liées
 */
app.delete('/api/tontines/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    const tontineId = Number(req.params.id);

    await client.query('BEGIN');

    await client.query(
      `DELETE FROM payouts WHERE tontine_id = $1`,
      [tontineId]
    );

    await client.query(
      `DELETE FROM payments WHERE tontine_id = $1`,
      [tontineId]
    );

    await client.query(
      `DELETE FROM members WHERE tontine_id = $1`,
      [tontineId]
    );

    const result = await client.query(
      `DELETE FROM tontines WHERE id = $1 RETURNING id`,
      [tontineId]
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tontine introuvable.' });
    }

    res.json({ message: 'Tontine supprimée avec succès.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('DELETE /api/tontines/:id error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la tontine.' });
  } finally {
    client.release();
  }
});
/**
 * DELETE /api/tontines/:id/members/:memberId
 * Supprimer un membre et ses paiements / redistributions liées
 */
app.delete('/api/tontines/:id/members/:memberId', async (req, res) => {
  const client = await pool.connect();

  try {
    const tontineId = Number(req.params.id);
    const memberId = Number(req.params.memberId);

    await client.query('BEGIN');

    await client.query(
      `DELETE FROM payouts WHERE tontine_id = $1 AND beneficiary_member_id = $2`,
      [tontineId, memberId]
    );

    await client.query(
      `DELETE FROM payments WHERE tontine_id = $1 AND member_id = $2`,
      [tontineId, memberId]
    );

    const result = await client.query(
      `DELETE FROM members WHERE tontine_id = $1 AND id = $2 RETURNING id`,
      [tontineId, memberId]
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Membre introuvable.' });
    }

    const dashboard = await buildDashboard(tontineId);
    res.json(dashboard);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('DELETE /api/tontines/:id/members/:memberId error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du membre.' });
  } finally {
    client.release();
  }
});