import { type Request, type Response } from "express"

interface Habit {
  name: string
}

export class HabitsController {
  private readonly habits: Habit[] = []

  public store = (request: Request, response: Response): Response => {
    const { name } = request.body

    // Verificando se 'name' foi fornecido e é uma string
    if (typeof name !== "string") {
      return response
        .status(400)
        .json({ error: "Name is required and must be a string" })
    }
    const newHabit: Habit = { name }

    this.habits.push(newHabit)

    return response.status(201).json(newHabit)
  }
}
