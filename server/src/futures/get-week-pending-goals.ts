import dayjs from 'dayjs'
import { db } from '../db'
import { and, lte, sql, count, gte, eq } from 'drizzle-orm'
import { goalCompletions, goals } from '../db/schema'

export async function getWeekPendingGoals() {
  const firstDAyOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalCreatedUpToWeek = db.$with('goals_created_hp_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeekLyFrequency: goals.desiredWeekLyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDAyOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const pendingGoals = await db
    .with(goalCreatedUpToWeek, goalCompletionCounts)
    .select({
      id: goalCreatedUpToWeek.id,
      title: goalCreatedUpToWeek.title,
      desiredWeekLyFrequency: goalCreatedUpToWeek.desiredWeekLyFrequency,
      completionCount: sql /*sql*/`
        COALESCE(${goalCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalCreatedUpToWeek)
    .leftJoin(
      goalCompletionCounts,
      eq(goalCompletionCounts.goalId, goalCreatedUpToWeek.id)
    )

  return {
    pendingGoals,
  }
}
