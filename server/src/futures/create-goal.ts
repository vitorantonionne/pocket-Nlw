import { db } from '../db'
import { goals } from '../db/schema'

interface CreateGoalRequest {
  title: string
  desiredWeekLyFrequency: number
}

export async function createGoal({
  title,
  desiredWeekLyFrequency,
}: CreateGoalRequest) {
  const result = await db.insert(goals).values({
    title,
    desiredWeekLyFrequency,
  })

  const goal = result[0]

  return {
    goal,
  }
}
