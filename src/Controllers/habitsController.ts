import { type Request, type Response } from "express"

import { habitModel } from "../Models/habitModel"
export class HabitsController {
  public store = async (
    request: Request,
    response: Response,
  ): Promise<Response> => {
    const { name } = request.body

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
