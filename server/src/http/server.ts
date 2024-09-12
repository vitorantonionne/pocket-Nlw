import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z, { string } from 'zod'
import { createGoal } from '../futures/create-goal'
import { getWeekPendingGoals } from '../futures/get-week-pending-goals'
import { createGoalCompletion } from '../futures/create-goal-completion'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/pending-goals', async () => {
  const { pendingGoals } = await getWeekPendingGoals()

  return { pendingGoals }
})

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeekLyFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async request => {
    const { title, desiredWeekLyFrequency } = request.body

    await createGoal({
      title,
      desiredWeekLyFrequency,
    })
  }
)

app.post(
  '/completions',
  {
    schema: {
      body: z.object({
        goalId: z.string(),
      }),
    },
  },
  async request => {
    const { goalId } = request.body

    await createGoalCompletion({
      goalId,
    })
  }
)

app
  .listen({
    port: 3333,
  })
  .then(response => {
    console.log('Nice server running')
  })
