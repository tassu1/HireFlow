import Candidate, { STAGES } from "../models/candidate.js";

export async function getStats(req, res) {
  const [grouped, recent] = await Promise.all([
    Candidate.aggregate([{ $group: { _id: "$stage", count: { $sum: 1 } } }]),
    Candidate.find().sort({ createdAt: -1, _id: -1 }).limit(5).lean(),
  ]);

  const byStage = Object.fromEntries(STAGES.map((stage) => [stage, 0]));
  for (const row of grouped) if (row._id in byStage) byStage[row._id] = row.count;
  const total = Object.values(byStage).reduce((sum, count) => sum + count, 0);

  res.json({
    success: true,
    stats: {
      total,
      hired: byStage.Hired,
      rejected: byStage.Rejected,
      active: total - byStage.Hired - byStage.Rejected,
      byStage,
      pipeline: STAGES.map((stage) => ({ stage, count: byStage[stage] })),
      recent,
    },
  });
}
