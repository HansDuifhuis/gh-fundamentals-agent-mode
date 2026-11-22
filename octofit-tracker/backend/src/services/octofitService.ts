import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

type ActivityInput = {
  userId?: unknown;
  teamId?: unknown;
  type?: unknown;
  minutes?: unknown;
};

type TeamInput = {
  name?: unknown;
  mascot?: unknown;
  members?: unknown;
};

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(_input: unknown) {
  const input = (_input ?? {}) as ActivityInput;
  if (!isObjectId(input.userId) || !isObjectId(input.teamId)) {
    throw httpError('A valid userId and teamId are required', 400);
  }
  if (typeof input.type !== 'string' || !input.type.trim()) throw httpError('A valid activity type is required', 400);
  if (typeof input.minutes !== 'number' || !Number.isFinite(input.minutes) || input.minutes < 1) {
    throw httpError('Minutes must be a positive number', 400);
  }
  const [user, team] = await Promise.all([
    User.findById(input.userId),
    Team.findById(input.teamId),
  ]);
  if (!user) throw httpError('User not found', 404);
  if (!team) throw httpError('Team not found', 404);

  return Activity.create({
    user: user._id,
    team: team._id,
    type: input.type.trim(),
    minutes: input.minutes,
    points: input.minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  const input = (_input ?? {}) as TeamInput;
  if (typeof input.name !== 'string' || !input.name.trim()) throw httpError('A team name is required', 400);
  if (typeof input.mascot !== 'string' || !input.mascot.trim()) throw httpError('A team mascot is required', 400);

  let memberIds: mongoose.Types.ObjectId[] = [];
  if (input.members !== undefined) {
    if (!Array.isArray(input.members) || input.members.some((id) => !isObjectId(id))) {
      throw httpError('Team members must be valid user IDs', 400);
    }
    memberIds = input.members.map((id) => new mongoose.Types.ObjectId(id));
  }

  return Team.create({ name: input.name.trim(), mascot: input.mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const teams = await Team.find().lean();
  const activities = await Activity.find().lean();
  const totals = new Map<string, number>();
  for (const activity of activities) {
    const teamId = activity.team.toString();
    totals.set(teamId, (totals.get(teamId) ?? 0) + activity.points);
  }
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: totals.get(team._id.toString()) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(_userEmail: string) {
  const email = decodeURIComponent(_userEmail).trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) throw httpError('User not found', 404);

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 });
  const focus = recentActivity?.type === 'run' || user.fitnessGoal === 'endurance'
    ? 'endurance'
    : recentActivity?.type === 'strength' || user.fitnessGoal === 'strength'
      ? 'strength'
      : user.fitnessGoal;

  const matching = await Workout.find({ focus }).lean();
  if (matching.length > 0) {
    const reason = recentActivity
      ? `Based on your recent ${recentActivity.type} activity and ${focus} goal`
      : `Based on your ${focus} fitness goal`;
    return matching.map((workout) => ({ ...workout, reason }));
  }
  const fallback = await Workout.find().lean();
  return fallback.map((workout) => ({
    ...workout,
    reason: `A suggestion matched to your ${focus} activity pattern`,
  }));
}

export { User };
