import dayjs from "dayjs"
import { type Request, type Response } from "express"
import { z } from "zod"

import { habitModel } from "../Models/habitModel"
import { builValidationErrorMessage } from "../Utils/build.validation.error.message"
export class HabitsController {
  public store = async (
    request: Request,
    response: Response,
  ): Promise<Response> => {
    const schema = z.object({
      name: z.string(), // tipamos o name como uma string utilizando Zod, tal qual utilizamos com YUP
    })

    const habit = schema.safeParse(
      // conforme documentaçõ do Zod, precisamos usar o safeParse para trazer mensagens mais detalhadas do problema
      request.body, // não estruturamos o name, pegamos todo o request.body
    )

    if (!habit.success) {
      // aqui caso não seja trazido true no succcess do zod, ele manda essa mensagem de erro
      const errors = builValidationErrorMessage(habit.error.issues)
      return response.status(422).json({ message: errors }) // caso de tudo certo ele continua a aplicação abaixo
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

  public index = async (request: Request, response: Response) => {
    const habits = await habitModel.find().sort({ name: 1 }) // utilizamos o sort para trazer tudo em ordem alfabética, utilizamos o name: 1 para ser crescente e o -1 em decrescente;

    return response.status(200).json(habits)
  }

  public delete = async (request: Request, response: Response) => {
    const schema = z.object({
      id: z.string(), // tipamos o name como uma string utilizando Zod, tal qual utilizamos com YUP
    })

    const habit = schema.safeParse(
      // conforme documentaçõ do Zod, precisamos usar o safeParse para trazer mensagens mais detalhadas do problema
      request.params, // pegamos do request params pq é onde está o id
    )

    if (!habit.success) {
      // aqui caso não seja trazido true no succcess do zod, ele manda essa mensagem de erro
      const errors = builValidationErrorMessage(habit.error.issues)
      return response.status(422).json({ message: errors }) // caso de tudo certo ele continua a aplicação abaixo
    }

    const findHabit = await habitModel.findOne({ _id: habit.data.id }) // Vamos procurar se tem algum nome igual

    if (!findHabit) {
      return response.status(404).json({ message: "Habit not found" })
    } // se não tiver nome igual ele segue o baile

    await habitModel.deleteOne({
      _id: habit.data.id,
    })

    return response.status(204).send()
  }

  public toggle = async (request: Request, response: Response) => {
    const schema = z.object({
      id: z.string(), // tipamos o name como uma string utilizando Zod, tal qual utilizamos com YUP
    })

    const validated = schema.safeParse(
      // conforme documentaçõ do Zod, precisamos usar o safeParse para trazer mensagens mais detalhadas do problema
      request.params, // pegamos do request params pq é onde está o id
    )

    if (!validated.success) {
      // aqui caso não seja trazido true no succcess do zod, ele manda essa mensagem de erro
      const errors = builValidationErrorMessage(validated.error.issues)
      return response.status(422).json({ message: errors }) // caso de tudo certo ele continua a aplicação abaixo
    }

    const findHabit = await habitModel.findOne({ _id: validated.data.id }) // Vamos procurar se tem algum nome igual

    if (!findHabit) {
      return response.status(404).json({ message: "Habit not found" })
    } // se não tiver nome igual ele segue o baile

    console.log(findHabit)

    const now = dayjs().startOf("day").toISOString() // cria um objeto de data, baseado no agora, mas vamos pegar o inicio do dia(startof),
    // nesta app não faz sentido ter o horário. Precisamos padronizar o horário para que ele nas próximas funcões ele compare se está igual ou não, independente da hora que eu marquei.

    const isHabitCompletedOnDate = findHabit
      .toObject()
      ?.completedDates.find((item) => dayjs(String(item)).toISOString() === now)

    if (isHabitCompletedOnDate) {
      const habitUpdated = await habitModel.findOneAndUpdate(
        {
          _id: validated.data.id,
        },
        {
          $pull: {
            completedDates: now,
          },
        },
        {
          returnDocument: "after",
        },
      )
      return response.status(200).json(habitUpdated)
    }
    const habitUpdated = await habitModel.findOneAndUpdate(
      {
        _id: validated.data.id,
      },
      {
        $push: {
          completedDates: now,
        },
      },
      {
        returnDocument: "after",
      },
    )
    return response.status(200).json(habitUpdated)
  }
}
