import { type Request, type Response } from "express"

import { habitModel } from "../Models/habitModel"
export class HabitsController {
  public store = async (
    request: Request,
    response: Response,
  ): Promise<Response> => {
    const { name } = request.body

    const findHabit = await habitModel.findOne({ name }) // Vamos procurar se tem algum nome igual

    if (findHabit) {
      // Se tiver nome igual, retorna a mensagem
      return response.status(400).json({ message: "Habit already exists" })
    }

    // Verificando se 'name' foi fornecido e é uma string
    if (typeof name !== "string") {
      return response
        .status(400)
        .json({ error: "Name is required and must be a string" })
    }
    const newHabit = await habitModel.create({
      name,
      completedDates: [],
    })

    return response.status(201).json(newHabit)
  }
}
