import { type Request, type Response } from "express"
import { z } from "zod"

import { habitModel } from "../Models/habitModel"
export class HabitsController {
  public store = async (
    request: Request,
    response: Response,
  ): Promise<Response> => {
    const schema = z.object({
      name: z.string(), // tipamos o name como uma string utilizando Zod, tal qual utilizamos com YUP
    })

    const { name } = request.body

    const habit = schema.safeParse({
      // conforme documentaçõ do Zod, precisamos usar o safeParse para trazer mensagens mais detalhadas do problema
      name,
    })

    if (!habit.success) {
      // aqui caso não seja trazido true no succcess do zod, ele manda essa mensagem de erro
      return response.status(400).json({ message: "error on validation" }) // caso de tudo certo ele continua a aplicação abaixo
    }

    const findHabit = await habitModel.findOne({ name: habit.data.name }) // Vamos procurar se tem algum nome igual

    if (findHabit) {
      // Se tiver nome igual, retorna a mensagem
      return response.status(400).json({ message: "Habit already exists" })
    } // se não tiver nome igual ele segue o baile

    const newHabit = await habitModel.create({
      name: habit.data.name,
      completedDates: [],
    })

    return response.status(201).json(newHabit)
  }
}
